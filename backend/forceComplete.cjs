const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    
    // Find the user's pending transaction
    const tx = await db.collection('transactions').findOne({ contributorPhone: '254710731021', type: 'crowdfund', status: 'pending' });
    if (tx) {
      await db.collection('transactions').updateOne(
        { _id: tx._id },
        { $set: { status: 'completed', contributorName: 'Anonymous' } }
      );
      
      // Increment the fundedAmount in opportunities
      await db.collection('opportunities').updateOne(
        { id: tx.opportunityId },
        { $inc: { fundedAmount: tx.amount } }
      );
      console.log('Successfully completed transaction for', tx.opportunityId);
    } else {
      console.log('No pending transaction found');
    }
  } finally {
    await client.close();
  }
}

run();
