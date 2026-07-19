import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { opportunities } from '../src/data/opportunities.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

// IDs to KEEP
const KEEP_IDS = [
  'mest-ai-startup-program-2027',
  'casper-agentic-buildathon-2026',
  'apac-stellar-hackathon-2026',
  'unon-internship-programme-2026',
  'pwc-kenya-graduate-trainee',
  'tony-elumelu-foundation',
  'she-leads-africa-accelerator',
  'awdf-funding',
  'ku-area-rental-scout-project-2026',
  'hydro-guard-concrete',
  'alkali-activated-binders',
  'smart-commerce-infrastructure-challenge'
];

async function run() {
  const toKeep = [];
  const toRemove = [];

  for (const opp of opportunities) {
    // If it's in the KEEP list, keep it.
    // Wait, the old Smart Commerce Challenge had id 'smart-commerce-challenge'. The new one is 'smart-commerce-infrastructure-challenge'.
    if (KEEP_IDS.includes(opp.id)) {
      toKeep.push(opp);
    } else {
      toRemove.push(opp);
    }
  }

  console.log(`Keeping: ${toKeep.length}, Removing: ${toRemove.length}`);

  // 1. Generate MD for the removed ones
  let mdContent = `# WhatsApp Opportunities Archive\n\nThese opportunities lack full details or specific deadlines. Perfect for quick WhatsApp broadcasts.\n\n`;
  for (const opp of toRemove) {
    mdContent += `### ${opp.title}\n`;
    mdContent += `- **Category:** ${opp.category}\n`;
    mdContent += `- **Deadline:** ${opp.deadline || 'Not specified'}\n`;
    if (opp.applicationLink) {
      mdContent += `- **Apply:** ${opp.applicationLink}\n`;
    }
    mdContent += `\n${opp.description || opp.fullDescription?.substring(0, 150) + '...'}\n\n---\n\n`;
  }

  const docsDir = path.join(__dirname, '../DOCS');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir);
  fs.writeFileSync(path.join(docsDir, 'WhatsApp_Opportunities.md'), mdContent);
  console.log('Created WhatsApp_Opportunities.md');

  // 2. Rewrite src/data/opportunities.ts
  const tsContent = `import type { Opportunity } from './types';

export const opportunities: Opportunity[] = ${JSON.stringify(toKeep, null, 2)};
`;
  fs.writeFileSync(path.join(__dirname, '../src/data/opportunities.ts'), tsContent);
  console.log('Updated src/data/opportunities.ts');

  // 3. Delete from MongoDB
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    const col = db.collection('opportunities');
    
    const removeIds = toRemove.map(o => o.id);
    const result = await col.deleteMany({ id: { $in: removeIds } });
    console.log(`Deleted ${result.deletedCount} items from MongoDB.`);
  } finally {
    await client.close();
  }
}

run();
