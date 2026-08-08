require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("No MONGODB_URI found in .env");
  
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn_opportunities');
  
  // 1. Map old transaction IDs to the new project IDs
  
  // Find the new project IDs
  const hydroProject = await db.collection('projects').findOne({ title: /Hydro-Guard/i });
  const geoProject = await db.collection('projects').findOne({ title: /Geo-Bind/i });
  
  if (hydroProject) {
    const res1 = await db.collection('transactions').updateMany(
      { opportunityId: { $in: ['hydro-guard-concrete', 'pub-1782502859555-3'] } },
      { $set: { opportunityId: hydroProject._id.toString() } }
    );
    console.log(`Mapped ${res1.modifiedCount} transactions to Hydro-Guard.`);
  }

  if (geoProject) {
    const res2 = await db.collection('transactions').updateMany(
      { opportunityId: { $in: ['alkali-activated-binders', 'pub-1782502859555-2'] } },
      { $set: { opportunityId: geoProject._id.toString() } }
    );
    console.log(`Mapped ${res2.modifiedCount} transactions to Geo-Bind.`);
  }
  
  // 2. Re-calculate and update the funding on projects
  async function updateProjectFunding(project, escrowAmount) {
    if (!project) return;
    
    // Check if there are transactions
    const txs = await db.collection('transactions').aggregate([
      { $match: { opportunityId: project._id.toString(), type: 'crowdfund', status: 'completed' } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]).toArray();
    
    const fundedAmount = txs.length > 0 ? txs[0].totalAmount : 0;
    
    await db.collection('projects').updateOne(
      { _id: project._id },
      { 
        $set: { 
          escrowAmount, 
          fundedAmount, 
          fundingGoal: escrowAmount,
          userEmail: 'ochiwilliamotieno@gmail.com',
          authorName: 'William Otieno'
        } 
      }
    );
    console.log(`Updated ${project.title} -> Escrow: ${escrowAmount}, Funded: ${fundedAmount}`);
  }

  await updateProjectFunding(hydroProject, 15000);
  await updateProjectFunding(geoProject, 12000);
  
  await client.close();
}

run();
