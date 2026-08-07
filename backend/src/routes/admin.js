import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDB } from '../config/database.js';
import { verifyAdminKey } from '../middleware/auth.js';
import {
  sendDigestEmail,
  sendPersonalizedDigestEmail,
  sendCustomDigestEmail,
  sendBroadcastEmail,
  sendNewOpportunityEmail,
  sendPosterApprovalEmail,
  sendOrganizationApprovalEmail,
  seangapoTemplate,
  yesistTemplate
} from '../services/emailService.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cacheInvalidatePrefix } from '../config/cache.js';
import { auditLog } from '../middleware/auditLog.js';

const CACHE_PREFIX = '/api/opportunities';

// Resolve the project root (3 levels up from backend/src/routes/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

// â"€â"€ Multer Configuration for Image Uploads â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(PROJECT_ROOT, 'public', 'images', 'opportunities');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});


const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|avif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
  }
});

// â"€â"€ Interest-matching helper â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// Returns true when any subscriber interest keyword (category name or subfield)
// appears in the opportunity's title, description, or fieldOfStudy array.
function interestMatchesOpportunity(opp, interests) {
  const oppText = [
    opp.title || '',
    opp.description || '',
    ...(opp.eligibility?.fieldOfStudy || []),
  ].join(' ').toLowerCase();

  for (const interest of interests) {
    if (oppText.includes(interest.category.toLowerCase())) return true;
    for (const sub of (interest.subfields || [])) {
      const norm = sub.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
      if (norm && oppText.includes(norm)) return true;
    }
  }
  return false;
}

// A simple helper to verify image magic bytes
async function verifyImageMagicBytes(filePath) {
  return new Promise((resolve) => {
    const stream = fs.createReadStream(filePath, { start: 0, end: 11 });
    stream.on('data', (chunk) => {
      stream.destroy();
      const hex = chunk.toString('hex').toUpperCase();
      // JPEG: FFD8FF
      if (hex.startsWith('FFD8FF')) return resolve(true);
      // PNG: 89504E47
      if (hex.startsWith('89504E47')) return resolve(true);
      // GIF: 47494638 (GIF8)
      if (hex.startsWith('47494638')) return resolve(true);
      // WEBP: starts with 52494646 (RIFF), chars 8-11 are 57454250 (WEBP)
      if (hex.startsWith('52494646') && hex.substring(16, 24) === '57454250') return resolve(true);
      // AVIF: ftypavif at offset 4 (hex chars 8-23: 6674797061766966)
      if (hex.includes('6674797061766966')) return resolve(true);

      resolve(false);
    });
    stream.on('error', () => resolve(false));
  });
}

const router = express.Router();

// POST /api/admin/upload-image
router.post('/upload-image', verifyAdminKey, upload.single('coverImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  // Verify magic bytes to prevent script uploads masquerading as images
  const isValidMagic = await verifyImageMagicBytes(req.file.path);
  if (!isValidMagic) {
    fs.unlinkSync(req.file.path); // Delete the malicious/invalid file
    return res.status(400).json({ error: 'Invalid file signature. Only authentic images are allowed.' });
  }

  // Construct the public URL path
  const imageUrl = `/images/opportunities/${req.file.filename}`;
  res.json({ imageUrl });
});

