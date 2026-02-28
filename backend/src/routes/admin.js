import express from 'express';
import { getDB } from '../config/database.js';
import { verifyAdminKey } from '../middleware/auth.js';
import { sendDigestEmail, sendPersonalizedDigestEmail } from '../services/emailService.js';

// ── Interest-matching helper ────────────────────────────────────────────────
// Returns true when any subscriber interest keyword (category name or subfield)
// appears in the opportunity's title, description, or fieldOfStudy array.
function interestMatchesOpportunity(opp, interests) {
  const oppText = [
    opp.title || '',
    opp.description || '',
    ...(opp.eligibility?.fieldOfStudy || []),
  ].join(' ').toLowerCase();

  for (const interest of interests) {
    if (oppText.includes(interest.category.toLowerCase())) return true;
    for (const sub of (interest.subfields || [])) {
      const norm = sub.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
      if (norm && oppText.includes(norm)) return true;
    }
  }
  return false;
}

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

// POST /api/admin/send-personalized-digest
// Sends each active subscriber opportunities matched to their interests.
// Subscribers with no interests saved receive the full pool as a general digest.
// Body (optional): { lastN: 10 }  — how many recent opportunities to pull (default 10)
router.post('/send-personalized-digest', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const lastN = parseInt(req.body?.lastN) || 10;

    // 1. All active subscribers (need email + interests)
    const subscribers = await db
      .collection('subscribers')
      .find({ unsubscribed: { $ne: true } })
      .project({ email: 1, interests: 1 })
      .toArray();

    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No active subscribers found.' });
    }

    // 2. Opportunity pool
    const allOpps = await db
      .collection('opportunities')
      .find({})
      .sort({ _id: -1 })
      .limit(lastN)
      .toArray();

    if (allOpps.length === 0) {
      return res.status(400).json({ error: 'No opportunities found.' });
    }

    // 3. Send per subscriber
    const results = { matched: 0, fallback: 0, failed: 0 };

    for (const sub of subscribers) {
      const hasInterests = Array.isArray(sub.interests) && sub.interests.length > 0;

      let oppsToSend;
      let isPersonalized;

      if (hasInterests) {
        const filtered = allOpps.filter(opp => interestMatchesOpportunity(opp, sub.interests));
        if (filtered.length > 0) {
          oppsToSend = filtered;
          isPersonalized = true;
        } else {
          // No keyword match — fall back to full pool so they still get something
          oppsToSend = allOpps;
          isPersonalized = false;
        }
      } else {
        oppsToSend = allOpps;
        isPersonalized = false;
      }

      const ok = await sendPersonalizedDigestEmail(sub.email, oppsToSend, isPersonalized);
      if (ok) {
        if (isPersonalized) results.matched++;
        else results.fallback++;
      } else {
        results.failed++;
      }

      // ~200 ms breathing room between sends (Gmail rate limit)
      await new Promise(r => setTimeout(r, 200));
    }

    res.json({
      message: 'Personalized digest complete.',
      totalSubscribers: subscribers.length,
      opportunityPoolSize: allOpps.length,
      ...results,
    });
  } catch (error) {
    console.error('❌ send-personalized-digest error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
