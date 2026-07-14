import { connectDB, getDB } from './src/config/database.js';

async function updateProjects() {
  await connectDB();
  const db = getDB();
  
  // Set to admin email so the admin can manage them if needed
  const targetEmail = 'admin@admin.com'; 
  
  // We will find the projects by name and update the reporter email
  const result = await db.collection('opportunities').updateMany(
    {
      $or: [
        { title: { $regex: 'UHPC', $options: 'i' } },
        { title: { $regex: 'AGRO', $options: 'i' } },
      ]
    },
    { 
      $set: { 
        'reporter.email': targetEmail,
        contactEmail: targetEmail
      } 
    }
  );
  
  console.log('Updated ' + result.modifiedCount + ' opportunities.');
  process.exit(0);
}

updateProjects();
