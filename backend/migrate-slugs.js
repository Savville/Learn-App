import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('opportunities');
    
    const cursor = collection.find({ slug: { $exists: false } });
    const docs = await cursor.toArray();
    console.log(`Found ${docs.length} opportunities without slugs.`);

    for (const doc of docs) {
      const slug = slugify(doc.title || '');
      await collection.updateOne({ _id: doc._id }, { $set: { slug } });
      console.log(`Updated: ${doc.title} -> ${slug}`);
    }

    console.log('Migration complete!');
  } finally {
    await client.close();
  }
}

migrate();
