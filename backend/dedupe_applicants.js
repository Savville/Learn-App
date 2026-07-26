import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config(); // Loads .env from current directory (backend)

async function dedupe() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in .env");
    process.exit(1);
  }
  
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db('learn_opportunities');
    const appsColl = db.collection('applications');

    // Fetch all applications, sorted by newest first
    const apps = await appsColl.find({}).sort({ appliedAt: -1 }).toArray();
    console.log(`Found ${apps.length} total applications`);
    
    const seen = new Set();
    const toDelete = [];

    for (const app of apps) {
      // Create a unique key per user per job
      const key = `${app.opportunityId}_${app.applicantEmail}`;
      if (seen.has(key)) {
        toDelete.push(app._id);
      } else {
        seen.add(key);
      }
    }

    console.log(`Found ${toDelete.length} duplicates to delete`);
    if (toDelete.length > 0) {
      const res = await appsColl.deleteMany({ _id: { $in: toDelete } });
      console.log(`Deleted ${res.deletedCount} duplicate application(s) successfully`);
    } else {
      console.log("No duplicates found");
    }
  } catch (error) {
    console.error("Error deduplicating:", error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

dedupe();
