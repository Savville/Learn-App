const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/public.js');
let content = fs.readFileSync(filePath, 'utf8');

const repl = `
// GET /api/public/opportunities/:id/contributors (Public Aggregation)
router.get('/opportunities/:id/contributors', async (req, res) => {
  try {
    const db = getDB();
    const opportunityId = req.params.id;
    const contributors = await db.collection('transactions').aggregate([
      { $match: { opportunityId, type: 'crowdfund', status: 'completed' } },
      { $group: { _id: "$contributorName", amount: { $sum: "$amount" } } },
      { $project: { name: { $ifNull: ["$_id", "Anonymous"] }, amount: 1, _id: 0 } },
      { $sort: { amount: -1 } }
    ]).toArray();
    res.json(contributors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;`;

content = content.replace(/module\.exports = router;/g, repl);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Appended getContributors!');
