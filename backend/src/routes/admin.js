import express from 'express';
import { getDB } from '../config/database.js';
import { verifyAdminKey } from '../middleware/auth.js';
import { sendDigestEmail } from '../services/emailService.js';

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

// POST /api/admin/send-digest  — send branded digest to all active subscribers
// Body (all optional):
//   { opportunityIds: ["id1","id2",...] }  → specific opps
//   { lastN: 5 }                            → last N added (default 5)
//   {}                                      → last 5 added
router.post('/send-digest', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();

    // 1. Collect subscribers
    const subscribers = await db
      .collection('subscribers')
      .find({ unsubscribed: { $ne: true } })
      .project({ email: 1 })
      .toArray();

    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No active subscribers found.' });
    }

    const emails = subscribers.map(s => s.email);

    // 2. Choose opportunities
    let opportunities;
    if (req.body.opportunityIds && req.body.opportunityIds.length > 0) {
      opportunities = await db
        .collection('opportunities')
        .find({ id: { $in: req.body.opportunityIds } })
        .toArray();
    } else {
      const lastN = parseInt(req.body.lastN) || 5;
      opportunities = await db
        .collection('opportunities')
        .find({})
        .sort({ _id: -1 })
        .limit(lastN)
        .toArray();
    }

    if (opportunities.length === 0) {
      return res.status(400).json({ error: 'No opportunities matched the selection.' });
    }

    // 3. Send
    const results = await sendDigestEmail(emails, opportunities);

    res.json({
      message: 'Digest sent.',
      subscriberCount: emails.length,
      opportunityCount: opportunities.length,
      ...results,
    });
  } catch (error) {
    console.error('❌ send-digest error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
