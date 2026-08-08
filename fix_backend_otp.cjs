const fs = require('fs');
const file = 'backend/src/routes/public.js';
let content = fs.readFileSync(file, 'utf8');

const otpRoutes = `

// --- OTP AUTH ---

router.post('/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const normalizedEmail = email.trim().toLowerCase();
    
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    
    const db = getDB();
    await db.collection('otps').updateOne(
      { email: normalizedEmail },
      { $set: { otp, expiresAt } },
      { upsert: true }
    );
    
    await sendOTPEmail(normalizedEmail, otp);
    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
    const normalizedEmail = email.trim().toLowerCase();
    
    const db = getDB();
    const record = await db.collection('otps').findOne({ email: normalizedEmail });
    
    if (!record) return res.status(400).json({ error: 'OTP not requested' });
    if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (record.expiresAt < new Date()) return res.status(400).json({ error: 'OTP expired' });
    
    // Valid OTP! Log them in (or return token so register can proceed)
    await db.collection('otps').deleteOne({ _id: record._id });
    
    const token = jwt.sign({ email: normalizedEmail }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.json({ success: true, token, email: normalizedEmail });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});
`;

if (!content.includes('/auth/send-otp')) {
  content = content.replace('export default router;', otpRoutes + '\nexport default router;');
  fs.writeFileSync(file, content, 'utf8');
  console.log('OTP routes added to public.js');
} else {
  console.log('OTP routes already exist.');
}
