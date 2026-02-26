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
