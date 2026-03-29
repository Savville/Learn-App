import fs from 'fs';
import path from 'path';

const tsPath = 'c:/Users/User/Downloads/PortableGit/Learn Opportunities/src/data/opportunities.ts';
const seedPath = 'c:/Users/User/Downloads/PortableGit/Learn Opportunities/backend/seed.js';

const tsContent = fs.readFileSync(tsPath, 'utf8');

const startMarker = 'export const opportunities: Opportunity[] = [';
const endMarker = '];';

const startIndex = tsContent.indexOf(startMarker);
const endIndex = tsContent.lastIndexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find opportunities array in TS file");
  process.exit(1);
}

// Slice out the array content
let arrayContent = tsContent.substring(startIndex + startMarker.length, endIndex).trim();

// Add views, clicks to each object
// Strategy: use JSON-like parsing but carefully
// We'll replace the end of each object in the array string
// The items are split by "  }," roughly.

// 1. Add views/clicks to each mid-array item
// Find "  }," and replace with "    views: 0,\n    clicks: 0\n  },"
// But wait, the item before might not have a comma.
// So we find the last property line and add a comma.
let processedContent = arrayContent.replace(/([\'"\]])\n  \}/g, '$1,\n    views: 0,\n    clicks: 0\n  }');
// And for items followed by comma
processedContent = processedContent.replace(/([\'"\]])\n  \},/g, '$1,\n    views: 0,\n    clicks: 0\n  },');

const finalArray = '[\n  ' + processedContent + '\n]';

const seedTemplate = `import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const opportunities = ${finalArray};

async function seedDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    const collection = db.collection('opportunities');

    console.log('🧹 Clearing existing opportunities...');
    await collection.deleteMany({});

    console.log(\`📥 Inserting \${opportunities.length} opportunities into MongoDB...\`);
    const result = await collection.insertMany(opportunities);

    console.log(\`✅ Successfully inserted \${result.insertedCount} opportunities!\`);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seedDatabase();
`;

fs.writeFileSync(seedPath, seedTemplate);
console.log("Seed file successfully regenerated from TS source.");
