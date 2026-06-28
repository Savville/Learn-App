/**
 * Grandfather existing StudentProject / Project records without institutionalEndorsement.
 * Run: node backend/migrateProjectEndorsements.cjs
 */
const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const API_BASE = process.env.PUBLIC_API_URL || 'http://localhost:5000/api';
const PROJECT_CATEGORIES = ['StudentProject', 'Project'];

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  const col = db.collection('opportunities');

  const cursor = col.find({
    category: { $in: PROJECT_CATEGORIES },
    institutionalEndorsement: { $exists: false },
  });

  let updated = 0;
  for await (const opp of cursor) {
    const patch = {
      compensationType: 'N/A',
      upfrontCost: 'No Upfront Cost',
    };
    if (opp.kycProofFilename) {
      patch.institutionalEndorsement = {
        institutionName: 'Legacy listing',
        contactTitle: 'Pending verification',
        evidenceType: 'upload',
        evidenceUrl: `${API_BASE}/public/endorsement/${opp.id}`,
        adminEvidenceFile: opp.kycProofFilename,
        legacyGrandfathered: true,
      };
    }
    await col.updateOne({ _id: opp._id }, { $set: patch });
    updated++;
    console.log('Updated:', opp.id);
  }

  console.log(`Done. Grandfathered ${updated} project record(s).`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
