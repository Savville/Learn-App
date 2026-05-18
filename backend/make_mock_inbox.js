import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const pending = await db.collection('pending_posts').find({ userEmail: 'ochiwilliamotieno@gmail.com' }).toArray();
  const live = await db.collection('opportunities').find().toArray(); // Let's just find anything posted by this user
  
  const userLive = live.filter(p => p.userEmail === 'ochiwilliamotieno@gmail.com' || p.postedBy?.toLowerCase().includes('william'));
  
  console.log('Pending Posts:', pending.map(p => p.opportunity?.id || p.id));
  console.log('Live Posts:', userLive.map(p => p.id));
  
  // Pick a target post ID
  let targetPostId = null;
  if (userLive.length > 0) targetPostId = userLive[0].id;
  else if (pending.length > 0) targetPostId = pending[0].opportunity?.id || pending[0].id;
  
  if (targetPostId) {
    console.log('Target post ID for mock applications:', targetPostId);
    
    // Create some fake applications
    const mockApps = [
      {
         postId: targetPostId,
         applicantEmail: 'sarah.njeri@uonbi.ac.ke',
         applicantData: {
           full_name: 'Sarah Njeri',
           university: 'University of Nairobi',
           course: 'Economics',
           year_of_study: '3rd Year',
           cover_letter: 'I have extensive experience with SPSS and data entry from my coursework. I type at 80 WPM and guarantee 100% accuracy on the transcriptions.',
           phone_number: '254711223344'
         },
         appliedAt: new Date(Date.now() - 86400000).toISOString(),
         status: 'pending'
      },
      {
         postId: targetPostId,
         applicantEmail: 'brian.dev@strathmore.edu',
         applicantData: {
           full_name: 'Brian Kipruto',
           university: 'Strathmore University',
           course: 'Computer Science',
           portfolio_link: 'https://github.com/briancodes',
           cover_letter: 'I built a React Native app for my startup last year, perfectly aligning with your flexbox and UI requirements. Happy to share my portfolio.',
           availability: 'Immediate'
         },
         appliedAt: new Date(Date.now() - 43200000).toISOString(),
         status: 'pending'
      },
      {
         postId: targetPostId,
         applicantEmail: 'faith.designer@ku.ac.ke',
         applicantData: {
           full_name: 'Faith Wambui',
           university: 'Kenyatta University',
           course: 'Design & Arts',
           portfolio_link: 'https://behance.net/faithdesigns',
           experience: '2 years working with Canva and Adobe Suite for campus clubs',
           expected_timeline: '3 Days'
         },
         appliedAt: new Date(Date.now() - 172800000).toISOString(),
         status: 'approved'
      }
    ];
    
    for (const app of mockApps) {
        await db.collection('applications').updateOne(
           { postId: app.postId, applicantEmail: app.applicantEmail },
           { $set: app },
           { upsert: true }
        );
    }
    console.log('Successfully injected 3 mock applications into the database for post:', targetPostId);
  } else {
    // If the user hasn't posted anything, let's create a mock post for them AND applications
    console.log('No posts found for this user. Creating a mock post first!');
    
    const mockPostId = 'mock-job-ui-fixes-' + Date.now();
    await db.collection('pending_posts').insertOne({
        id: mockPostId,
        userEmail: 'ochiwilliamotieno@gmail.com',
        submittedAt: new Date().toISOString(),
        status: 'Verified',
        opportunity: {
            id: mockPostId,
            title: 'Fix React UI Bugs for Startup Dashboard',
            category: 'Web Development',
            description: 'Need a student familiar with React and Tailwind to fix a few overflowing flexboxes and modal z-index issues.',
            applicationForm: { isEnabled: true },
            isEscrow: true,
            escrowAmount: 2500,
            isEscrowFunded: false
        }
    });
    
    console.log('Created Mock Post:', mockPostId);
    
    const mockApps = [
      {
         postId: mockPostId,
         applicantEmail: 'john.doe@jkuat.ac.ke',
         applicantData: {
           full_name: 'John Doe',
           github: 'github.com/johndoe',
           pitch: 'I live and breathe Tailwind. I can fix those flexbox issues tonight.'
         },
         appliedAt: new Date().toISOString(),
         status: 'pending'
      },
       {
         postId: mockPostId,
         applicantEmail: 'mary.ui@maseno.ac.ke',
         applicantData: {
           full_name: 'Mary A.',
           portfolio: 'maryui.dev',
           pitch: 'I have resolved multiple z-index and overflow bugs before.'
         },
         appliedAt: new Date().toISOString(),
         status: 'approved'
      }
    ];
    
    for (const app of mockApps) {
        await db.collection('applications').insertOne(app);
    }
    
    console.log('Successfully injected mock applications for new mock post!');
  }

  client.close();
}

run().catch(console.dir);
