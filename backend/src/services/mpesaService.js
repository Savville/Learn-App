import crypto from 'crypto';

// Sandbox Credentials
const DARAJA_ENV = process.env.DARAJA_ENV || 'sandbox';
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || 'your_sandbox_consumer_key';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'your_sandbox_consumer_secret';
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379'; // Sandbox Paybill
const PASSKEY = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

const BASE_URL = DARAJA_ENV === 'production' 
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

// Refurbished
