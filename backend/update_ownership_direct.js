import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found.');
    process.exit(1);
  }
  const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: false,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 20000,
    socketTimeoutMS: 45000,
  });
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    const targetEmail = 'ochiwilliampotieno@gmail.com';
    const result = await db.collection('opportunities').updateMany(
      {
        $or: [
          { title: { $regex: 'UHPC', $options: 'i' } },
          { title: { $regex: 'AGRO', $options: 'i' } },
          { category: 'Crowdfund' },
          { isEscrow: true, 'reporter.email': { $exists: false } },
          { 'reporter.email': 'admin@admin.com' }
        ]
      },
      { 
        $set: { 
          'reporter.email': targetEmail, 
          'reporter.name': 'William', 
          contactEmail: targetEmail 
        } 
      }
    );
    console.log('Success:', result.matchedCount, 'matched,', result.modifiedCount, 'modified.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
