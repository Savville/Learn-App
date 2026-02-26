import express from 'express';
import { getDB } from '../config/database.js';
import { verifyAdminKey } from '../middleware/auth.js';

const router = express.Router();

// POST track user interaction
router.post('/track', async (req, res) => {
  try {
    const db = getDB();
    const { opportunityId, action } = req.body;
    
    if (!opportunityId || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const analytics = {
      opportunityId,
      action, // 'view', 'click', 'apply'
      timestamp: new Date(),
      userIP: req.ip
    };
    
    await db.collection('analytics').insertOne(analytics);
    
    // Update opportunity click count
    if (action === 'click') {
      await db.collection('opportunities').updateOne(
        { id: opportunityId },
        { $inc: { clicks: 1 } }
      );
    }
    
    res.status(201).json({ message: 'Tracked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET analytics dashboard (admin only)
router.get('/dashboard', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    
    const totalOpportunities = await db.collection('opportunities').countDocuments();
    const totalSubscribers = await db.collection('subscribers').countDocuments({ unsubscribed: false });
    const totalViews = await db.collection('analytics').countDocuments({ action: 'view' });
    const totalClicks = await db.collection('analytics').countDocuments({ action: 'click' });
    
    // Top opportunities
    const topOps = await db.collection('opportunities')
      .find({})
      .sort({ clicks: -1 })
      .limit(5)
      .toArray();
    
    res.json({
      totalOpportunities,
      totalSubscribers,
      totalViews,
      totalClicks,
      topOpportunities: topOps.map(op => ({
        title: op.title,
        clicks: op.clicks,
        views: op.views
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
