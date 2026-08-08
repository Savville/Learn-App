import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/learn-opportunities';
  console.log('Connecting to', uri.split('@')[1] || uri);
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    // Update opportunities
    const r1 = await db.collection('opportunities').updateMany(
      { userEmail: 'ochiwilliamotieno@gmail.com' },
      { $set: { userEmail: 'ochiwlliamotieno@gmail.com' } }
    );
    console.log('Updated opportunities:', r1.modifiedCount);

    // Update applications (pitcher)
    const r2 = await db.collection('applications').updateMany(
      { applicantEmail: 'ochiwilliamotieno@gmail.com' },
      { $set: { applicantEmail: 'ochiwlliamotieno@gmail.com' } }
    );
    console.log('Updated applications:', r2.modifiedCount);

  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
run();
