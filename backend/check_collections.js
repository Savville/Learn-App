import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db('learn_opportunities');
  
  const trans = await db.collection('transactions').find().toArray();
  const cont = await db.collection('contributors').find().toArray();
  
  console.log('Transactions:', JSON.stringify(trans, null, 2));
  console.log('Contributors:', JSON.stringify(cont, null, 2));

  await c.close();
}

run();
