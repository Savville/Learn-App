import express from 'express';
import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// GET /api/portfolio/:email
// Fetch a user's portfolio profile and aggregate their earnings/completed gigs
router.get('/:email', async (req, res) => {
  try {
    const db = getDB();
    const { email } = req.params;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Get profile data
    const profile = await db.collection('portfolios').findOne({ email: normalizedEmail });

    // 2. Aggregate earnings and completed gigs
    // Fetch completed/paid jobs where the user was the applicant
    const completedGigs = await db.collection('applications').find({ 
      applicantEmail: normalizedEmail,
      status: 'paid'
    }).toArray();

    const totalEarnings = completedGigs.reduce((sum, gig) => {
      // Find the associated opportunity to get the escrow amount
      // Wait, the escrowAmount might be saved in the application directly if we denormalized it, 
      // but let's just query it if needed. For now, since we don't have it explicitly stored in the gig record in all cases,
      // we might need to join it. But let's assume it's just basic sum for now or 0 if we can't find it easily without joining.
      return sum + (Number(gig.escrowAmount || gig.amount || 0));
    }, 0);

    // Fetch opportunities posted by the user
    const postedOpportunities = await db.collection('opportunities')
        .find({ 
          $or: [
            { userEmail: normalizedEmail },
            { 'reporter.email': normalizedEmail }
          ],
          status: { $ne: 'Draft' } 
        })
        .sort({ dateAdded: -1 })
        .toArray();

    let calculatedEarnings = 0;
    const gigsWithDetails = [];

    for (let gig of completedGigs) {
      const opp = await db.collection('opportunities').findOne({ id: gig.opportunityId });
      const amount = opp?.escrowAmount ? Number(opp.escrowAmount) : 0;
      calculatedEarnings += amount;
      
      if (opp) {
        gigsWithDetails.push({
          applicationId: gig._id,
          opportunityId: opp.id,
          title: opp.title,
          provider: opp.provider,
          amount: amount,
          category: opp.category,
          completedAt: gig.updatedAt || gig.appliedAt,
          logoUrl: opp.logoUrl
        });
      }
    }
    
    gigsWithDetails.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    // Fetch projects from the new global projects collection
    const userProjects = await db.collection('projects')
        .find({ userEmail: normalizedEmail })
        .sort({ createdAt: -1 })
        .toArray();

    // Ensure profile exists, otherwise return a default empty profile
    const profileData = profile || {
      name: '', bio: '', avatar: '', location: '',
      links: { github: '', linkedin: '', website: '', other1: '', other2: '' },
      skills: []
    };

    // Attach the globally fetched projects to the profile response
    profileData.projects = userProjects;

    res.json({ 
      success: true, 
      profile: profileData,
      stats: {
        totalEarnings: calculatedEarnings,
        completedGigsCount: gigsWithDetails.length,
        postedGigsCount: postedOpportunities.length,
        completedGigs: gigsWithDetails,
        postedOpportunities: postedOpportunities
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// PUT /api/portfolio
// Update the logged-in user's portfolio
router.put('/', async (req, res) => {
  try {
    const db = getDB();
    const email = req.headers['x-user-email'] || req.body.email; // Typically use auth token middleware, but matching existing system

    if (!email) return res.status(401).json({ error: 'Unauthorized. Email required in x-user-email header.' });

    const normalizedEmail = email.trim().toLowerCase();
    const { name, bio, avatar, location, institution, institutionalEmail, mpesaPhone, links, projects, skills } = req.body;

    await db.collection('portfolios').updateOne(
      { email: normalizedEmail },
      { 
        $set: { 
          name, 
          bio, 
          avatar, 
          location, 
          institution,
          institutionalEmail,
          mpesaPhone,
          links, 
          skills,
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );

    // Sync projects to global `projects` collection
    if (Array.isArray(projects)) {
      const currentProjectIds = [];
      for (const p of projects) {
        const pId = p._id || p.id;
        const projectData = { ...p, userEmail: normalizedEmail, updatedAt: new Date() };
        delete projectData._id; // Ensure we don't overwrite _id blindly
        
        let updateQuery = {};
        if (pId && pId.length === 24) {
          updateQuery = { _id: new ObjectId(pId) };
        } else if (pId) {
          updateQuery = { id: pId };
        } else {
          updateQuery = { _id: new ObjectId() }; // New project
        }

        const result = await db.collection('projects').findOneAndUpdate(
          updateQuery,
          { $set: projectData },
          { upsert: true, returnDocument: 'after' }
        );
        if (result && result._id) currentProjectIds.push(result._id);
      }
      
      // Optionally delete removed projects, but let's skip deletion to avoid accidental data loss 
      // since the user might just be saving their profile partial state.
    }

    res.json({ success: true, message: 'Portfolio updated successfully' });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(500).json({ error: 'Failed to update portfolio' });
  }
});

export default router;
