import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let db;

export async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    
    await client.connect();
    db = client.db('learn_opportunities');
    console.log('✅ Connected to MongoDB');

    // Create indexes for fast queries
    const opps = db.collection('opportunities');
    await opps.createIndex({ category: 1, dateAdded: -1 });
    await opps.createIndex({ id: 1 }, { unique: true });
    await opps.createIndex({ fundingType: 1 });
    await opps.createIndex({ 'eligibility.educationLevel': 1 });
    await opps.createIndex(
      { title: 'text', description: 'text', provider: 'text' },
      { weights: { title: 10, provider: 5, description: 1 } }
    );
    console.log('✅ Indexes ensured');

    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
