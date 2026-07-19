import express from 'express';
import { getDB } from '../config/database.js';

const router = express.Router();

// GET /api/sitemap.xml — Dynamic sitemap from MongoDB
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const baseUrl = process.env.BASE_URL || 'https://opportunitieskenya.live';

        // Fetch all verified opportunities
        const opportunities = await db.collection('opportunities')
            .find({
                $or: [{ status: { $exists: false } }, { status: 'Verified' }]
            })
            .sort({ dateAdded: -1 })
            .toArray();

        // Fetch latest subscribers count (for engagement signal)
        const subscriberCount = await db.collection('subscribers').countDocuments();

        // Static pages with their priority and changefreq
        const staticPages = [
            { loc: `${baseUrl}/`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '1.0' },
            { loc: `${baseUrl}/opportunities`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '0.9' },
            { loc: `${baseUrl}/about`, lastmod: '2026-01-01', changefreq: 'monthly', priority: '0.7' },
            { loc: `${baseUrl}/post-with-us`, lastmod: '2026-01-01', changefreq: 'weekly', priority: '0.6' },
        ];

        // Build opportunity URLs
        const opportunityUrls = opportunities.map(opp => {
            const lastmod = opp.dateAdded ? new Date(opp.dateAdded).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            const slug = opp.slug || opp.id;
            return {
                loc: `${baseUrl}/opportunities/${slug}`,
                lastmod,
                changefreq: 'weekly',
                priority: opp.featured ? '0.8' : '0.6'
            };
        });

        const allUrls = [...staticPages, ...opportunityUrls];

        const urlsets = allUrls.map(url => `
        <url>
          <loc>${url.loc}</loc>
          <lastmod>${url.lastmod}</lastmod>
          <changefreq>${url.changefreq}</changefreq>
          <priority>${url.priority}</priority>
        </url>`).join('');

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns-news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns-xhtml="http://www.w3.org/1999/xhtml">
  ${urlsets}
</urlset>`;

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.send(sitemap);
    } catch (error) {
        console.error('Sitemap Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate sitemap' });
    }
});

export default router;