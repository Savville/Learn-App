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
    const now = new Date().toISOString();
    
    const docs = await db.collection('opportunities').find({ deadline: { $lt: now } }).toArray();
    console.log('Expired count:', docs.length);
    docs.slice(0, 5).forEach(d => console.log('- ' + d.title + ' (Deadline: ' + d.deadline + ')'));
    
  } finally {
    await client.close();
  }
}

run();
