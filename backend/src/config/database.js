import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let db;

export async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db('learn_opportunities');
    
    console.log('✅ Connected to MongoDB');
    
    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('opportunities')) {
      await db.createCollection('opportunities');
      console.log('📋 Created opportunities collection');
    }
    if (!collectionNames.includes('subscribers')) {
      await db.createCollection('subscribers');
      console.log('📋 Created subscribers collection');
    }
    if (!collectionNames.includes('analytics')) {
      await db.createCollection('analytics');
      console.log('📋 Created analytics collection');
    }
    if (!collectionNames.includes('ads')) {
      await db.createCollection('ads');
      console.log('📋 Created ads collection');
    }
    if (!collectionNames.includes('admins')) {
      await db.createCollection('admins');
      console.log('📋 Created admins collection');
    }
    
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
