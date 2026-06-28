import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

// Restore known contributor data that was wiped by the destructive seed
const contributions = [
  {
    opportunityId: 'hydro-guard-concrete',
    fundedAmount: 2400,
    contributor: { name: 'Anonymous', amount: 2400 },
  },
  {
    opportunityId: 'alkali-activated-binders',
    fundedAmount: 1200,
    contributor: { name: 'Anonymous', amount: 1200 },
  },
];

async function restore() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    const opps = db.collection('opportunities');
    const contribs = db.collection('contributors');

    for (const c of contributions) {
      // Restore funded amount on the opportunity
      await opps.updateOne(
        { id: c.opportunityId },
        { $set: { fundedAmount: c.fundedAmount } }
      );
      console.log(`✅ Restored fundedAmount ${c.fundedAmount} on ${c.opportunityId}`);

      // Restore contributor record (avoid duplicates)
      await contribs.updateOne(
        { opportunityId: c.opportunityId, name: c.contributor.name, amount: c.contributor.amount },
        { $setOnInsert: { opportunityId: c.opportunityId, ...c.contributor, createdAt: new Date() } },
        { upsert: true }
      );
      console.log(`✅ Restored contributor record for ${c.opportunityId}`);
    }

    console.log('\n💰 All contributions restored successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

restore();
