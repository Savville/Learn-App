import express from 'express';
import { getDB } from '../config/database.js';

const router = express.Router();

// GET /api/feed.xml — RSS 2.0 feed of latest opportunities
router.get('/', async (req, res) => {
    try {
        const db = getDB();

        // Fetch latest 20 verified opportunities
        const opportunities = await db.collection('opportunities')
            .find({
                $or: [{ status: { $exists: false } }, { status: 'Verified' }]
            })
            .sort({ dateAdded: -1 })
            .limit(20)
            .toArray();

        const baseUrl = process.env.BASE_URL || 'https://opportunitieskenya.live';

        const items = opportunities.map(opp => {
            const pubDate = new Date(opp.dateAdded || Date.now()).toUTCString();
            const link = `${baseUrl}/opportunities/${opp.slug || opp.id}`;
            const description = opp.fullDescription || opp.description || '';

            return `
        <item>
          <title><![CDATA[${opp.title}]]></title>
          <link>${link}</link>
          <guid>${link}</guid>
          <pubDate>${pubDate}</pubDate>
          <description><![CDATA[${description.substring(0, 500)}${description.length > 500 ? '...' : ''}]]></description>
          <category>${opp.category || 'General'}</category>
          ${opp.provider ? `<dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">${opp.provider}</dc:creator>` : ''}
        </item>`;
        }).join('');

        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Opportunities Kenya — Latest Opportunities</title>
    <link>${baseUrl}</link>
    <description>Curated opportunities for African students and young professionals. Gigs, internships, scholarships, grants, and more.</description>
    <language>en-us</language>
    <copyright>Copyright ${new Date().getFullYear()} Opportunities Kenya</copyright>
    <generator>Opportunities Kenya RSS Generator</generator>
    <atom:link href="${baseUrl}/api/feed" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.send(rss);
    } catch (error) {
        console.error('RSS Feed Error:', error);
        res.status(500).json({ error: 'Failed to generate feed' });
    }
});

export default router;