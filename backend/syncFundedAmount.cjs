const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    
    // Get all completed crowdfund transactions
    const transactions = await db.collection('transactions').find({ type: 'crowdfund', status: 'completed' }).toArray();
    
    // Group by opportunityId
    const sums = {};
    for (const tx of transactions) {
      if (!sums[tx.opportunityId]) sums[tx.opportunityId] = 0;
      sums[tx.opportunityId] += Number(tx.amountPaid || tx.amount);
    }
    
    console.log('Calculated sums from transactions:', sums);
    
    // Update each opportunity
    for (const [oppId, total] of Object.entries(sums)) {
      await db.collection('opportunities').updateOne(
        { id: oppId },
        { $set: { fundedAmount: total } }
      );
      console.log(`Updated opportunity ${oppId} with fundedAmount: ${total}`);
    }
    
    console.log('DB sync complete.');
  } finally {
    await client.close();
  }
}

run();
