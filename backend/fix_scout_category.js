import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    const opportunities = db.collection('opportunities');

    // Update the rental scout category to Gig
    const result = await opportunities.updateOne(
      { id: 'ku-area-rental-scout-project-2026' },
      { $set: { category: 'Gig' } }
    );
    
    console.log(`Matched ${result.matchedCount}, Modified ${result.modifiedCount}`);
  } finally {
    await client.close();
  }
}

run();
