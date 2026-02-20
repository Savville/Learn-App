import express from 'express';
import { getDB } from '../config/database.js';
import { verifyAdminKey } from '../middleware/auth.js';

const router = express.Router();

// GET admin dashboard stats
router.get('/stats', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    
    const stats = {
      totalOpportunities: await db.collection('opportunities').countDocuments(),
      totalSubscribers: await db.collection('subscribers').countDocuments({ unsubscribed: false }),
      totalViews: await db.collection('analytics').countDocuments({ action: 'view' }),
      totalClicks: await db.collection('analytics').countDocuments({ action: 'click' }),
      totalAds: await db.collection('ads').countDocuments({ active: true }),
      urgentOpportunities: await db.collection('opportunities').countDocuments({
        deadline: { $lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      })
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
