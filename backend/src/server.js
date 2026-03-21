import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { generateAdminToken } from './middleware/auth.js';
import opportunitiesRoutes from './routes/opportunities.js';
import subscriberRoutes from './routes/subscribers.js';
import analyticsRoutes from './routes/analytics.js';
import adsRoutes from './routes/ads.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet());

// Gzip compression
app.use(compression());

// Rate limiting — 100 requests per IP per 15 min
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' }
}));

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://learn-app-savvilles-projects.vercel.app',
      'https://opportunitieskenya.live',
      'https://www.opportunitieskenya.live',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
      'http://localhost:5174'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root public directory
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
app.use('/images', express.static(path.join(PROJECT_ROOT, 'public', 'images')));

// Connect to Database
connectDB();

// ── Admin Login ─────────────────────────────────────────────────────────────
// POST /api/admin/login  { password: "..." }
// Returns a signed JWT on success — no raw API key ever leaves the server.
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'Server misconfiguration: ADMIN_PASSWORD not set.' });
  }
  if (!password || password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid password.' });
  }

  const token = generateAdminToken();
  res.json({ token, expiresIn: '8h' });
});

// Routes
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Backend is running',
    timestamp: new Date(),
    uptime: Math.floor(process.uptime()) + 's',
    cache: 'in-memory (5min list, 10min single)'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📧 Email Service: ${process.env.RESEND_API_KEY ? 'Resend configured' : 'Not configured'}`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
});
