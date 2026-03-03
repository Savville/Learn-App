/**
 * Sitemap Generator
 * Reads opportunity titles from src/data/opportunities.ts,
 * generates slugs, and writes public/sitemap.xml
 * Run: node scripts/generate-sitemap.mjs
 * Auto-runs before every Vercel build via package.json "build" script
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BASE_URL = 'https://opportunitieskenya.live';
const TODAY = new Date().toISOString().split('T')[0];

// Same slug logic as src/utils/dateUtils.ts
function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Extract all titles from the TS data file using regex
const tsFile = readFileSync(resolve(ROOT, 'src/data/opportunities.ts'), 'utf-8');
const titleMatches = [...tsFile.matchAll(/title:\s*['"`](.*?)['"`]/g)];
const titles = titleMatches.map(m => m[1]);

// Static pages
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/opportunities', priority: '0.9', changefreq: 'daily' },
  { url: '/about', priority: '0.5', changefreq: 'monthly' },
  { url: '/contact', priority: '0.5', changefreq: 'monthly' },
];

// Dynamic opportunity pages
const opportunityPages = titles.map(title => ({
  url: `/opportunity/${toSlug(title)}`,
  priority: '0.8',
  changefreq: 'weekly',
}));

const allPages = [...staticPages, ...opportunityPages];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

const outPath = resolve(ROOT, 'public/sitemap.xml');
writeFileSync(outPath, xml, 'utf-8');

console.log(`✅ sitemap.xml generated — ${allPages.length} URLs`);
console.log(`   ${staticPages.length} static pages + ${opportunityPages.length} opportunities`);
