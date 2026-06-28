const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/services/mpesaService.js');
let content = fs.readFileSync(filePath, 'utf8');

const queryFunction = `
/**
 * Query STK Push Status
 * @param {string} checkoutRequestId 
 */
export async function querySTKPush(checkoutRequestId) {
  try {
    const token = await getOAuthToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(\`\${SHORTCODE}\${PASSKEY}\${timestamp}\`).toString('base64');

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    const response = await fetch(\`\${BASE_URL}/mpesa/stkpushquery/v1/query\`, {
      method: 'POST',
      headers: {
        Authorization: \`Bearer \${token}\`,
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
`;

if (!content.includes('querySTKPush')) {
  content = content.replace('// Refurbished', queryFunction + '\n// Refurbished');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Appended querySTKPush');
} else {
  console.log('querySTKPush already exists');
}
