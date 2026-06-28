const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    
    // Find the Geo-Bind pending transaction
    const tx = await db.collection('transactions').findOne({ opportunityId: 'pub-1782502859555-2', status: 'pending' });
    if (tx) {
      await db.collection('transactions').updateOne(
        { _id: tx._id },
        { $set: { status: 'completed' } } // it already has contributorName: 'Anonymous'
      );
      
      // Increment the fundedAmount in opportunities
      await db.collection('opportunities').updateOne(
        { id: tx.opportunityId },
        { $inc: { fundedAmount: tx.amount } }
      );
      console.log('Successfully completed transaction for Geo-Bind', tx.opportunityId);
    } else {
      console.log('No pending transaction found for Geo-Bind');
    }
  } finally {
    await client.close();
  }
}

run();
