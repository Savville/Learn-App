const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/public.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Inject name and isAnonymous into crowdfund POST
const repl1 = `// Initiate STK Push (Public Crowdfunding for Projects/Hackathons)
router.post('/payments/crowdfund', async (req, res) => {
  try {
    const { amount, phone, opportunityId, name, isAnonymous } = req.body;`;

content = content.replace(/\/\/ Initiate STK Push \(Public Crowdfunding for Projects\/Hackathons\)\r?\nrouter\.post\('\/payments\/crowdfund', async \(req, res\) => \{\r?\n  try \{\r?\n    const \{ amount, phone, opportunityId \} = req\.body;/g, repl1);

// 2. Inject contributorName into insertOne
const repl2 = `    // Log transaction so the webhook can find it
    await db.collection('transactions').insertOne({
      opportunityId,
      contributorName: isAnonymous ? 'Anonymous' : (name || 'Anonymous'),
      contributorPhone: phone,
      amount,`;

content = content.replace(/    \/\/ Log transaction so the webhook can find it\r?\n    await db\.collection\('transactions'\)\.insertOne\(\{\r?\n      opportunityId,\r?\n      contributorPhone: phone,\r?\n      amount,/g, repl2);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated backend public.js with Regex');
