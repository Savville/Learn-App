import express from 'express';
import { getDB } from '../config/database.js';
import { sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

// POST subscribe to newsletter
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { email, categories, allUpdates, interests, whatsapp } = req.body;
    
    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check if already subscribed
    const existing = await db.collection('subscribers').findOne({ email });
    if (existing && !existing.unsubscribed) {
      return res.status(400).json({ error: 'Already subscribed' });
    }
    
    // Add/Update subscriber
    const subscriber = {
      email,
      categories: categories || [],
      allUpdates: allUpdates !== false,
      interests: interests || [],
      whatsapp: whatsapp || null,
      subscribedAt: new Date(),
      unsubscribed: false
    };
    
    await db.collection('subscribers').updateOne(
      { email },
      { $set: subscriber },
      { upsert: true }
    );
    
    // Send welcome email in background — don't block the response
    sendWelcomeEmail(email).catch(err => console.error('Welcome email error:', err.message));
    
    res.status(201).json({ message: 'Successfully subscribed!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST unsubscribe
router.post('/unsubscribe/:email', async (req, res) => {
  try {
    const db = getDB();
    await db.collection('subscribers').updateOne(
      { email: req.params.email },
      { $set: { unsubscribed: true } }
    );
    
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET subscriber count
router.get('/count', async (req, res) => {
  try {
    const db = getDB();
    const count = await db.collection('subscribers').countDocuments({ unsubscribed: false });
    res.json({ totalSubscribers: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
