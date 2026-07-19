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

    // Update views in MongoDB to anchor them
    await opportunities.updateOne({ id: 'ku-area-rental-scout-project-2026' }, { $set: { views: 40 } });
    await opportunities.updateOne({ id: 'hydro-guard-concrete' }, { $set: { views: 26 } });
    await opportunities.updateOne({ id: 'alkali-activated-binders' }, { $set: { views: 30 } });
    
    console.log('Successfully updated views in MongoDB');
  } finally {
    await client.close();
  }
}

run();
