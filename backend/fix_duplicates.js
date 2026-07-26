import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function fixDuplicates() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("No MONGODB_URI");
  
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    const appsColl = db.collection('applications');

    // Delete records where oppId is undefined/null and postId is set
    const res = await appsColl.deleteMany({
      $or: [
        { opportunityId: { $exists: false } },
        { opportunityId: null }
      ]
    });
    console.log(`Deleted ${res.deletedCount} duplicate/legacy application(s) with no opportunityId`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

fixDuplicates();
