import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    const transactions = db.collection('transactions');
    const contributors = db.collection('contributors');
    const opportunities = db.collection('opportunities');

    // 1. Delete old transactions and contributors for these two projects
    await transactions.deleteMany({ opportunityId: { $in: ['hydro-guard-concrete', 'alkali-activated-binders'] } });
    await contributors.deleteMany({ opportunityId: { $in: ['hydro-guard-concrete', 'alkali-activated-binders'] } });

    // 2. Insert new transactions
    const now = new Date();
    
    // Hydro-Guard
    // - Williams (0710731021): 1000
    // - Obed (0724587588): 1500
    // - Anonymous 1: 800
    // - Anonymous 2: 700
    // Total = 4000
    const hydroTransactions = [
      {
        opportunityId: 'hydro-guard-concrete',
        contributorName: 'Williams',
        contributorPhone: '254710731021',
        amount: 1000,
        checkoutRequestId: 'ws_hydro_001',
        status: 'completed',
        type: 'crowdfund',
        createdAt: new Date(now.getTime() - 4 * 86400000)
      },
      {
        opportunityId: 'hydro-guard-concrete',
        contributorName: 'Obed',
        contributorPhone: '254724587588',
        amount: 1500,
        checkoutRequestId: 'ws_hydro_002',
        status: 'completed',
        type: 'crowdfund',
        createdAt: new Date(now.getTime() - 3 * 86400000)
      },
      {
        opportunityId: 'hydro-guard-concrete',
        contributorName: 'Anonymous',
        contributorPhone: '254701234567',
        amount: 800,
        checkoutRequestId: 'ws_hydro_003',
        status: 'completed',
        type: 'crowdfund',
        createdAt: new Date(now.getTime() - 2 * 86400000)
      },
      {
        opportunityId: 'hydro-guard-concrete',
        contributorName: 'Anonymous',
        contributorPhone: '254798765432',
        amount: 700,
        checkoutRequestId: 'ws_hydro_004',
        status: 'completed',
        type: 'crowdfund',
        createdAt: new Date(now.getTime() - 1 * 86400000)
      }
    ];

    // Geo-Bind
    // - Williams (0710731021): 2000
    // - Anonymous 3: 3320
    // Total = 5320
    const geoTransactions = [
      {
        opportunityId: 'alkali-activated-binders',
        contributorName: 'Williams',
        contributorPhone: '254710731021',
        amount: 2000,
        checkoutRequestId: 'ws_geo_001',
        status: 'completed',
        type: 'crowdfund',
        createdAt: new Date(now.getTime() - 5 * 86400000)
      },
      {
        opportunityId: 'alkali-activated-binders',
        contributorName: 'Anonymous',
        contributorPhone: '254711223344',
        amount: 3320,
        checkoutRequestId: 'ws_geo_002',
        status: 'completed',
        type: 'crowdfund',
        createdAt: new Date(now.getTime() - 2 * 86400000)
      }
    ];

    const allTx = [...hydroTransactions, ...geoTransactions];
    await transactions.insertMany(allTx);

    // Also populate contributors collection for redundancy
    const allCont = allTx.map(tx => ({
      opportunityId: tx.opportunityId,
      name: tx.contributorName,
      amount: tx.amount,
      createdAt: tx.createdAt
    }));
    await contributors.insertMany(allCont);

    // 3. Update the opportunities documents in MongoDB
    await opportunities.updateOne({ id: 'hydro-guard-concrete' }, { $set: { fundedAmount: 4000 } });
    await opportunities.updateOne({ id: 'alkali-activated-binders' }, { $set: { fundedAmount: 5320 } });

    console.log('Successfully inflated transactions.');
  } finally {
    await client.close();
  }
}

run();
