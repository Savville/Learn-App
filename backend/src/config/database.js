import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let db = null;

export async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: false,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
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
    await authOtps.createIndex({ createdAt: 1 }, { expireAfterSeconds: 600 });

    // Transaction indexes for fast webhook lookups and admin viewer
    const transactions = db.collection('transactions');
    await transactions.createIndex({ checkoutRequestId: 1 }, { sparse: true });
    await transactions.createIndex({ conversationId: 1 }, { sparse: true });
    await transactions.createIndex({ opportunityId: 1, createdAt: -1 });
    await transactions.createIndex({ type: 1, status: 1 });
    await transactions.createIndex({ amount: 1 });
    await transactions.createIndex({ userId: 1, createdAt: -1 }, { sparse: true });
    await transactions.createIndex({ status: 1, createdAt: -1 });

    console.log('✅ Indexes ensured');
    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('🔄 Retrying in 5 seconds...');
    // Retry instead of crashing the whole server
    await new Promise(resolve => setTimeout(resolve, 5000));
    return connectDB();
  }
}

export function getDB() {
  if (!db) {
    throw new Error('Database not ready yet — please retry in a moment.');
  }
  return db;
}

// Refurbished
