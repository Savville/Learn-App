import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const toSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const extractJSONFromMarkdown = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const jsonBlocks = [];
    const regex = /```json\s+([\s\S]*?)\s+```/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        jsonBlocks.push(parsed);
      } catch (e) {
        console.error(`Failed to parse a JSON block in ${filePath}:`, e.message);
      }
    }
    return jsonBlocks;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return [];
  }
};

async function seedDatabase() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  const gigFile = path.join(PROJECT_ROOT, 'OPPORTUNITIES', 'gig_opportunities.md');
  const grantsFile = path.join(PROJECT_ROOT, 'OPPORTUNITIES', 'grants_opportunities.md');

  console.log(`Reading from:`);
  console.log(`- ${gigFile}`);
  console.log(`- ${grantsFile}`);

  const gigOpps = extractJSONFromMarkdown(gigFile);
  const grantOpps = extractJSONFromMarkdown(grantsFile);

  const AUTHORS = ['Kevin', 'Tracy', 'Victor', 'Hillary', 'Stephen', 'Opportunities Kenya Admin'];

  const allOpps = [...gigOpps, ...grantOpps].map((opp, index) => {
    // Generate an ID if missing
    if (!opp.id) {
      opp.id = toSlug(opp.title);
    }
    // Set default properties to make them live immediately
    opp.isVerified = true;
    opp.status = 'Verified';
    opp.dateAdded = opp.dateAdded || new Date().toISOString();
    
    // Distribute authorship round-robin
    const assignedAuthor = AUTHORS[index % AUTHORS.length];
    const assignedEmail = assignedAuthor === 'Opportunities Kenya Admin' 
      ? 'admin@opportunities.ke' 
      : `${assignedAuthor.toLowerCase()}@opportunities.ke`;

    opp.postedBy = opp.postedBy || assignedAuthor;
    opp.contactEmail = opp.contactEmail || assignedEmail;
    
    // Add reporter details if missing
    if (!opp.reporter) {
      opp.reporter = {
        name: opp.postedBy,
        email: opp.contactEmail
      };
    }
    return opp;
  });

  console.log(`✅ Extracted ${allOpps.length} valid opportunities.`);

  if (allOpps.length === 0) {
    console.log('No opportunities to insert.');
    process.exit(0);
  }

  const client = new MongoClient(MONGODB_URI, {
    tls: true,
    tlsAllowInvalidCertificates: false,
    serverSelectionTimeoutMS: 15000,
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    const db = client.db('learn_opportunities');
    const collection = db.collection('opportunities');

    let inserted = 0;
    let updated = 0;

    for (const opp of allOpps) {
      const result = await collection.updateOne(
        { id: opp.id },
        { $set: opp },
        { upsert: true }
      );
      if (result.upsertedCount > 0) inserted++;
      else if (result.modifiedCount > 0) updated++;
    }

    console.log(`🎉 Seeding complete!`);
    console.log(`- Inserted new: ${inserted}`);
    console.log(`- Updated existing: ${updated}`);
  } catch (error) {
    console.error('❌ Database Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Connection closed.');
    process.exit(0);
  }
}

seedDatabase();
