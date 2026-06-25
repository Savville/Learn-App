const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const bostonOpp = {
  id: 'boston-university-presidential-scholarship-2026',
  title: 'Boston University Presidential Scholarship 2026',
  provider: 'Boston University',
  category: 'Scholarship',
  description: 'A prestigious $25,000/year scholarship for high-achieving international students to pursue their undergraduate degree in the USA.',
  fullDescription: 'Are you looking for a high-value undergraduate scholarship in the USA? The Boston University Presidential Scholarship 2026 is an excellent opportunity for international students who want to study at one of the most prestigious universities in the United States. This funded scholarship in USA helps talented students from all over the world pursue their undergraduate degree at Boston University. The scholarship focuses on academic excellence, leadership potential, and active participation in extracurricular activities. It also supports cultural exchange by bringing students from different countries into one diverse academic environment.',
  deadline: '2026-12-01',
  location: 'Boston, USA',
  eligibility: {
    educationLevel: 'UnderGrad',
    fieldOfStudy: [
      'Health & Rehabilitation Sciences', 'Communication', 'Arts & Sciences', 
      'Engineering', 'Fine Arts', 'Business', 'General Studies', 
      'Global Studies', 'Administration', 'Education & Human Development'
    ],
    requirements: [
      'Must be an international student applying for an undergraduate degree program at Boston University.',
      'Must demonstrate outstanding academic performance in high school and rank in the top 5% of graduating class.',
      'Candidates with strong SAT scores (above 1500) or ACT scores (above 33) have a better chance.',
      'Should have excellent extracurricular achievements and leadership experience.',
      'Must fulfill English language proficiency requirements such as TOEFL or IELTS.'
    ]
  },
  benefits: [
    '$25,000 per academic year.',
    'Reduces the overall cost of undergraduate studies.',
    'Study at a top-ranked university in the USA.',
    'Access to a diverse and international student community.',
    'Enhances academic and professional development.'
  ],
  applicationType: 'Platform Link',
  applicationLink: 'https://www.bu.edu/admissions/apply/',
  fundingType: 'Partially Funded',
  compensationType: 'N/A',
  upfrontCost: 'No Upfront Cost',
  featured: true,
  dateAdded: new Date().toISOString().split('T')[0],
  logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
  isVerified: true,
  status: 'Verified',
  postedBy: 'Opportunities Kenya Admin'
};

async function addOpportunity() {
  // 1. Add to MongoDB
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    const opps = db.collection('opportunities');
    
    // Convert dateAdded to a string in YYYY-MM-DD for consistency if needed, but the original script used string
    
    await opps.updateOne(
      { id: bostonOpp.id },
      { $set: bostonOpp },
      { upsert: true }
    );
    console.log('✅ Added to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB Error:', error);
  } finally {
    await client.close();
  }

  // 2. Add to src/data/opportunities.ts
  const tsPath = path.join(__dirname, '../src/data/opportunities.ts');
  let content = fs.readFileSync(tsPath, 'utf8');
  
  if (!content.includes('boston-university-presidential-scholarship-2026')) {
    const jsonStr = JSON.stringify(bostonOpp, null, 2);
    // Find where the array starts
    const arrayStart = content.indexOf('export const opportunities: Opportunity[] = [');
    if (arrayStart !== -1) {
      const insertPos = content.indexOf('[', arrayStart) + 1;
      content = content.slice(0, insertPos) + '\n  ' + jsonStr + ',' + content.slice(insertPos);
      fs.writeFileSync(tsPath, content);
      console.log('✅ Added to src/data/opportunities.ts');
    }
  } else {
    console.log('⚠️ Already exists in src/data/opportunities.ts');
  }
}

addOpportunity();
