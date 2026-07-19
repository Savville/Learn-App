import express from 'express';
import { sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

// POST /api/test-email — Send a welcome email to a specified address (dev/testing only)
router.post('/', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({ error: 'Valid email required' });
    }

    try {
        await sendWelcomeEmail(email);
        res.json({ message: `Test email sent to ${email}` });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;