// GET admin dashboard stats
router.get('/stats', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();

    const stats = {
      totalOpportunities: await db.collection('opportunities').countDocuments(),
      totalSubscribers: await db.collection('subscribers').countDocuments({ unsubscribed: false }),
      totalViews: await db.collection('analytics').countDocuments({ action: 'view' }),
      totalClicks: await db.collection('analytics').countDocuments({ action: 'click' }),
      totalAds: await db.collection('ads').countDocuments({ active: true }),
      urgentOpportunities: await db.collection('opportunities').countDocuments({
        deadline: { $lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      })
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/chat-oversight
// Enhanced: enriches conversations with live opportunity data (title, slug, deadline, category).
router.get('/chat-oversight', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();

    // ── 1. All conversations ────────────────────────────────────────────────
    const conversations = await db.collection('conversations').find({}).toArray();

    // ── 2. Batch message counts via aggregation (1 query instead of N) ─────
    const conversationIds = conversations.map(c => c._id);
    const msgCounts = await db.collection('messages').aggregate([
      { $match: { conversationId: { $in: conversationIds.map(i => i.toString()) } } },
      { $group: { _id: "$conversationId", count: { $sum: 1 } } }
    ]).toArray();

    // Build lookup map: conversationId -> count
    const countMap = {};
    let totalMessages = 0;
    for (const mc of msgCounts) {
      countMap[mc._id] = mc.count;
      totalMessages += mc.count;
    }

    // ── 3. Collect all gig/opportunity IDs from BOTH gigId AND opportunityId fields ──
    const allOppIds = [...new Set(conversations.flatMap(c => {
      const ids = [];
      if (c.gigId) ids.push(c.gigId);
      if (c.opportunityId && c.opportunityId !== c.gigId) ids.push(c.opportunityId);
      return ids;
    }))];

    // ── 4. Fetch live opportunities by either _id OR id field ──────────────
    const liveOpps = [];
    for (const rawId of allOppIds) {
      // Try string id match first
      const byId = await db.collection('opportunities').findOne({ id: rawId }, { projection: { id: 1, title: 1, slug: 1, deadline: 1, category: 1, postedBy: 1 } });
      if (byId) { liveOpps.push(byId); continue; }
      // Try ObjectId match
      try {
        const { ObjectId } = await import('mongodb');
        const byObjId = await db.collection('opportunities').findOne({ _id: new ObjectId(rawId) }, { projection: { id: 1, title: 1, slug: 1, deadline: 1, category: 1, postedBy: 1 } });
        if (byObjId) liveOpps.push(byObjId);
      } catch (_) { /* skip invalid ObjectIds */ }
    }

    // Build lookup by id, _id string, and ObjectId string
    const oppLookup = {};
    for (const o of liveOpps) {
      if (o.id) oppLookup[o.id] = o;
      oppLookup[o._id.toString()] = o;
      // Also index by raw gigId if it matches
      oppLookup[o.title?.toLowerCase()] = o;
    }

    // ── 5. Helper to resolve opportunity from any ID format ────────────────
    const { ObjectId } = await import('mongodb');
    function resolveOpp(conv) {
      const candidateIds = [conv.opportunityId, conv.gigId].filter(Boolean);
      for (const cid of candidateIds) {
        if (oppLookup[cid]) return oppLookup[cid];
        try {
          if (oppLookup[new ObjectId(cid).toString()]) return oppLookup[new ObjectId(cid).toString()];
        } catch (_) { /* skip invalid */ }
      }
      return null;
    }

    // ── 6. Group by gigId to get active chats per opportunity ─────────────
    const oppMap = {};
    for (const conv of conversations) {
      const oppId = conv.gigId || conv.opportunityId || 'unknown';
      const live = resolveOpp(conv);
      if (!oppMap[oppId]) {
        oppMap[oppId] = {
          count: 0,
          title: live?.title || conv.opportunityTitle || 'Unknown Opportunity',
          posterEmail: conv.posterEmail || conv.posterEmailFallback || live?.postedBy || live?.contactEmail || 'N/A',
          category: live?.category || conv.opportunityCategory || '',
          deadline: live?.deadline ? new Date(live.deadline).toLocaleDateString() : ''
        };
      }
      oppMap[oppId].count += 1;
    }

    const activeChatsByOpportunity = Object.values(oppMap).sort((a, b) => b.count - a.count);

    // ── 7. Enriched conversation list with participants as poster/applicant ─
    const enrichedConversations = conversations.map(c => {
      const live = resolveOpp(c);
      // Extract participant emails - first is applicant, second is poster (or vice versa)
      const participants = Array.isArray(c.participants) ? c.participants : [];
      const applicantEmail = c.applicantEmail || participants[0] || '';
      const posterEmail = c.posterEmail || participants[1] || c.posterEmailFallback || '';

      return {
        id: c._id.toString(),
        opportunityId: c.gigId || c.opportunityId || '',
        opportunityTitle: live?.title || c.opportunityTitle || 'Unknown Opportunity',
        opportunitySlug: live?.slug || '',
        opportunityCategory: live?.category || c.opportunityCategory || '',
        posterEmail: posterEmail,
        posterName: c.posterName || posterEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        applicantEmail: applicantEmail,
        applicantName: c.applicantName || applicantEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        status: c.status || 'pending',
        startedAt: c.createdAt,
        updatedAt: c.updatedAt,
        messageCount: countMap[c._id.toString()] || 0,
        disputeReason: c.disputeReason || null,
        participants: participants
      };
    });

    res.json({
      totalConversations: conversations.length,
      totalMessages,
      activeChatsByOpportunity,
      allConversations: enrichedConversations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/subscriber-categories
router.get('/subscriber-categories', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const subscribers = await db.collection('subscribers').find({ unsubscribed: { $ne: true } }).toArray();

    let totalActive = subscribers.length;
    let categories = {};

    subscribers.forEach(sub => {
      if (Array.isArray(sub.interests) && sub.interests.length > 0) {
        sub.interests.forEach(interest => {
          if (interest && interest.category) {
            const cat = interest.category;
            categories[cat] = (categories[cat] || 0) + 1;
          }
        });
      } else {
        categories['General (No Preferences)'] = (categories['General (No Preferences)'] || 0) + 1;
      }
    });

    const breakdown = Object.keys(categories).map(cat => ({ name: cat, count: categories[cat] })).sort((a, b) => b.count - a.count);

    res.json({ totalActive, breakdown });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/send-digest  â€" send branded digest to all active subscribers
// Body (all optional):
//   { opportunityIds: ["id1","id2",...] }  â†' specific opps
//   { lastN: 5 }                            â†' last N added (default 5)
//   {}                                      â†' last 5 added
router.post('/send-digest', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();

    // 1. Collect subscribers
    const subscribers = await db
      .collection('subscribers')
      .find({ unsubscribed: { $ne: true } })
      .project({ email: 1 })
      .toArray();

    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No active subscribers found.' });
    }

    const emails = subscribers.map(s => s.email);

    // 2. Choose opportunities
    let opportunities;
    if (req.body.opportunityIds && req.body.opportunityIds.length > 0) {
      opportunities = await db
        .collection('opportunities')
        .find({ id: { $in: req.body.opportunityIds } })
        .toArray();
    } else {
      const lastN = parseInt(req.body.lastN) || 5;
      opportunities = await db
        .collection('opportunities')
        .find({})
        .sort({ _id: -1 })
        .limit(lastN)
        .toArray();
    }

    if (opportunities.length === 0) {
      return res.status(400).json({ error: 'No opportunities matched the selection.' });
    }

    // 3. Send
    const results = await sendDigestEmail(emails, opportunities);

    auditLog(req, 'send_digest', { targetId: 'digest-all', changes: { subscriberCount: emails.length, opportunityCount: opportunities.length } });

    res.json({
      message: 'Digest sent.',
      subscriberCount: emails.length,
      opportunityCount: opportunities.length,
      ...results,
    });
  } catch (error) {
    console.error('âŒ send-digest error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/send-custom-digest
// Sends a custom digest to subscribers using explicitly selected opportunity IDs.
router.post('/send-custom-digest', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const { opportunityIds, customSubject, customMessage, targetFilter } = req.body;

    if (!opportunityIds || opportunityIds.length === 0) {
      return res.status(400).json({ error: 'No opportunity IDs provided.' });
    }

    // Build subscriber query
    const subQuery = { unsubscribed: { $ne: true } };
    if (targetFilter && targetFilter !== 'All') {
      if (targetFilter === 'General (No Preferences)') {
        subQuery.$or = [
          { interests: { $exists: false } },
          { interests: { $size: 0 } }
        ];
      } else {
        subQuery['interests.category'] = targetFilter;
      }
    }

    const subscribers = await db
      .collection('subscribers')
      .find(subQuery)
      .project({ email: 1, name: 1 })
      .toArray();

    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No active subscribers found.' });
    }

    const opportunities = await db
      .collection('opportunities')
      .find({ id: { $in: opportunityIds } })
      .toArray();

    if (opportunities.length === 0) {
      return res.status(400).json({ error: 'No opportunities matched the selection.' });
    }

    // Reorder opportunities to match the order of IDs passed
    const orderedOpportunities = opportunityIds.map(id => opportunities.find(o => o.id === id)).filter(Boolean);

    const results = await sendCustomDigestEmail(subscribers, orderedOpportunities, customSubject, customMessage);

    res.json({
      message: 'Custom Digest sent successfully.',
      subscriberCount: subscribers.length,
      opportunityCount: orderedOpportunities.length,
      ...results,
    });
  } catch (error) {
    console.error('â Œ send-custom-digest error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/send-personalized-digest
// Sends each active subscriber opportunities matched to their interests.
// Subscribers with no interests saved receive the full pool as a general digest.
// Body (optional): { lastN: 10 }  â€" how many recent opportunities to pull (default 10)
router.post('/send-personalized-digest', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const lastN = parseInt(req.body?.lastN) || 10;

    // 1. All active subscribers (need email + interests)
    const subscribers = await db
      .collection('subscribers')
      .find({ unsubscribed: { $ne: true } })
      .project({ email: 1, interests: 1 })
      .toArray();

    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No active subscribers found.' });
    }

    // 2. Opportunity pool
    const allOpps = await db
      .collection('opportunities')
      .find({})
      .sort({ _id: -1 })
      .limit(lastN)
      .toArray();

    if (allOpps.length === 0) {
      return res.status(400).json({ error: 'No opportunities found.' });
    }

    // 3. Send per subscriber
    const results = { matched: 0, fallback: 0, failed: 0 };

    for (const sub of subscribers) {
      const hasInterests = Array.isArray(sub.interests) && sub.interests.length > 0;

      let oppsToSend;
      let isPersonalized;

      if (hasInterests) {
        const filtered = allOpps.filter(opp => interestMatchesOpportunity(opp, sub.interests));
        if (filtered.length > 0) {
          oppsToSend = filtered;
          isPersonalized = true;
        } else {
          // No keyword match â€" fall back to full pool so they still get something
          oppsToSend = allOpps;
          isPersonalized = false;
        }
      } else {
        oppsToSend = allOpps;
        isPersonalized = false;
      }

      const ok = await sendPersonalizedDigestEmail(sub.email, oppsToSend, isPersonalized);
      if (ok) {
        if (isPersonalized) results.matched++;
        else results.fallback++;
      } else {
        results.failed++;
      }

      // ~200 ms breathing room between sends (Gmail rate limit)
      await new Promise(r => setTimeout(r, 200));
    }

    res.json({
      message: 'Personalized digest complete.',
      totalSubscribers: subscribers.length,
      opportunityPoolSize: allOpps.length,
      ...results,
    });
  } catch (error) {
    console.error('âŒ send-personalized-digest error:', error);
    res.status(500).json({ error: error.message });
  }
});

const SEANGAPO_SUBJECT = 'From Seangapo Floods to Real Solutions â€" Nairobi\'s Solvable Water Crisis';

// POST /api/admin/send-seangapo-test
// Sends the Seangapo broadcast to a single test address only.
router.post('/send-seangapo-test', verifyAdminKey, async (req, res) => {
  try {
    const testEmail = req.body?.to || 'ochiwilliamotieno@gmail.com';
    const result = await sendBroadcastEmail([testEmail], SEANGAPO_SUBJECT, seangapoTemplate());
    res.json({ message: `Test email sent to ${testEmail}`, ...result });
  } catch (error) {
    console.error('âŒ send-seangapo-test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/send-seangapo-broadcast
// Sends the Seangapo broadcast to ALL active subscribers.
router.post('/send-seangapo-broadcast', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const subscribers = await db
      .collection('subscribers')
      .find({ unsubscribed: { $ne: true } })
      .project({ email: 1 })
      .toArray();

    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No active subscribers found.' });
    }

    const emails = subscribers.map(s => s.email);
    const results = await sendBroadcastEmail(emails, SEANGAPO_SUBJECT, seangapoTemplate());

    res.json({
      message: 'Seangapo broadcast complete.',
      totalSubscribers: emails.length,
      ...results,
    });
  } catch (error) {
    console.error('âŒ send-seangapo-broadcast error:', error);
    res.status(500).json({ error: error.message });
  }
});

const YESIST_SUBJECT = '24 Hours Remaining â€" IEEE Africa Entrepreneurship Summit Hackathon 2026';

// POST /api/admin/send-yesist-broadcast
// Accepts { emails: [...] } and sends the YESIST hackathon broadcast to that list.
router.post('/send-yesist-broadcast', verifyAdminKey, async (req, res) => {
  try {
    const { emails } = req.body;
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'emails array is required' });
    }
    const results = await sendBroadcastEmail(emails, YESIST_SUBJECT, yesistTemplate());
    return res.json({
      message: 'YESIST broadcast complete.',
      totalRecipients: emails.length,
      success: results.success,
      failed: results.failed,
    });
  } catch (error) {
    console.error('âŒ send-yesist-broadcast error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/upsert-opportunities
// Accepts an array of opportunity objects and upserts each by id.
router.post('/upsert-opportunities', verifyAdminKey, async (req, res) => {
  try {
    const opportunities = req.body;
    if (!Array.isArray(opportunities) || opportunities.length === 0) {
      return res.status(400).json({ error: 'Body must be a non-empty array of opportunities.' });
    }
    const db = getDB();
    const col = db.collection('opportunities');
    const results = [];
    for (const opp of opportunities) {
      await col.replaceOne({ id: opp.id }, opp, { upsert: true });
      results.push(opp.id);
    }
    res.json({ message: 'Upserted successfully.', ids: results });
  } catch (error) {
    console.error('âŒ upsert-opportunities error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/list-gemini-models â€" returns models your API key can use (for debugging)
router.get('/list-gemini-models', verifyAdminKey, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`
    );
    const data = await apiRes.json();
    if (!apiRes.ok) {
      return res.status(apiRes.status).json(data);
    }
    const models = (data.models || []).map((m) => ({ name: m.name, displayName: m.displayName }));
    res.json({ models });
  } catch (err) {
    console.error('list-gemini-models error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/parse-opportunity
router.post('/parse-opportunity', verifyAdminKey, async (req, res) => {
  try {
    const { rawText } = req.body;

    if (!rawText) {
      return res.status(400).json({ error: 'rawText is required in the request body.' });
    }

    // IMPORTANT: Make sure to set the GEMINI_API_KEY in your backend's .env file
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use versioned model ID; set GEMINI_MODEL in .env to override. List via GET /api/admin/list-gemini-models
    const modelId = process.env.GEMINI_MODEL || "gemini-1.5-flash-002";
    const model = genAI.getGenerativeModel({ model: modelId });

    const prompt = `
      You are an expert data extractor for a student and professional opportunities portal.
      Analyze the following raw text and extract key data points to create an opportunity listing.
      
      Categorize the opportunity into one of these: 'CallForPapers', 'Internship', 'Grant', 'Conference', 'Scholarship', 'Fellowship', 'Attachment', 'Hackathon', 'Event', 'Volunteer', 'Challenge', 'Project', 'StudentProject', 'Gig', 'Job', 'Partnership', 'StartupFunding', 'Other'.
      
      Category guidance:
      - 'Challenge' = open industry brief (inspiration for capstone/research; NOT a poster-submitted student/community project).
      - 'StudentProject' = student-led initiative posted by a student (may seek collaboration or crowdfunding).
      - 'Project' = community initiative posted by an organization or group.
      - 'StartupFunding' = startup grants, seed funding, accelerator programs for ventures.
      - Do NOT use 'Challenge' for student crowdfunding posts.
      
      For missing information like deadlines, if the text says something generic like "End of September", extract that. If the application link is missing, return an empty string "".
      
      Special Rules for Categories:
      - If the category is 'Event', you MUST extract 'Date' and 'Time' as specific features in the extractedFeatures array.
      - If the category is 'Project', you MUST extract 'Timeline' as a feature in the extractedFeatures array. Any other complex project requirements (like daily availability duration) should just be merged nicely into the description.
      - Extract 'Venue' or 'Location' as the 'Location' feature.

      Respond ONLY with a valid JSON object using the following structure. Do not include markdown formatting like \`\`\`json.
      
      {
        "basicInfo": {
          "title": "...",
          "provider": "...",
          "category": "...",
          "description": "A 2-3 sentence summary highlighting the most important info for the applicant.",
          "fundingType": "Fully Funded | Partially Funded | Paid Internship | Unpaid Internship | N/A"
        },
        "extractedFeatures": [
          {
            "feature": "Application Link",
            "value": "URL or empty",
            "importance": "High",
            "notes": "Critical for applying"
          },
          {
            "feature": "Deadline",
            "value": "Date or extracted vague string",
            "importance": "High",
            "notes": ""
          },
          {
            "feature": "Location",
            "value": "...",
            "importance": "Medium",
            "notes": ""
          },
          {
            "feature": "Eligibility",
            "value": "...",
            "importance": "High",
            "notes": "Brief summary of who can apply"
          }
        ]
      }

      Raw Text to analyze:
      """
      ${rawText}
      """
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log('Raw Gemini response for parse-opportunity:', responseText);

    // Safely parse the JSON (stripping potential markdown blocks and extra text)
    const cleaned = responseText
      // Remove fenced code blocks like ```json ... ``` or ``` ... ```
      .replace(/```[\s\S]*?```/g, '')
      // Also remove leading/trailing backticks/newlines/spaces
      .trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleaned);
    } catch (jsonError) {
      console.error('JSON parse failed for Gemini response:', jsonError, 'Cleaned text was:', cleaned);
      return res.status(500).json({ error: 'Model returned invalid JSON.' });
    }

    res.json(parsedData);
  } catch (error) {
    console.error("Extraction error:", error);
    const message = error?.message || error?.toString?.() || "Failed to parse text";
    res.status(500).json({ error: "Failed to parse text", details: message });
  }
});

// â"€â"€ Pending Opportunities (Inbox) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

// GET /api/admin/pending
router.get('/pending', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const pending = await db.collection('pending_opportunities').find({ status: 'Unverified' }).sort({ submittedAt: -1 }).toArray();
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/approve/:id
router.post('/approve/:id', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const { ObjectId } = await import('mongodb');

    // Find the pending document
    const pendingDoc = await db.collection('pending_opportunities').findOne({ _id: new ObjectId(id) });
    if (!pendingDoc) return res.status(404).json({ error: 'Pending opportunity not found.' });

    // Block approval for Job/Gig if escrow not yet funded
    const JOB_CATS = ['Job', 'Gig'];
    if (JOB_CATS.includes(pendingDoc.opportunity?.category) && !pendingDoc.isEscrowFunded) {
      return res.status(400).json({
        error: 'Cannot approve: Escrow has not been funded. The poster must deposit the escrow amount via their Dashboard first.'
      });
    }

    // Move to opportunities collection
    const oppToPublish = { ...pendingDoc.opportunity };
    // Ensure it has an ID and correctly formatted fields:
    if (!oppToPublish.id) oppToPublish.id = `pub-${Date.now()}`;
    if (!oppToPublish.dateAdded) oppToPublish.dateAdded = new Date().toISOString().split('T')[0];

    // Generate slug for clean URLs
    const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
    oppToPublish.slug = slugify(oppToPublish.title || '');

    // Add attribution
    if (pendingDoc.isOrganizationPost && pendingDoc.orgName) {
      oppToPublish.postedBy = pendingDoc.orgName;
      oppToPublish.isVerified = true;
    } else {
      oppToPublish.postedBy = pendingDoc.reporter?.name || 'Opportunities Kenya Admin';
    }

    const reviewedBy = (req.body?.reviewerName || 'Opportunities Kenya Admin').toString().trim() || 'Opportunities Kenya Admin';
    const proofLinks = Array.isArray(req.body?.proofLinks)
      ? req.body.proofLinks
        .map(link => (link || '').toString().trim())
        .filter(link => /^https?:\/\//i.test(link))
      : [];
    oppToPublish.status = 'Verified';
    oppToPublish.isVerified = true;
    oppToPublish.verificationAudit = {
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      proofLinks,
      riskFlags: pendingDoc.riskFlags || [],
    };
    oppToPublish.reporter = pendingDoc.reporter;
    oppToPublish.isAdminPost = pendingDoc.isAdminPost;
    // Copy escrow funding state to the live opportunity doc
    if (pendingDoc.isEscrowFunded) {
      oppToPublish.isEscrowFunded = true;
      oppToPublish.escrowAmount = pendingDoc.escrowAmount || oppToPublish.escrowAmount;
    }

    const PROJECT_CATEGORIES = ['StudentProject', 'Project'];

    // Copy endorsement evidence URL for public display when approved
    if (oppToPublish.institutionalEndorsement) {
      const end = { ...oppToPublish.institutionalEndorsement };
      const adminFile = end.adminEvidenceFile || oppToPublish.kycProofFilename;
      if (!end.evidenceUrl?.trim() && adminFile) {
        const apiBase = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}/api`;
        end.evidenceUrl = `${apiBase}/public/endorsement/${oppToPublish.id}`;
      }
      oppToPublish.institutionalEndorsement = end;
    } else if (
      PROJECT_CATEGORIES.includes(oppToPublish.category) &&
      oppToPublish.kycProofFilename
    ) {
      const apiBase = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}/api`;
      oppToPublish.institutionalEndorsement = {
        institutionName: 'Legacy listing',
        contactTitle: 'Pending verification',
        evidenceType: 'upload',
        evidenceUrl: `${apiBase}/public/endorsement/${oppToPublish.id}`,
        adminEvidenceFile: oppToPublish.kycProofFilename,
        legacyGrandfathered: true,
      };
    }

    await db.collection('opportunities').replaceOne({ id: oppToPublish.id }, oppToPublish, { upsert: true });

    // Update pending status
    await db.collection('pending_opportunities').updateOne({ _id: pendingDoc._id }, { $set: { status: 'Verified', approvedAt: new Date(), reviewedAt: new Date(), reviewedBy, proofLinks } });

    cacheInvalidatePrefix(CACHE_PREFIX);

    // Fetch active subscribers to send the new opportunity alert if it's not an edit
    if (!oppToPublish.editOf) {
      const subscribers = await db
        .collection('subscribers')
        .find({ unsubscribed: { $ne: true } })
        .project({ email: 1 })
        .toArray();

      if (subscribers.length > 0) {
        // Non-blocking: send the email in the background so the admin UI responds instantly
        sendNewOpportunityEmail(subscribers, oppToPublish).catch(err => console.error("Failed to send alert:", err));
      }
    }

    // NEW: Notify the original poster that their opportunity is now live
    if (pendingDoc.reporter?.email) {
      sendPosterApprovalEmail(pendingDoc.reporter.email, oppToPublish).catch(err => {
        console.error('Approval notification to poster failed:', err.message);
      });
    }

    await auditLog(req, 'approve_opportunity', { targetId: oppToPublish.id, changes: { category: oppToPublish.category } });
    res.json({ message: 'Opportunity approved and published. Email alert triggered!', url: `/opportunity/${oppToPublish.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/reject/:id
router.post('/reject/:id', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const reviewedBy = req.body?.reviewerName || 'Opportunities Kenya Admin';

    const { ObjectId } = await import('mongodb');

    await db.collection('pending_opportunities').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'Rejected', rejectedAt: new Date(), reviewedAt: new Date(), reviewedBy } }
    );
    await auditLog(req, 'reject_opportunity', { targetId: id, changes: { reviewedBy } });
    res.json({ message: 'Opportunity rejected.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/reports
router.get('/reports', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const reports = await db.collection('opportunity_reports').find({ status: 'open' }).sort({ submittedAt: -1 }).toArray();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/reports/:id/resolve
router.post('/reports/:id/resolve', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { ObjectId } = await import('mongodb');
    await db.collection('opportunity_reports').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'resolved', resolvedAt: new Date() } }
    );
    res.json({ message: 'Report marked as resolved.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/user-reports
router.get('/user-reports', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const reports = await db.collection('user_reports').find({ status: 'pending' }).sort({ createdAt: -1 }).toArray();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/user-reports/:id/judgment
router.post('/user-reports/:id/judgment', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { action } = req.body; // 'dismiss', 'warn', 'suspend'

    const { ObjectId } = await import('mongodb');

    const report = await db.collection('user_reports').findOne({ _id: new ObjectId(id) });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    if (action === 'suspend') {
      // Suspend the user (disables login/apply)
      await db.collection('subscribers').updateOne(
        { email: report.reportedUser },
        { $set: { suspended: true, suspendedAt: new Date(), suspendReason: report.reason } }
      );
    }

    // Note: 'warn' could be hooked up to send an email via emailService here in the future

    await db.collection('user_reports').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'resolved', judgment: action, resolvedAt: new Date() } }
    );
    res.json({ message: `Report resolved with action: ${action}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// â"€â"€ Organization Management â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

// GET /api/admin/organizations
router.get('/organizations', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const orgs = await db.collection('organizations').find().sort({ orgName: 1 }).toArray();
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/organizations
router.post('/organizations', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const { email, orgName, contactPerson, telephone } = req.body;

    if (!email || !orgName) {
      return res.status(400).json({ error: 'Email and Organization Name are required.' });
    }

    await db.collection('organizations').updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          orgName,
          contactPerson,
          telephone,
          verifiedAt: new Date()
        }
      },
      { upsert: true }
    );

    res.json({ message: `Organization ${orgName} verified successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/organizations/:id
router.delete('/organizations/:email', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const { email } = req.params;
    const result = await db.collection('organizations').deleteOne({ email: email.toLowerCase() });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Organization not found.' });
    }

    res.json({ message: 'Organization removed.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/organization-requests
router.get('/organization-requests', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const requests = await db.collection('organization_requests')
      .find({ status: 'pending' })
      .sort({ requestedAt: -1 })
      .toArray();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/organization-requests/approve/:id
router.post('/organization-requests/approve/:id', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { ObjectId } = await import('mongodb');

    const request = await db.collection('organization_requests').findOne({ _id: new ObjectId(id) });
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    // 1. Add to verified organizations
    await db.collection('organizations').updateOne(
      { email: request.email.toLowerCase() },
      {
        $set: {
          email: request.email.toLowerCase(),
          orgName: request.organization,
          contactPerson: request.name,
          telephone: request.telephone,
          verifiedAt: new Date()
        }
      },
      { upsert: true }
    );

    // 2. Update request status
    await db.collection('organization_requests').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'approved', approvedAt: new Date() } }
    );

    // 3. Send approval email
    sendOrganizationApprovalEmail(request).catch(err => console.error('Org approval email failed:', err));

    res.json({ message: 'Organization approved and notified.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/organization-requests/reject/:id
router.post('/organization-requests/reject/:id', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { ObjectId } = await import('mongodb');
    await db.collection('organization_requests').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'rejected', rejectedAt: new Date() } }
    );
    res.json({ message: 'Request rejected.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// â"€â"€ Opportunity Content Management â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

// GET /api/admin/opportunities
router.get('/opportunities', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const opportunities = await db.collection('opportunities')
      .find()
      .sort({ _id: -1 })
      .toArray();
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/opportunities/:id
router.put('/opportunities/:id', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updateData = req.body;

    // remove _id to prevent mongodb update errors
    delete updateData._id;

    const result = await db.collection('opportunities').updateOne(
      { id: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Opportunity not found.' });
    }

    cacheInvalidatePrefix(CACHE_PREFIX);
    res.json({ message: 'Opportunity updated successfully.' });
  } catch (error) {
    console.error('âŒ Update opportunity error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/opportunities/:id
router.delete('/opportunities/:id', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const result = await db.collection('opportunities').deleteOne({ id: id });

    // Also remove the corresponding pending post so it doesn't show up in users' dashboards
    await db.collection('pending_opportunities').deleteOne({ 'opportunity.id': id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Opportunity not found.' });
    }

    cacheInvalidatePrefix(CACHE_PREFIX);
    res.json({ message: 'Opportunity deleted successfully.' });
  } catch (error) {
    console.error('âŒ Delete opportunity error:', error);
    res.status(500).json({ error: error.message });
  }
});

// â"€â"€ NEW ESCROW DISPUTE ADMIN ROUTES â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

router.get('/disputes', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const disputes = await db.collection('conversations')
      .find({ status: 'disputed' })
      .sort({ updatedAt: -1 })
      .toArray();

    const oppIds = [...new Set(disputes.map(d => d.gigId))];
    const opportunities = await db.collection('opportunities')
      .find({ $or: [{ id: { $in: oppIds } }, { _id: { $in: oppIds } }] })
      .toArray();

    const oppMap = {};
    opportunities.forEach(o => { oppMap[o.id] = o; oppMap[o._id] = o; });

    const enrichedDisputes = disputes.map(d => {
      const opp = oppMap[d.gigId] || {};
      return {
        ...d,
        opportunityTitle: opp.title || 'Unknown Title',
        escrowAmount: opp.escrowAmount || 0,
        applicantEmail: d.participants[0],
        posterEmailFallback: opp.contactEmail || d.participants[1]
      };
    });

    res.json(enrichedDisputes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/conversations/:convId/resolve', verifyAdminKey, async (req, res) => {
  try {
    const { convId } = req.params;
    const { resolution } = req.body; // 'resolved_paid' or 'resolved_refunded'

    if (!['resolved_paid', 'resolved_refunded'].includes(resolution)) {
      return res.status(400).json({ error: "Invalid resolution status" });
    }

    const { ObjectId } = await import('mongodb');
    const db = getDB();
    const result = await db.collection('conversations').updateOne(
      { _id: new ObjectId(convId), status: 'disputed' },
      { $set: { status: resolution, updatedAt: new Date(), resolvedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Disputed conversation not found." });
    }

    const conversation = await db.collection('conversations').findOne({ _id: new ObjectId(convId) });

    if (conversation) {
      // Notify both parties
      const notificationData = {
        type: 'dispute_resolved',
        title: 'Dispute Resolved',
        message: `An admin has resolved your dispute with the outcome: ${resolution.replace('resolved_', '')}.`,
        isRead: false,
        createdAt: new Date(),
        link: '/inbox'
      };

      await db.collection('notifications').insertMany([
        { ...notificationData, email: conversation.participants[0].toLowerCase() },
        { ...notificationData, email: conversation.participants[1].toLowerCase() }
      ]);
    }

    res.json({ message: `Dispute resolved as ${resolution}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// â"€â"€â"€â"€â"€â"// POST /api/admin/applications/:appId/pay-doer â€" admin initiates M-PESA payment to job doer
router.post('/applications/:appId/pay-doer', verifyAdminKey, async (req, res) => {
  try {
    const { appId } = req.params;
    const { ObjectId } = await import('mongodb');
    const db = getDB();

    const application = await db.collection('applications').findOne({ _id: new ObjectId(appId) });
    if (!application) return res.status(404).json({ error: 'Application not found.' });
    if (!application.escrowReleaseRequested) {
      return res.status(400).json({ error: 'Poster has not approved release for this application yet.' });
    }
    if (application.status !== 'approved') {
      return res.status(400).json({ error: `Cannot pay: application status is '${application.status}'.` });
    }

    const mpesaNumber = application.applicantData?.mpesa_number;
    if (!mpesaNumber || !/^2547\d{8}$/.test(mpesaNumber.toString())) {
      return res.status(400).json({ error: 'No valid M-PESA number on record for this applicant.' });
    }

    const opp = await db.collection('opportunities').findOne({ id: application.opportunityId });
    const escrowAmount = opp?.escrowAmount || 0;
    const platformFee = Math.ceil(escrowAmount * 0.05);
    const transactionFee = Math.ceil((escrowAmount - platformFee) * 0.02);
    const netPayable = escrowAmount - platformFee - transactionFee;

    if (netPayable < 10) return res.status(400).json({ error: 'Net payable amount is too low.' });

    // Initiate STK Push to the job doer (production: replace with Daraja B2C API)
    const { initiateSTKPush } = await import('../services/mpesaService.js');
    const result = await initiateSTKPush(mpesaNumber, netPayable, application.opportunityId, 'Job Payment');
    if (!result.success) return res.status(500).json({ error: `STK Push failed: ${result.error}` });

    // Mark application as paid
    await db.collection('applications').updateOne(
      { _id: new ObjectId(appId) },
      { $set: { status: 'paid', paidAt: new Date(), netAmountPaid: netPayable, updatedAt: new Date() } }
    );
    await db.collection('opportunities').updateOne(
      { id: application.opportunityId },
      { $set: { escrowReleased: true, escrowReleasedAt: new Date() } }
    );

    // Send confirmation emails (non-blocking)
    const { sendPaymentConfirmationEmail } = await import('../services/emailService.js');
    sendPaymentConfirmationEmail({
      applicantEmail: application.applicantEmail,
      posterEmail: opp?.reporter?.email,
      jobTitle: opp?.title || application.opportunityTitle,
      netAmountPaid: netPayable,
      mpesaNumber,
    }).catch(err => console.error('Payment confirmation email failed:', err));

    res.json({
      message: `M-PESA prompt sent to ${mpesaNumber}. Amount: KES ${netPayable}. Application marked paid.`,
      netAmountPaid: netPayable, platformFee, transactionFee,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/reports/:id/postmortem
router.get('/reports/:id/postmortem', verifyAdminKey, async (req, res) => {
  try {
    const oppId = req.params.id;
    const db = getDB();
    const opp = await db.collection('opportunities').findOne({ id: oppId });
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

    const apps = await db.collection('applications').find({ opportunityId: oppId }).toArray();

    // Aggregation for breakdown
    const educationCount = {};
    const fieldCount = {};

    apps.forEach(app => {
      const ed = app.applicantData?.education_level || 'Unknown';
      const field = app.applicantData?.field_of_study || 'Unknown';
      educationCount[ed] = (educationCount[ed] || 0) + 1;
      fieldCount[field] = (fieldCount[field] || 0) + 1;
    });

    const topFields = Object.entries(fieldCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => ({ field: entry[0], count: entry[1] }));

    res.json({
      id: opp.id,
      title: opp.title,
      views: opp.views || 0,
      clicks: opp.clicks || 0,
      totalApplicants: apps.length,
      educationBreakdown: educationCount,
      topFields,
      posterEmail: opp.contactEmail || opp.reporter?.email || 'admin@opportunities.ke'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/reports/:id/email-postmortem
router.post('/reports/:id/email-postmortem', verifyAdminKey, async (req, res) => {
  try {
    const oppId = req.params.id;
    const { posterEmail } = req.body;

    console.log(`\n\x1b[35m[POST-MORTEM REPORT EMAILED]\x1b[0m`);
    console.log(`To: ${posterEmail}`);
    console.log(`Subject: Analytics Report for Opportunity ${oppId}`);
    res.json({ message: 'Report emailed to ' + posterEmail });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// Phase 4: Crowdfunding Ledger & Payouts
// ==========================================

// GET /api/admin/crowdfund/ledger
router.get('/crowdfund/ledger', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    // Get ALL crowdfund transactions to calculate stats, payouts, and refunds
    const txs = await db.collection('transactions').find({
      type: { $in: ['crowdfund', 'crowdfund_payout', 'crowdfund_refund'] },
    }).toArray();

    // Group by opportunityId
    const ledgerMap = {};
    for (const tx of txs) {
      if (!ledgerMap[tx.opportunityId]) {
        const opp = await db.collection('opportunities').findOne({ id: tx.opportunityId });
        ledgerMap[tx.opportunityId] = {
          opportunityId: tx.opportunityId,
          title: opp?.title || tx.opportunityTitle || 'Unknown Project',
          category: opp?.category || tx.opportunityCategory || 'Unknown',
          contactEmail: opp?.contactEmail || opp?.reporter?.email || tx.posterEmail || 'N/A',
          totalRaised: 0,
          txCount: 0,
          status: 'Active',
          contributions: [],
          payoutRequests: opp?.payoutRequests || []
        };
      }

      if (tx.type === 'crowdfund' && tx.status === 'completed') {
        ledgerMap[tx.opportunityId].totalRaised += Number(tx.amountPaid || tx.amount || 0);
        ledgerMap[tx.opportunityId].txCount++;
        ledgerMap[tx.opportunityId].contributions.push({
          name: tx.contributorName || 'Anonymous',
          phone: tx.contributorPhone || tx.phone || 'N/A',
          amount: Number(tx.amountPaid || tx.amount || 0),
          date: tx.createdAt || tx.completedAt
        });
      }

      if (tx.type === 'crowdfund_payout') {
        ledgerMap[tx.opportunityId].status = 'Paid Out';
      }

      if (tx.type === 'crowdfund_refund') {
        ledgerMap[tx.opportunityId].status = 'Refunded';
      }
    }

    res.json(Object.values(ledgerMap));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/crowdfund/payout-requests/:postId/:requestId/mark-paid
router.put('/crowdfund/payout-requests/:postId/:requestId/mark-paid', verifyAdminKey, async (req, res) => {
  try {
    const { postId, requestId } = req.params;
    const db = getDB();
    const { ObjectId } = await import('mongodb');

    // Update in opportunities collection
    await db.collection('opportunities').updateOne(
      { id: postId, 'payoutRequests._id': new ObjectId(requestId) },
      { $set: { 'payoutRequests.$.status': 'paid', 'payoutRequests.$.paidAt': new Date() } }
    );
    // Also try updating pending_opportunities just in case
    await db.collection('pending_opportunities').updateOne(
      { 'opportunity.id': postId, 'opportunity.payoutRequests._id': new ObjectId(requestId) },
      { $set: { 'opportunity.payoutRequests.$.status': 'paid', 'opportunity.payoutRequests.$.paidAt': new Date() } }
    );

    res.json({ message: 'Payout request marked as paid.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/crowdfund/payout/:opportunityId
router.post('/crowdfund/payout/:opportunityId', verifyAdminKey, async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { mpesaNumber } = req.body;

    if (!mpesaNumber || !/^2547\d{8}$/.test(mpesaNumber.toString())) {
      return res.status(400).json({ error: 'Valid M-PESA number is required' });
    }

    const db = getDB();
    const txs = await db.collection('transactions').find({ opportunityId, type: 'crowdfund', status: 'completed' }).toArray();

    if (txs.length === 0) return res.status(400).json({ error: 'No completed transactions found for this project.' });

    let totalRaised = 0;
    txs.forEach(tx => totalRaised += Number(tx.amountPaid || tx.amount || 0));

    const platformFee = Math.ceil(totalRaised * 0.05);
    const netPayable = totalRaised - platformFee;

    const { initiateB2CPayout } = await import('../services/mpesaService.js');
    const b2cResult = await initiateB2CPayout(mpesaNumber, netPayable, `Crowdfund Payout for ${opportunityId}`);

    if (!b2cResult.success) {
      return res.status(500).json({ error: b2cResult.error || 'Failed to initiate Daraja B2C Payout' });
    }

    // Log the payout
    await db.collection('transactions').insertOne({
      opportunityId,
      phone: mpesaNumber,
      amount: netPayable,
      conversationId: b2cResult.data.ConversationID,
      status: 'pending',
      type: 'crowdfund_payout',
      createdAt: new Date()
    });

    res.json({ message: 'Payout successfully initiated to ' + mpesaNumber, netPayable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/crowdfund/refund/:opportunityId
router.post('/crowdfund/refund/:opportunityId', verifyAdminKey, async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const db = getDB();
    const txs = await db.collection('transactions').find({ opportunityId, type: 'crowdfund', status: 'completed' }).toArray();

    if (txs.length === 0) return res.status(400).json({ error: 'No completed transactions found for this project.' });

    const { initiateB2CPayout } = await import('../services/mpesaService.js');

    let successCount = 0;
    let failCount = 0;

    for (const tx of txs) {
      // Simulate refund using B2C to the contributor's phone
      const phone = tx.contributorPhone || tx.phone;
      const amount = Number(tx.amountPaid || tx.amount);
      if (!phone) continue;

      const b2cResult = await initiateB2CPayout(phone, amount, `Refund for ${opportunityId}`);
      if (b2cResult.success) {
        successCount++;
        await db.collection('transactions').insertOne({
          opportunityId,
          phone,
          amount,
          conversationId: b2cResult.data.ConversationID,
          status: 'pending',
          type: 'crowdfund_refund',
          originalTxId: tx._id,
          createdAt: new Date()
        });
      } else {
        failCount++;
      }
      // Small delay to prevent hitting Daraja rate limits
      await new Promise(r => setTimeout(r, 200));
    }

    res.json({ message: `Refunds initiated: ${successCount} successful, ${failCount} failed.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// Phase 6: Transaction Viewer (Recent First)
// ==========================================

// GET /api/admin/transactions â€" View ALL transactions sorted by newest first
router.get('/transactions', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const { type, status, limit: limitStr } = req.query;
    const limit = limitStr && parseInt(limitStr) > 0 ? parseInt(limitStr) : 200;

    const query = {};
    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;

    const sort = { createdAt: -1 };

    const transactions = await db.collection('transactions')
      .find(query)
      .sort(sort)
      .limit(limit)
      .toArray();

    const totalCount = await db.collection('transactions').countDocuments();

    // Status stats
    const stats = await db.collection('transactions').aggregate([
      { $match: query },
      { $group: { _id: "$status", count: { $sum: 1 }, totalAmount: { $sum: { $toDouble: "$amount" } } } },
      { $project: { _id: 0, status: "$_id", count: 1, totalAmount: { $round: ["$totalAmount", 2] } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // Type breakdown
    const typeBreakdown = await db.collection('transactions').aggregate([
      { $match: query },
      { $group: { _id: "$type", count: { $sum: 1 }, totalAmount: { $sum: { $toDouble: "$amount" } } } },
      { $project: { _id: 0, type: "$_id", count: 1, totalAmount: { $round: ["$totalAmount", 2] } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // âš¡ NEW: Platform revenue summary (5% platform fee on completed escrow + payout txns)
    const revenueStats = await db.collection('transactions').aggregate([
      { $match: { ...query, status: 'completed' } },
      {
        $group: {
          _id: { type: "$type" },
          grossAmount: { $sum: { $toDouble: "$amount" } },
          count: { $sum: 1 }
        }
      },
      { $project: { _id: 0, type: "$_id.type", grossAmount: { $round: ["$grossAmount", 2] }, count: 1 } }
    ]).toArray();

    // Compute platform fees
    const escrowCompleted = revenueStats.find(r => r.type === 'escrow');
    const payoutCompleted = revenueStats.find(r => r.type === 'payout');
    const platformFeeRate = 0.05;
    const mpesaFeeRate = 0.02;

    const escrowGross = escrowCompleted?.grossAmount || 0;
    const platformFeeEarned = Math.round(escrowGross * platformFeeRate);
    const mpesaFeesPaid = Math.round((escrowGross - platformFeeEarned) * mpesaFeeRate);
    const netRevenue = platformFeeEarned - mpesaFeesPaid;

    // âš¡ NEW: Callback diagnostics (failed transactions with retry info)
    const failedTxs = await db.collection('transactions').aggregate([
      { $match: { ...query, status: 'failed' } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          maxRetries: { $max: { $ifNull: ["$callbackRetryCount", 0] } },
          avgRetries: { $avg: { $ifNull: ["$callbackRetryCount", 0] } }
        }
      },
      { $project: { _id: 0, type: "$_id", count: 1, maxRetries: 1, avgRetries: { $round: ["$avgRetries", 1] } } }
    ]).toArray();

    // âš¡ NEW: Pending transactions awaiting callback
    const pendingCount = await db.collection('transactions').countDocuments({
      ...query,
      status: 'pending'
    });

    const pendingWithCallbacks = await db.collection('transactions').countDocuments({
      ...query,
      status: 'pending',
      callbackRetryCount: { $gt: 0 }
    });

    res.json({
      transactions,
      pagination: { total: totalCount, returned: transactions.length, limit },
      stats,
      typeBreakdown,
      revenue: {
        escrowGross: escrowGross,
        platformFeeEarned,
        mpesaFeesPaid,
        netRevenue,
        breakdown: revenueStats
      },
      callbackDiagnostics: {
        failedByType: failedTxs,
        pendingCount,
        pendingWithPriorCallbacks: pendingWithCallbacks
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/transactions/search/:amount â€" Find transactions by exact amount
router.get('/transactions/search/:amount', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const amount = parseFloat(req.params.amount);
    const transactions = await db.collection('transactions')
      .find({ amount: amount })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    res.json({ transactions, count: transactions.length, searchAmount: amount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// Phase 5: Secure KYC / Endorsement Viewing
// ==========================================
router.get('/kyc/:filename', verifyAdminKey, (req, res) => {
  const filename = req.params.filename;
  // Ensure the filename doesn't contain directory traversal sequences
  if (filename.includes('..') || filename.includes('/')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const filePath = path.join(PROJECT_ROOT, 'backend', 'uploads', 'kyc', filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'KYC Document not found' });
  }
});

// ==========================================
// Phase 6: Platform Summary & User Management
// ==========================================

// GET /api/admin/platform-summary
// Lightweight summary of all posts and their applicant stats
router.get('/platform-summary', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    
    // Fetch all opportunities (both live and pending)
    const liveOpps = await db.collection('opportunities').find({}, { projection: { id: 1, _id: 1, title: 1, contactEmail: 1, userEmail: 1, status: 1, createdAt: 1, escrowAmount: 1 } }).toArray();
    
    // Fetch applicant counts
    const apps = await db.collection('applications').aggregate([
      {
        $group: {
          _id: {
            oppId: "$opportunityId",
            postId: "$postId"
          },
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          disputed: { $sum: { $cond: [{ $eq: ["$status", "disputed"] }, 1, 0] } }
        }
      }
    ]).toArray();

    // Map application stats to opportunities
    const summary = liveOpps.map(opp => {
      const oppIdStr = opp.id || opp._id.toString();
      const oppStats = apps.filter(a => a._id.oppId === oppIdStr || a._id.postId === oppIdStr).reduce((acc, curr) => {
        acc.total += curr.total;
        acc.approved += curr.approved;
        acc.rejected += curr.rejected;
        acc.pending += curr.pending;
        acc.disputed += curr.disputed;
        return acc;
      }, { total: 0, approved: 0, rejected: 0, pending: 0, disputed: 0 });

      return {
        id: opp.id,
        _id: opp._id,
        title: opp.title,
        posterEmail: opp.contactEmail || opp.userEmail || 'Unknown',
        escrowAmount: opp.escrowAmount,
        status: opp.status || 'live',
        createdAt: opp.createdAt,
        stats: oppStats
      };
    });

    res.json(summary.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users-overview
// Fetch all users with basic stats
router.get('/users-overview', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();

    // 1. Get all profiles (as our base for "users")
    const profiles = await db.collection('profiles').find({}, { projection: { email: 1, name: 1, title: 1, createdAt: 1 } }).toArray();

    // 2. Get account status and admin notes from a central 'users' or 'admin_user_data' collection
    const userRecords = await db.collection('admin_user_data').find({}).toArray();

    // 3. Get application counts per email
    const appCounts = await db.collection('applications').aggregate([
      { $group: { _id: "$applicantEmail", count: { $sum: 1 } } }
    ]).toArray();

    // 4. Get post counts per email
    const postCounts = await db.collection('opportunities').aggregate([
      {
        $group: {
          _id: { $ifNull: ["$contactEmail", { $ifNull: ["$userEmail", "$reporter.email"] }] },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const overview = profiles.map(profile => {
      const email = profile.email;
      const adminData = userRecords.find(u => u.email === email) || {};
      const apps = appCounts.find(a => a._id === email)?.count || 0;
      const posts = postCounts.find(p => p._id === email)?.count || 0;

      return {
        email,
        name: profile.name,
        title: profile.title,
        joinedAt: profile.createdAt,
        status: adminData.status || 'active',
        adminNotes: adminData.notes || '',
        metrics: { applications: apps, posts }
      };
    });

    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/users/:email/status
// Suspend or unsuspend a user
router.post('/users/:email/status', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const email = req.params.email;
    const { status } = req.body; // 'active' or 'suspended'

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.collection('admin_user_data').updateOne(
      { email },
      { $set: { status, updatedAt: new Date() } },
      { upsert: true }
    );

    res.json({ success: true, message: `User ${email} is now ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/users/:email/notes
// Add an internal admin note
router.post('/users/:email/notes', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const email = req.params.email;
    const { notes } = req.body;

    await db.collection('admin_user_data').updateOne(
      { email },
      { $set: { notes, updatedAt: new Date() } },
      { upsert: true }
    );

    res.json({ success: true, message: `Notes updated for ${email}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/messages/bulk
// Fetch bulk broadcasts
router.get('/messages/bulk', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const broadcasts = await db.collection('bulk_broadcasts').find().sort({ sentAt: -1 }).toArray();
    res.json(broadcasts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/disputes/:id/chat
// Fetch full chat history for a specific gig dispute
router.get('/disputes/:id/chat', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const disputeId = req.params.id;
    const { ObjectId } = await import('mongodb');

    const dispute = await db.collection('disputes').findOne({ _id: new ObjectId(disputeId) });
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    
    // Attempt to find conversation by opportunity ID since disputes are gig-based
    const gigId = dispute.opportunityId;
    let query = {
      $or: [
        { gigId: gigId?.length === 24 ? new ObjectId(gigId) : gigId },
        { opportunityId: gigId?.length === 24 ? gigId.toString() : gigId }
      ]
    };
    
    // We can filter by participants if they exist
    if (dispute.reporterEmail && dispute.disputedPartyEmail) {
      query.participants = { $all: [dispute.reporterEmail, dispute.disputedPartyEmail] };
    }

    const conv = await db.collection('conversations').findOne(query);

    if (!conv) {
      // Fallback: just return empty if no conversation is found, some gigs have no chat
      return res.json([]);
    }

    const messages = await db.collection('messages').find({ conversationId: conv._id }).sort({ createdAt: 1 }).toArray();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/master-sheet
// Fetch aggregated stats for all opportunities and their applications
router.get('/master-sheet', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    
    // Fetch all active opportunities
    const opportunities = await db.collection('opportunities').find().toArray();
    
    // Map them up
    const sheetData = [];
    for (const opp of opportunities) {
      // Find applications for this gig
      const apps = await db.collection('applications').find({
        $or: [
          { opportunityId: opp.id },
          { opportunityId: opp._id?.toString() }
        ]
      }).toArray();
      
      const counts = { pending: 0, shortlisted: 0, approved: 0, rejected: 0, hired: 0 };
      const lists = { pending: [], shortlisted: [], approved: [], rejected: [], hired: [] };
      
      for (const app of apps) {
        const status = app.status || 'pending';
        // group paid and disputed into 'hired'
        const category = (status === 'paid' || status === 'disputed') ? 'hired' : 
                         (counts[status] !== undefined ? status : 'pending');
                         
        counts[category]++;
        if (!lists[category].includes(app.applicantEmail)) {
          lists[category].push(app.applicantEmail);
        }
      }
      
      // Analytics
      const views = await db.collection('analytics').countDocuments({ opportunityId: opp.id, action: 'view' });
      const clicks = await db.collection('analytics').countDocuments({ opportunityId: opp.id, action: 'click' });
      const ctr = views > 0 ? parseFloat(((clicks / views) * 100).toFixed(2)) : 0;

      // Check for pending edit request
      const hasEditRequest = await db.collection('pending_opportunities').countDocuments({
        'opportunity.editOf': opp.id,
        status: 'Unverified'
      }) > 0;

      sheetData.push({
        gigId: opp.id || opp._id?.toString(),
        title: opp.title,
        posterEmail: opp.contactEmail || opp.posterEmail || 'Unknown',
        escrowAmount: opp.escrowAmount || 0,
        totalApps: apps.length,
        counts,
        lists,
        views,
        clicks,
        ctr,
        hasEditRequest,
      });
    }

    // Sort by total applications descending
    sheetData.sort((a, b) => b.totalApps - a.totalApps);

    res.json(sheetData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/interactions
// Fetch interaction stats (views/clicks/CTR) for each opportunity
router.get('/interactions', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();

    // 1. Aggregate analytics data
    const analyticsAggr = await db.collection('analytics').aggregate([
      {
        $group: {
          _id: "$opportunityId",
          views: {
            $sum: { $cond: [{ $eq: ["$action", "view"] }, 1, 0] }
          },
          clicks: {
            $sum: { $cond: [{ $eq: ["$action", "click"] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    // 2. Fetch opportunities to get titles/posters
    const opportunities = await db.collection('opportunities').find().project({ id: 1, title: 1, posterEmail: 1, contactEmail: 1 }).toArray();
    
    // Create a lookup map for opportunities
    const oppLookup = {};
    opportunities.forEach(opp => {
      // Use string keys
      oppLookup[String(opp.id || opp._id)] = {
        title: opp.title || 'Unknown Opportunity',
        posterEmail: opp.contactEmail || opp.posterEmail || 'Unknown'
      };
    });

    // 3. Build result array
    const interactionsData = [];
    
    for (const aggr of analyticsAggr) {
      if (!aggr._id) continue;
      
      const oppIdStr = String(aggr._id);
      const oppInfo = oppLookup[oppIdStr] || { title: 'Unknown (Deleted)', posterEmail: 'Unknown' };
      
      const ctr = aggr.views > 0 ? ((aggr.clicks / aggr.views) * 100).toFixed(2) : "0.00";

      interactionsData.push({
        opportunityId: oppIdStr,
        title: oppInfo.title,
        posterEmail: oppInfo.posterEmail,
        views: aggr.views,
        clicks: aggr.clicks,
        ctr: parseFloat(ctr)
      });
    }

    // Sort by views descending
    interactionsData.sort((a, b) => b.views - a.views);

    res.json(interactionsData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve a deliverable dispute (main admin)
router.post('/resolve-dispute', verifyAdminKey, async (req, res) => {
  try {
    const { applicationId, trackId, deliverableId, resolution, amount } = req.body;
    const db = getDB();
    const { ObjectId } = await import('mongodb');

    if (!applicationId || !trackId || !deliverableId || !resolution) {
      return res.status(400).json({ error: 'applicationId, trackId, deliverableId, and resolution are required.' });
    }

    // Find the application
    const application = await db.collection('applications').findOne({
      _id: new ObjectId(applicationId),
    });
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // Find the deliverable
    const track = application.tracks?.find(t => t.trackId === trackId);
    const deliverable = track?.deliverables?.find(d => d.id === deliverableId);
    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found.' });
    }

    // Get applicant's M-PESA number
    const mpesaNumber = application.applicantData?.mpesa_number;
    if (!mpesaNumber || !/^2547\d{8}$/.test(mpesaNumber.toString())) {
      return res.status(400).json({ error: 'Applicant does not have a valid M-PESA number on record.' });
    }

    let netPayable = 0;
    let paidAmount = 0;

    if (resolution === 'pay_full') {
      // Pay full deliverable amount
      const grossAmount = deliverable.amount || 0;
      const platformFee = Math.ceil(grossAmount * 0.05);
      const transactionFee = Math.ceil((grossAmount - platformFee) * 0.02);
      netPayable = grossAmount - platformFee - transactionFee;
      paidAmount = netPayable;
    } else if (resolution === 'pay_partial') {
      // Pay partial amount specified by admin
      paidAmount = amount || 0;
      const platformFee = Math.ceil(paidAmount * 0.05);
      const transactionFee = Math.ceil((paidAmount - platformFee) * 0.02);
      netPayable = paidAmount - platformFee - transactionFee;
    } else if (resolution === 'reject') {
      // Reject - no payment
      await db.collection('applications').updateOne(
        {
          _id: new ObjectId(applicationId),
          'tracks.trackId': trackId,
          'tracks.deliverables.id': deliverableId,
        },
        {
          $set: {
            'tracks.$.deliverables.$[d].status': 'rejected',
            updatedAt: new Date(),
          },
        },
        { arrayFilters: [{ 'd.id': deliverableId }] }
      );
      return res.json({ message: 'Deliverable rejected. No payment released.' });
    } else {
      return res.status(400).json({ error: 'Invalid resolution. Use: pay_full, pay_partial, or reject.' });
    }

    // Trigger B2C payout for pay_full or pay_partial
    const { initiateB2CPayout } = await import('../services/mpesaService.js');
    const b2cResult = await initiateB2CPayout(mpesaNumber, netPayable, `Dispute resolution payout for ${deliverable.title || deliverableId}`);

    if (!b2cResult.success) {
      return res.status(500).json({ error: b2cResult.error || 'Failed to initiate Daraja B2C Payout' });
    }

    // Update deliverable status to paid
    await db.collection('applications').updateOne(
      {
        _id: new ObjectId(applicationId),
        'tracks.trackId': trackId,
        'tracks.deliverables.id': deliverableId,
      },
      {
        $set: {
          'tracks.$.deliverables.$[d].status': 'paid',
          'tracks.$.deliverables.$[d].paidAmount': netPayable,
          'tracks.$.deliverables.$[d].completedAt': new Date().toISOString(),
          updatedAt: new Date(),
        },
      },
      { arrayFilters: [{ 'd.id': deliverableId }] }
    );

    // Log the transaction
    await db.collection('transactions').insertOne({
      opportunityId: application.opportunityId,
      applicationId,
      posterEmail: 'admin',
      recipientEmail: application.applicantEmail,
      phone: mpesaNumber,
      amount: netPayable,
      deliverableId,
      deliverableTitle: deliverable.title || deliverableId,
      resolution,
      conversationId: b2cResult.data?.ConversationID,
      status: 'pending',
      type: 'payout',
      createdAt: new Date(),
    });

    res.json({
      message: `Dispute resolved. Payment of KES ${netPayable} released.`,
      netPayable,
      resolution,
      applicantPhone: mpesaNumber,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET disputed deliverables (for admin dashboard)
router.get('/disputed-deliverables', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();

    // Find all applications with disputed deliverables
    const applications = await db.collection('applications').find({
      'tracks.deliverables.status': 'disputed'
    }).toArray();

    const disputed = [];
    for (const app of applications) {
      const opp = await db.collection('opportunities').findOne({ id: app.opportunityId });
      for (const track of (app.tracks || [])) {
        for (const del of (track.deliverables || [])) {
          if (del.status === 'disputed') {
            disputed.push({
              applicationId: app._id,
              opportunityId: app.opportunityId,
              opportunityTitle: opp?.title || 'Unknown',
              applicantEmail: app.applicantEmail,
              trackId: track.trackId,
              trackLabel: track.trackLabel,
              deliverableId: del.id,
              deliverableTitle: del.title,
              amount: del.amount,
              submittedUrl: del.submittedUrl,
              disputeReason: del.disputeReason,
              disputeInitiatedBy: del.disputeInitiatedBy,
            });
          }
        }
      }
    }

    res.json(disputed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// Edit Requests (from posters requesting changes to live posts)
// ==========================================

// GET /api/admin/edit-requests
router.get('/edit-requests', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const edits = await db.collection('edit_requests')
      .find({ status: 'Pending' })
      .sort({ submittedAt: -1 })
      .toArray();

    const enriched = edits.map(edit => ({
      _id: edit._id,
      opportunityId: edit.originalId,
      title: edit.opportunity?.title || 'Untitled',
      posterEmail: edit.reporter?.email || 'Unknown',
      changeReason: edit.changeReason || 'No reason provided',
      submittedAt: edit.submittedAt,
      diff: edit.diff || {},
      proposed: edit.opportunity,
      reporter: edit.reporter,
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/edit-requests/:id/approve
router.post('/edit-requests/:id/approve', verifyAdminKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { ObjectId } = await import('mongodb');
    const db = getDB();

    const editDoc = await db.collection('edit_requests').findOne({ _id: new ObjectId(id) });
    if (!editDoc) return res.status(404).json({ error: 'Edit request not found.' });

    const originalId = editDoc.originalId;
    const editOpp = editDoc.opportunity;

    // Build update object with only changed fields
    const updateFields = {};
    const fields = ['title', 'description', 'fullDescription', 'deadline', 'location', 'applicationLink', 'fundingType', 'compensationType', 'upfrontCost'];
    for (const f of fields) {
      if (editOpp[f] !== undefined) {
        updateFields[f] = editOpp[f];
      }
    }
    updateFields.updatedAt = new Date();

    // Update the original opportunity
    await db.collection('opportunities').updateOne(
      { id: originalId },
      { $set: updateFields }
    );

    // Mark edit request as approved
    await db.collection('edit_requests').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'Approved', reviewedAt: new Date(), reviewedBy: 'Admin' } }
    );

    cacheInvalidatePrefix(CACHE_PREFIX);
    res.json({ message: 'Edit approved and applied to original post.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/edit-requests/:id/reject
router.post('/edit-requests/:id/reject', verifyAdminKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { ObjectId } = await import('mongodb');
    const db = getDB();

    await db.collection('edit_requests').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'Rejected', reviewedAt: new Date(), reviewedBy: 'Admin' } }
    );

    res.json({ message: 'Edit request rejected.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/opportunities/:id/detail — full detail with analytics + applicants
router.get('/opportunities/:id/detail', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const opp = await db.collection('opportunities').findOne({ id });
    if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });

    // Analytics
    const views = await db.collection('analytics').countDocuments({ opportunityId: id, action: 'view' });
    const clicks = await db.collection('analytics').countDocuments({ opportunityId: id, action: 'click' });
    const ctr = views > 0 ? parseFloat(((clicks / views) * 100).toFixed(2)) : 0;

    // Applicants grouped by status
    const applicants = await db.collection('applications').find({ opportunityId: id }).toArray();
    const grouped = { pending: [], shortlisted: [], approved: [], hired: [], rejected: [] };
    for (const app of applicants) {
      const status = app.status === 'paid' ? 'hired' : (app.status || 'pending');
      if (grouped[status]) grouped[status].push(app.applicantEmail);
    }

    // Check for pending edit request
    const hasEditRequest = await db.collection('edit_requests').countDocuments({
      originalId: id,
      status: 'Pending'
    }) > 0;

    res.json({
      ...opp,
      views,
      clicks,
      ctr,
      applicantGroups: grouped,
      hasEditRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET /api/admin/opportunities/expired
router.get("/opportunities/expired", verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const now = new Date().toISOString();
    const expired = await db.collection("opportunities")
      .find({ deadline: { $exists: true, $ne: null, $ne: "", $lt: now } })
      .sort({ deadline: -1 })
      .toArray();
    res.json(expired);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/opportunities/expired
router.get("/opportunities/expired", verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const expired = await db.collection("opportunities")
      .find({ status: "Verified", deadline: { $lt: new Date() } })
      .sort({ deadline: -1 })
      .toArray();
    res.json(expired);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/opportunities/unpublished

router.get("/opportunities/unpublished", verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const unpublished = await db.collection("opportunities")
      .find({ status: "Unpublished" })
      .sort({ updatedAt: -1 })
      .toArray();
    res.json(unpublished);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/opportunities/:id/unpublish
router.post("/opportunities/:id/unpublish", verifyAdminKey, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const opp = await db.collection("opportunities").findOne({ id });
    if (!opp) return res.status(404).json({ error: "Opportunity not found." });
    await db.collection("opportunities").updateOne(
      { id },
      { $set: { status: "Unpublished", updatedAt: new Date(), unpublishedBy: "Admin" } }
    );
    cacheInvalidatePrefix(CACHE_PREFIX);
    res.json({ message: "Opportunity unpublished." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/opportunities/:id/republish
router.post("/opportunities/:id/republish", verifyAdminKey, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const opp = await db.collection("opportunities").findOne({ id });
    if (!opp) return res.status(404).json({ error: "Opportunity not found." });
    await db.collection("opportunities").updateOne(
      { id },
      { $set: { status: "Verified", updatedAt: new Date() } }
    );
    cacheInvalidatePrefix(CACHE_PREFIX);
    res.json({ message: "Opportunity republished." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;