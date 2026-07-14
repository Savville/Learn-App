import express from 'express';
import { getDB } from '../config/database.js';
import { verifyAdminKey } from '../middleware/auth.js';
import { cacheMiddleware, cacheGet, cacheSet, cacheInvalidatePrefix } from '../config/cache.js';

const router = express.Router();

const CACHE_PREFIX = '/api/opportunities';

// GET all opportunities with filters + pagination (cached 5 min)
router.get('/', cacheMiddleware(300), async (req, res) => {
  try {
    const db = getDB();

    // ── SECURITY: Cast all query params to strings to prevent NoSQL operator injection ──
    const category    = req.query.category    ? String(req.query.category)    : undefined;
    const level       = req.query.level       ? String(req.query.level)       : undefined;
    const fundingType = req.query.fundingType ? String(req.query.fundingType) : undefined;
    const search      = req.query.search      ? String(req.query.search)      : undefined;
    const tab         = req.query.tab         ? String(req.query.tab)         : undefined;

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip  = (page - 1) * limit;

    // ── Tab category buckets (must match frontend constants exactly) ──────────
    const GIG_CATEGORIES        = ['Gig', 'Job'];
    const CAREER_CATEGORIES     = ['Internship', 'Attachment', 'Conference', 'CallForPapers', 'Event', 'Volunteer', 'Scholarship', 'Fellowship'];
    const INNOVATION_CATEGORIES = ['Grant', 'StartupFunding'];
    const PROJECT_CATEGORIES    = ['StudentProject', 'Project', 'ResearchCollaboration', 'Hackathon', 'Challenge'];

    // ── Build filter using $and so status check is never overwritten ──────────
    // The $or for status verification is anchored in an $and clause, ensuring
    // that search text filters cannot accidentally replace it (old bug).
    const must = [
      { $or: [{ status: { $exists: false } }, { status: 'Verified' }] },
    ];

    // Tab → category bucket
    if (tab === 'jobs')             must.push({ category: { $in: GIG_CATEGORIES } });
    else if (tab === 'academic_career') must.push({ category: { $in: CAREER_CATEGORIES } });
    else if (tab === 'innovation')  must.push({ category: { $in: INNOVATION_CATEGORIES } });
    else if (tab === 'projects')    must.push({ category: { $in: PROJECT_CATEGORIES } });
    // tab === 'all' or undefined → no category bucket restriction

    // Specific category override (e.g. user picked 'Scholarship' from dropdown)
    if (category && category !== 'all') must.push({ category: category });

    // Education level
    if (level && level !== 'all') must.push({ 'eligibility.educationLevel': level });

    // Funding type
    if (fundingType && fundingType !== 'all') must.push({ fundingType: fundingType });

    // Full-text search — uses its own $or, safely nested inside $and
    if (search) {
      if (search.length > 100) return res.status(400).json({ error: 'Search query too long.' });
      // SECURITY: Escape regex special chars to prevent ReDoS
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      must.push({
        $or: [
          { title:       { $regex: escaped, $options: 'i' } },
          { description: { $regex: escaped, $options: 'i' } },
          { provider:    { $regex: escaped, $options: 'i' } },
        ],
      });
    }

    const filter = must.length === 1 ? must[0] : { $and: must };

    const [data, total] = await Promise.all([
      db.collection('opportunities').find(filter).sort({ dateAdded: -1 }).skip(skip).limit(limit).toArray(),
      db.collection('opportunities').countDocuments(filter),
    ]);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// GET single opportunity (cached 10 min; view count still increments)
router.get('/:id', async (req, res) => {
  try {
    const cacheKey = `${CACHE_PREFIX}/${req.params.id}`;
    const cached = cacheGet(cacheKey);

    // Always increment view count in the background
    getDB().collection('opportunities').updateOne(
      { id: req.params.id },
      { $inc: { views: 1 } }
    ).catch(() => {});

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    const db = getDB();
    const opportunity = await db.collection('opportunities')
      .findOne({
        $and: [
          { $or: [{ id: req.params.id }, { slug: req.params.id }] },
          { $or: [{ status: { $exists: false } }, { status: 'Verified' }] }
        ]
      });

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    cacheSet(cacheKey, opportunity, 600); // 10 minutes
    res.setHeader('X-Cache', 'MISS');
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create opportunity (admin only)
router.post('/', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const opportunity = {
      ...req.body,
      postedBy: req.body.postedBy || 'Opportunities Kenya Admin',
      dateAdded: new Date(),
      views: 0,
      clicks: 0
    };
    const result = await db.collection('opportunities').insertOne(opportunity);
    cacheInvalidatePrefix(CACHE_PREFIX);
    res.status(201).json({ id: result.insertedId, ...opportunity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update opportunity (admin only)
router.put('/:id', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('opportunities').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    cacheInvalidatePrefix(CACHE_PREFIX);
    res.json({ message: 'Opportunity updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE opportunity (admin only)
router.delete('/:id', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('opportunities').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    cacheInvalidatePrefix(CACHE_PREFIX);
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

// Refurbished
