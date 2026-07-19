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
  
  const re = await db.collection('opportunities').find({title: /RE/i}).toArray();
  const rentalScout = await db.collection('opportunities').find({title: /Rental Scout/i}).toArray();
  const hydro = await db.collection('opportunities').find({title: /Hydro-Guard|hydrophobic/i}).toArray();
  const geo = await db.collection('opportunities').find({title: /Geopolymer|Geo-Bind/i}).toArray();
  
  console.log('RE Matches:', re.map(x => x.title));
  console.log('Rental Scout:', rentalScout.map(x => x.title));
  console.log('Hydro:', hydro.map(x => x.title));
  console.log('Geo:', geo.map(x => x.title));
  
  // Also check pending opportunities
  const pending = await db.collection('pending_opportunities').find({
      $or: [
          { title: /Hydro-Guard|hydrophobic/i },
          { title: /Geopolymer|Geo-Bind/i },
          { description: /Hydro-Guard|Geopolymer/i }
      ]
  }).toArray();
  console.log('\nPending Opportunities Match:', pending.map(x => ({title: x.title, reporter: x.reporter})));

  await c.close();
}

run();
