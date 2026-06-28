const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/public.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add querySTKPush import
if (!content.includes('querySTKPush')) {
  content = content.replace(
    /const { initiateSTKPush } = await import\('\.\.\/services\/mpesaService\.js'\);/g,
    "const { initiateSTKPush, querySTKPush } = await import('../services/mpesaService.js');"
  );
  // Also we might need to import it at the top or inside the route.
}

// Let's just create a helper block at the top of the routes to handle STK queries.
const queryLogic = `
async function checkDarajaStatus(checkoutRequestId, expectedType, db) {
  const tx = await db.collection('transactions').findOne({ checkoutRequestId, type: expectedType });
  if (!tx) return { status: 404, json: { error: 'Transaction not found' } };
  if (tx.status !== 'pending') {
    return { status: 200, json: { status: tx.status, amountPaid: tx.amountPaid || tx.amount, resultDesc: tx.resultDesc } };
  }

  // It's pending locally. Query Safaricom.
  const { querySTKPush } = await import('../services/mpesaService.js');
  const queryRes = await querySTKPush(checkoutRequestId);
  
  if (queryRes.success && queryRes.data) {
    const resultCode = String(queryRes.data.ResultCode);
    if (resultCode === "0") {
      // Success
      await handleSuccessfulPayment(checkoutRequestId, db, queryRes.data.ResultDesc || 'Completed via Query');
      const updatedTx = await db.collection('transactions').findOne({ checkoutRequestId });
      return { status: 200, json: { status: 'completed', amountPaid: updatedTx.amount, resultDesc: updatedTx.resultDesc } };
    } else if (resultCode === "1032") {
      // Cancelled
      await db.collection('transactions').updateOne({ checkoutRequestId }, { $set: { status: 'failed', failReason: 'User cancelled' } });
      return { status: 200, json: { status: 'failed', resultDesc: 'User cancelled' } };
    } else if (resultCode === "1037") {
      // Timeout
      await db.collection('transactions').updateOne({ checkoutRequestId }, { $set: { status: 'failed', failReason: 'Timeout' } });
      return { status: 200, json: { status: 'failed', resultDesc: 'Timeout' } };
    } else if (resultCode !== undefined) {
      // Other failures (e.g. 1 = Insufficient funds)
      await db.collection('transactions').updateOne({ checkoutRequestId }, { $set: { status: 'failed', failReason: queryRes.data.ResultDesc } });
      return { status: 200, json: { status: 'failed', resultDesc: queryRes.data.ResultDesc } };
    }
  }
  
  // Safaricom threw an error (e.g. "The transaction is being processed" meaning still pending)
  return { status: 200, json: { status: 'pending' } };
}

async function handleSuccessfulPayment(checkoutRequestId, db, resultDesc) {
  const tx = await db.collection('transactions').findOne({ checkoutRequestId, status: 'pending' });
  if (!tx) return;

  await db.collection('transactions').updateOne(
    { checkoutRequestId },
    { $set: { status: 'completed', resultDesc, completedAt: new Date() } }
  );

  if (tx.type === 'crowdfund') {
    await db.collection('opportunities').updateOne(
      { id: tx.opportunityId },
      { $inc: { fundedAmount: tx.amount } }
    );
  } else if (tx.type === 'escrow') {
    await db.collection('pending_opportunities').updateOne(
      { 'opportunity.id': tx.opportunityId },
      { $set: { isEscrowFunded: true, escrowAmount: tx.amount, status: 'EscrowHeld' } }
    );
    await db.collection('opportunities').updateOne(
      { id: tx.opportunityId },
      { $set: { isEscrowFunded: true, escrowAmount: tx.amount } }
    );
    if (tx.applicationId) {
      const { ObjectId } = await import('mongodb');
      await db.collection('applications').updateOne(
        { _id: new ObjectId(tx.applicationId) },
        { $set: { status: 'approved', escrowFunded: true, updatedAt: new Date() } }
      );
    }
  }
}
`;

if (!content.includes('checkDarajaStatus')) {
  content = content.replace('const router = express.Router();', 'const router = express.Router();\n' + queryLogic);
}

// Replace crowdfund status route
const cfRouteRegex = /\/\/ GET \/api\/public\/payments\/crowdfund\/status\/:checkoutRequestId \(Public Polling\)\r?\nrouter\.get\('\/payments\/crowdfund\/status\/:checkoutRequestId', async \(req, res\) => \{[\s\S]*?\}\);/g;
const cfRouteRepl = `// GET /api/public/payments/crowdfund/status/:checkoutRequestId (Public Polling)
router.get('/payments/crowdfund/status/:checkoutRequestId', async (req, res) => {
  try {
    const db = getDB();
    const result = await checkDarajaStatus(req.params.checkoutRequestId, 'crowdfund', db);
    res.status(result.status).json(result.json);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`;
content = content.replace(cfRouteRegex, cfRouteRepl);

// Replace escrow status route
const esRouteRegex = /\/\/ GET \/api\/public\/payments\/status\/:checkoutRequestId\r?\nrouter\.get\('\/payments\/status\/:checkoutRequestId', verifyUserToken, async \(req, res\) => \{[\s\S]*?\}\);/g;
const esRouteRepl = `// GET /api/public/payments/status/:checkoutRequestId
router.get('/payments/status/:checkoutRequestId', verifyUserToken, async (req, res) => {
  try {
    const db = getDB();
    const result = await checkDarajaStatus(req.params.checkoutRequestId, 'escrow', db);
    // Extra security check for escrow
    const tx = await db.collection('transactions').findOne({ checkoutRequestId: req.params.checkoutRequestId });
    if (tx && tx.posterEmail !== req.user.email) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.status(result.status).json(result.json);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`;
content = content.replace(esRouteRegex, esRouteRepl);

// Replace webhook callback to use handleSuccessfulPayment to fix the bug
const webhookRegex = /\/\/ Daraja Webhook Callback[\s\S]*?res\.status\(200\)\.send\('Webhook Processed'\);\r?\n  \} catch \(error\) \{/g;
const webhookRepl = `// Daraja Webhook Callback (Safaricom calls this silently)
router.post('/payments/mpesa/callback', async (req, res) => {
  try {
    const callbackData = req.body?.Body?.stkCallback;
    if (!callbackData) return res.status(200).send('OK');

    const db = getDB();
    const checkoutRequestId = callbackData.CheckoutRequestID;
    if (!checkoutRequestId) return res.status(200).send('OK');

    const existingTx = await db.collection('transactions').findOne({ checkoutRequestId, status: 'pending' });
    if (!existingTx) return res.status(200).send('OK');

    if (callbackData.ResultCode === 0) {
      const meta = callbackData.CallbackMetadata?.Item || [];
      const amountPaid = meta.find(i => i.Name === 'Amount')?.Value;
      if (amountPaid && existingTx.amount && Number(amountPaid) < Number(existingTx.amount)) {
        await db.collection('transactions').updateOne(
          { checkoutRequestId },
          { $set: { status: 'failed', failReason: 'Amount mismatch', completedAt: new Date() } }
        );
        return res.status(200).send('OK');
      }
      await handleSuccessfulPayment(checkoutRequestId, db, 'Completed via Webhook');
    } else {
      await db.collection('transactions').updateOne(
        { checkoutRequestId },
        { $set: { status: 'failed', failReason: callbackData.ResultDesc, completedAt: new Date() } }
      );
    }
    res.status(200).send('Webhook Processed');
  } catch (error) {`;
content = content.replace(webhookRegex, webhookRepl);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed public.js routing and webhooks');
