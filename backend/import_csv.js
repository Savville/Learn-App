import fs from 'fs';
import csv from 'csv-parser';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('learn_opportunities');
  const collection = db.collection('subscribers');

  const subscribers = [];
  
  fs.createReadStream('subscribers_generated.csv')
    .pipe(csv())
    .on('data', (row) => {
      const interests = [];
      if (row.interests_summary) {
        const parts = row.interests_summary.split('|');
        for (const p of parts) {
          const [cat, subfieldsStr] = p.split(':');
          if (cat && subfieldsStr) {
            const category = cat.trim();
            const subfields = subfieldsStr.split(',').map(s => s.trim()).filter(Boolean);
            interests.push({ category, subfields });
          }
        }
      }
      
      subscribers.push({
        email: row.email.toLowerCase().trim(),
        name: row.name,
        source: row.source,
        interests: interests,
        allUpdates: true,
        unsubscribed: false,
        categories: interests.map(i => i.category),
        subscribedAt: new Date()
      });
    })
    .on('end', async () => {
      console.log(`Parsed ${subscribers.length} rows.`);
      let inserted = 0;
      let updated = 0;
      for (const sub of subscribers) {
        const res = await collection.updateOne(
          { email: sub.email },
          { $set: sub },
          { upsert: true }
        );
        if (res.upsertedCount > 0) inserted++;
        else updated++;
      }
      console.log(`Finished: ${inserted} inserted, ${updated} updated.`);
      await client.close();
      process.exit(0);
    });
}
run().catch(console.error);
