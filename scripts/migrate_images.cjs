const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function migrateImages() {
  // 1. Update src/data/opportunities.ts
  const tsPath = path.join(__dirname, '../src/data/opportunities.ts');
  let content = fs.readFileSync(tsPath, 'utf8');
  
  // Replace '/images/opportunities/' with '/images/' globally
  content = content.replace(/\/images\/opportunities\//g, '/images/');
  
  // Also explicitly set Boston Opportunity logoUrl
  // The current URL is an unsplash URL in the script, so I'll replace it.
  content = content.replace(/logoUrl:\s*['"`]https:\/\/images\.unsplash\.com[^'"`]*['"`]/, "logoUrl: '/images/boston_university.png'");
  
  fs.writeFileSync(tsPath, content);
  console.log('✅ Updated src/data/opportunities.ts');

  // 2. Update MongoDB
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    const opps = db.collection('opportunities');
    
    // Fetch all opportunities
    const allOpps = await opps.find({}).toArray();
    let updatedCount = 0;
    
    for (const opp of allOpps) {
      let needsUpdate = false;
      let newLogoUrl = opp.logoUrl;
      
      if (newLogoUrl && newLogoUrl.includes('/images/opportunities/')) {
        newLogoUrl = newLogoUrl.replace('/images/opportunities/', '/images/');
        needsUpdate = true;
      }
      
      if (opp.id === 'boston-university-presidential-scholarship-2026') {
        newLogoUrl = '/images/boston_university.png';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await opps.updateOne({ _id: opp._id }, { $set: { logoUrl: newLogoUrl } });
        updatedCount++;
      }
    }
    console.log(`✅ Updated ${updatedCount} documents in MongoDB`);
  } catch (error) {
    console.error('❌ MongoDB Error:', error);
  } finally {
    await client.close();
  }
}

migrateImages();
