import express from 'express';
import { getDB } from '../config/database.js';
import { cacheGet, cacheHits, cacheMisses } from '../config/cache.js';

const router = express.Router();

// GET /api/health — basic health check (already exists in server.js, duplicate here for modularity)
router.get('/', (req, res) => {
    res.json({
        status: 'Backend is running',
        timestamp: new Date(),
        uptime: Math.floor(process.uptime()) + 's',
        cache: 'in-memory (5min list, 10min single)'
    });
});

// GET /api/health-detailed — full service health for monitoring tools
router.get('/detailed', async (req, res) => {
    const startTime = Date.now();

    const services = {};
    let overallStatus = 'healthy';

    // Check MongoDB
    try {
        const db = await getDB();
        await db.command({ ping: 1 });
        services.mongodb = 'connected';
    } catch (err) {
        services.mongodb = `error: ${err.message}`;
        overallStatus = 'unhealthy';
    }

    // Check Email Service
    services.email = process.env.RESEND_API_KEY ? 'configured' : 'not configured';

    // Check M-Pesa
    if (process.env.DARAJA_ENV === 'production') {
        services.mpesa = process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET
            ? 'production'
            : 'error: credentials missing';
    } else {
        services.mpesa = process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET
            ? 'sandbox'
            : 'error: credentials missing';
    }

    // Check Cache
    const totalRequests = cacheHits + cacheMisses;
    services.cache = {
        hits: cacheHits,
        misses: cacheMisses,
        hitRate: totalRequests > 0 ? parseFloat(((cacheHits / totalRequests) * 100).toFixed(1)) + '%' : 'N/A'
    };

    // Response time
    const responseTime = Date.now() - startTime;

    res.json({
        status: overallStatus,
        uptime: Math.floor(process.uptime()),
        services,
        responseTimeMs: responseTime,
        timestamp: new Date().toISOString()
    });
});

export default router;