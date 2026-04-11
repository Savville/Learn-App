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
    const { category, level, fundingType, search, tab } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip  = (page - 1) * limit;

    const filter = {};
    
    // New tab logic
    const WORK_CATEGORIES = ['Gig', 'Job', 'Project', 'Challenge', 'Hackathon', 'Attachment', 'Internship'];
    const ACADEMIC_CATEGORIES = ['Scholarship', 'Fellowship', 'Conference', 'Grant', 'CallForPapers', 'Event', 'Volunteer'];

    if (tab === 'work') filter.category = { $in: WORK_CATEGORIES };
    else if (tab === 'academic') filter.category = { $in: ACADEMIC_CATEGORIES };

    if (category && category !== 'all') filter.category = category;
    if (level && level !== 'all') filter['eligibility.educationLevel'] = level;
    if (fundingType && fundingType !== 'all') filter.fundingType = fundingType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } }
      ];
    }

    const [data, total] = await Promise.all([
      db.collection('opportunities').find(filter).sort({ dateAdded: -1 }).skip(skip).limit(limit).toArray(),
      db.collection('opportunities').countDocuments(filter),
    ]);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      .findOne({ $or: [{ id: req.params.id }, { slug: req.params.id }] });

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
