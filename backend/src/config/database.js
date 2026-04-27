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
    // Organizations collection for verified posters
    const orgs = db.collection('organizations');
    await orgs.createIndex({ email: 1 }, { unique: true });

    const pending = db.collection('pending_opportunities');
    await pending.createIndex({ status: 1, submittedAt: -1 });
    await pending.createIndex({ 'reporter.email': 1 });

    const reports = db.collection('opportunity_reports');
    await reports.createIndex({ status: 1, submittedAt: -1 });
    await reports.createIndex({ opportunityId: 1, submittedAt: -1 });

    const applications = db.collection('applications');
    await applications.createIndex({ opportunityId: 1, appliedAt: -1 });
    await applications.createIndex({ applicantEmail: 1, appliedAt: -1 });

    const authOtps = db.collection('auth_otps');
    await authOtps.createIndex({ email: 1 });
    await authOtps.createIndex({ createdAt: 1 }, { expireAfterSeconds: 600 }); // Expires after 10 mins

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

// Refurbished
