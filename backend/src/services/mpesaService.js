import crypto from 'crypto';

// Environment Setup
const DARAJA_ENV = process.env.DARAJA_ENV || 'sandbox';
const isProduction = DARAJA_ENV === 'production';

// In production, these must come from environment variables. In sandbox, fall back to defaults.
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || (isProduction ? '' : 'your_sandbox_consumer_key');
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || (isProduction ? '' : 'your_sandbox_consumer_secret');
const SHORTCODE = process.env.MPESA_SHORTCODE || (isProduction ? '' : '174379'); 
const PASSKEY = process.env.MPESA_PASSKEY || (isProduction ? '' : 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919');
const B2C_INITIATOR_NAME = process.env.MPESA_B2C_INITIATOR || 'testapi';
const B2C_INITIATOR_PASSWORD = process.env.MPESA_B2C_PASSWORD || 'Safaricom999!*!';

// Validate production environment to ensure sandbox defaults don't slip in
if (isProduction) {
  if (!CONSUMER_KEY || !CONSUMER_SECRET || !SHORTCODE || !PASSKEY) {
    console.error('❌ CRITICAL: Missing Daraja M-PESA environment variables in production!');
    process.exit(1);
  }
}

const BASE_URL = isProduction
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

/**
 * Generate OAuth Token from Daraja
 */
async function getOAuthToken() {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

  try {
    const response = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!response.ok) throw new Error(`OAuth failed: ${response.statusText}`);
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Daraja OAuth Error:', error);
    throw error;
  }
}

/**
 * Initiate STK Push (Lipa Na M-PESA Online)
 * @param {string} phone - Safaricom phone number (format: 2547...)
 * @param {number} amount - Amount in KES
 * @param {string} reference - Account reference (e.g., Job ID)
 * @param {string} description - Transaction description
 */
export async function initiateSTKPush(phone, amount, reference, description) {
  try {
    const token = await getOAuthToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14); // YYYYMMDDHHmmss
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    // Your backend needs a public URL so Safaricom can send the callback
    // In dev, you'd use Ngrok. In production, your actual domain.
    const callbackUrl = process.env.BACKEND_API_URL
      ? `${process.env.BACKEND_API_URL}/public/payments/mpesa/callback`
      : 'https://your-domain.com/api/public/payments/mpesa/callback';

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount).toString(),
      PartyA: phone, // The customer phone number
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: reference.substring(0, 12),
      TransactionDesc: description.substring(0, 13)
    };

    const response = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || data.errorMessage) {
      throw new Error(data.errorMessage || 'STK Push failed');
    }

    // data contains CheckoutRequestID which we use to track the transaction
    return { success: true, data };
  } catch (error) {
    console.error('STK Push Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate Security Credential for B2C
 */
function generateSecurityCredential(plaintext) {
  try {
    const fs = require('fs');
    const path = require('path');
    const certPath = process.env.DARAJA_CERT_PATH || path.join(__dirname, '..', '..', 'SandboxCertificate.cer');
    
    if (!fs.existsSync(certPath)) {
      console.warn('⚠️ SandboxCertificate.cer not found! Mocking SecurityCredential for Sandbox.');
      return Buffer.from('mock_encrypted_password_for_sandbox').toString('base64');
    }
    
    const cert = fs.readFileSync(certPath, 'utf8');
    const buffer = Buffer.from(plaintext, 'utf8');
    const encrypted = crypto.publicEncrypt({
      key: cert,
      padding: crypto.constants.RSA_PKCS1_PADDING
    }, buffer);
    
    return encrypted.toString('base64');
  } catch (error) {
    console.error('Failed to generate Security Credential:', error);
    return Buffer.from('mock_encrypted_password_for_sandbox').toString('base64');
  }
}

/**
 * Initiate B2C Payout
 * @param {string} phone - Freelancer/Receiver phone number
 * @param {number} amount - Amount in KES to send
 * @param {string} remarks - Description or ID
 */
export async function initiateB2CPayout(phone, amount, remarks) {
  try {
    const token = await getOAuthToken();
    const securityCredential = generateSecurityCredential(B2C_INITIATOR_PASSWORD);

    const callbackUrl = process.env.BACKEND_API_URL
      ? `${process.env.BACKEND_API_URL}/public/payments/mpesa/b2c/result`
      : 'https://your-domain.com/api/public/payments/mpesa/b2c/result';
    const timeoutUrl = process.env.BACKEND_API_URL
      ? `${process.env.BACKEND_API_URL}/public/payments/mpesa/b2c/timeout`
      : 'https://your-domain.com/api/public/payments/mpesa/b2c/timeout';

    const payload = {
      InitiatorName: B2C_INITIATOR_NAME,
      SecurityCredential: securityCredential,
      CommandID: 'BusinessPayment', // or SalaryPayment/PromotionPayment
      Amount: Math.ceil(amount).toString(),
      PartyA: SHORTCODE, // Sender (Your Till/Shortcode)
      PartyB: phone,     // Receiver
      Remarks: remarks.substring(0, 100),
      QueueTimeOutURL: timeoutUrl,
      ResultURL: callbackUrl,
      Occasion: 'Escrow Payout'
    };

    const response = await fetch(`${BASE_URL}/mpesa/b2c/v1/paymentrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || data.errorMessage) {
      throw new Error(data.errorMessage || 'B2C Payout failed');
    }

    // data contains ConversationID and OriginatorConversationID
    return { success: true, data };
  } catch (error) {
    console.error('B2C Payout Error:', error);
    return { success: false, error: error.message };
  }
}


/**
 * Query STK Push Status
 * @param {string} checkoutRequestId 
 */
export async function querySTKPush(checkoutRequestId) {
  try {
    const token = await getOAuthToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    const response = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error('STK Query Error:', error);
    return { success: false, error: error.message };
  }
}

// Refurbished
