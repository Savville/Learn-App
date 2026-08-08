import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    // Find ALL opportunities
    const opps = await db.collection('opportunities').find({}).toArray();
    
    // Search anywhere for 'otieno' or 'william'
    const userOpps = opps.filter(o => JSON.stringify(o).toLowerCase().includes('otieno') || JSON.stringify(o).toLowerCase().includes('william'));
    console.log(`Found ${userOpps.length} opportunities mentioning otieno or william.`);
    
    for (const opp of userOpps) {
      console.log(`- Title: ${opp.title}`);
      console.log(`  userEmail: ${opp.userEmail}`);
      console.log(`  contactEmail: ${opp.contactEmail}`);
      console.log(`  postedBy: ${opp.postedBy}`);
      if (opp.reporter) {
         console.log(`  reporter.email: ${opp.reporter.email}`);
      }
      
      // Fix missing userEmail
      await db.collection('opportunities').updateOne(
        { _id: opp._id },
        { $set: { userEmail: 'ochiwlliamotieno@gmail.com', postedBy: 'ochiwlliamotieno@gmail.com' } }
      );
      console.log('  -> Updated userEmail & postedBy in DB to ochiwlliamotieno@gmail.com');
    }

  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
run();
