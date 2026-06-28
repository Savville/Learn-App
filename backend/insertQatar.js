import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('learn_opportunities');
    const collection = db.collection('opportunities');

    const filePath = path.join(__dirname, '..', 'OPPORTUNITIES', 'startup-qatar-investment-program.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Usually JSON has an array or a single object.
    const ops = Array.isArray(data) ? data : [data];

    for (const op of ops) {
      await collection.updateOne(
        { id: op.id },
        { $set: op },
        { upsert: true }
      );
      console.log(`Upserted: ${op.id} - ${op.title}`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('Disconnected');
  }
}

main();
