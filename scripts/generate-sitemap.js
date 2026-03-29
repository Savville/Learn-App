import fs from 'fs';
import path from 'path';

// Load directly from the TS file to ensure all opportunities are mapped
const tsPath = 'c:/Users/User/Downloads/PortableGit/Learn Opportunities/src/data/opportunities.ts';
const sitemapPath = 'c:/Users/User/Downloads/PortableGit/Learn Opportunities/public/sitemap.xml';
const robotsPath = 'c:/Users/User/Downloads/PortableGit/Learn Opportunities/public/robots.txt';

const baseUrl = 'https://opportunitieskenya.live';

// Basic slug function mapping from dateUtils
function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function generateSitemap() {
  console.log("🗺️ Generating dynamic sitemap...");
  const tsContent = fs.readFileSync(tsPath, 'utf8');
  
  // Extract all titles directly via regex to avoid TS compilation issues in Node
  const titleRegex = /title:\s*['"](.+?)['"]/g;
  const dateRegex = /dateAdded:\s*['"](.+?)['"]/g;
  
  const opportunities = [];
  let match;
  
  // Quick parse of titles
  while ((match = titleRegex.exec(tsContent)) !== null) {
      opportunities.push({ title: match[1], slug: toSlug(match[1]) });
  }

  // Generate XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static Pages
  const staticPages = ['', '/opportunities', '/post-with-us', '/about'];
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page}</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Dynamic Opportunity Pages
  for (const opp of opportunities) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/opportunity/${opp.slug}</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  // Write sitemap.xml to public folder
  fs.writeFileSync(sitemapPath, xml);
  console.log(`✅ sitemap.xml generated with ${opportunities.length + staticPages.length} links.`);

  // Ensure robots.txt explicitly points to the sitemap
  const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
  fs.writeFileSync(robotsPath, robotsTxt);
  console.log(`✅ robots.txt generated.`);
}

generateSitemap();
