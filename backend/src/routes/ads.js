import express from 'express';
import { getDB } from '../config/database.js';
import { verifyAdminKey } from '../middleware/auth.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// GET random active ad
router.get('/random', async (req, res) => {
  try {
    const db = getDB();
    const ads = await db.collection('ads')
      .find({ active: true })
      .toArray();
    
    if (ads.length === 0) {
      return res.json(null);
    }
    
    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    res.json(randomAd);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create ad (admin only)
router.post('/', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const ad = {
      ...req.body,
      createdAt: new Date(),
      active: true
    };
    
    const result = await db.collection('ads').insertOne(ad);
    res.status(201).json({ id: result.insertedId, ...ad });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update ad (admin only)
router.put('/:id', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    
    const result = await db.collection('ads').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    res.json({ message: 'Ad updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE ad (admin only)
router.delete('/:id', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    
    const result = await db.collection('ads').deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    res.json({ message: 'Ad deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
