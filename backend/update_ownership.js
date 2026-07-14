import { connectDB, getDB } from './src/config/database.js';
import dotenv from 'dotenv';
dotenv.config();

async function updateProjects() {
  await connectDB();
  const db = getDB();
  const targetEmail = 'ochiwilliampotieno@gmail.com';
  
  const opps = await db.collection('opportunities').find({}).toArray();
  
  let updatedCount = 0;
  for (const o of opps) {
    if (
      o.title.toLowerCase().includes('uhpc') || 
      o.title.toLowerCase().includes('agro') || 
      o.title.toLowerCase().includes('m-pesa') ||
      o.category === 'Crowdfund' || 
      (o.isEscrow && !o.reporter?.email) || 
      (o.reporter?.email === 'admin@admin.com')
    ) {
      console.log('Updating: ' + o.title);
      await db.collection('opportunities').updateOne(
        { _id: o._id },
        { 
          $set: { 
            'reporter.email': targetEmail,
            'contactEmail': targetEmail
          } 
        }
      );
      updatedCount++;
    }
  }
  
  console.log('Updated ' + updatedCount + ' opportunities.');
  process.exit(0);
}

updateProjects();
