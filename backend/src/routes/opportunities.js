import express from 'express';
import { getDB } from '../config/database.js';
import { verifyAdminKey } from '../middleware/auth.js';

const router = express.Router();

// GET all opportunities with filters
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { category, level, location, search } = req.query;
    
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (level && level !== 'all') filter['eligibility.educationLevel'] = level;
    if (location && location !== 'all') {
      if (location === 'kenya') filter.isKenyaBased = true;
      else if (location === 'international') filter.isKenyaBased = false;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } }
      ];
    }
    
    const opportunities = await db.collection('opportunities')
      .find(filter)
      .sort({ dateAdded: -1 })
      .toArray();
    
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single opportunity
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const opportunity = await db.collection('opportunities')
      .findOne({ id: req.params.id });
    
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    // Increment view count
    await db.collection('opportunities').updateOne(
      { id: req.params.id },
      { $inc: { views: 1 } }
    );
    
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
      dateAdded: new Date(),
      views: 0,
      clicks: 0
    };
    
    const result = await db.collection('opportunities').insertOne(opportunity);
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
    
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
