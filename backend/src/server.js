import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import opportunitiesRoutes from './routes/opportunities.js';
import subscriberRoutes from './routes/subscribers.js';
import analyticsRoutes from './routes/analytics.js';
import adsRoutes from './routes/ads.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Connect to Database
connectDB();

// Routes
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
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
  console.log(`📧 Email Service: ${process.env.GMAIL_USER || 'Not configured'}`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
});
