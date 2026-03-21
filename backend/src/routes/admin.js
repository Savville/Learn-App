import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDB } from '../config/database.js';
import { verifyAdminKey } from '../middleware/auth.js';
import { sendDigestEmail, sendPersonalizedDigestEmail, sendBroadcastEmail, sendNewOpportunityEmail, sendPosterApprovalEmail, seangapoTemplate, yesistTemplate } from '../services/emailService.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Resolve the project root (3 levels up from backend/src/routes/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

// ── Multer Configuration for Image Uploads ──────────────────────────────────
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

// ── Interest-matching helper ────────────────────────────────────────────────
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

const router = express.Router();

// POST /api/admin/upload-image
router.post('/upload-image', verifyAdminKey, upload.single('coverImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
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

// POST /api/admin/send-digest  — send branded digest to all active subscribers
// Body (all optional):
//   { opportunityIds: ["id1","id2",...] }  → specific opps
//   { lastN: 5 }                            → last N added (default 5)
//   {}                                      → last 5 added
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

    res.json({
      message: 'Digest sent.',
      subscriberCount: emails.length,
      opportunityCount: opportunities.length,
      ...results,
    });
  } catch (error) {
    console.error('❌ send-digest error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/send-personalized-digest
// Sends each active subscriber opportunities matched to their interests.
// Subscribers with no interests saved receive the full pool as a general digest.
// Body (optional): { lastN: 10 }  — how many recent opportunities to pull (default 10)
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
          // No keyword match — fall back to full pool so they still get something
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
    console.error('❌ send-personalized-digest error:', error);
    res.status(500).json({ error: error.message });
  }
});

const SEANGAPO_SUBJECT = 'From Seangapo Floods to Real Solutions – Nairobi\'s Solvable Water Crisis';

// POST /api/admin/send-seangapo-test
// Sends the Seangapo broadcast to a single test address only.
router.post('/send-seangapo-test', verifyAdminKey, async (req, res) => {
  try {
    const testEmail = req.body?.to || 'ochiwilliamotieno@gmail.com';
    const result = await sendBroadcastEmail([testEmail], SEANGAPO_SUBJECT, seangapoTemplate());
    res.json({ message: `Test email sent to ${testEmail}`, ...result });
  } catch (error) {
    console.error('❌ send-seangapo-test error:', error);
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
    console.error('❌ send-seangapo-broadcast error:', error);
    res.status(500).json({ error: error.message });
  }
});

const YESIST_SUBJECT = '24 Hours Remaining — IEEE Africa Entrepreneurship Summit Hackathon 2026';

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
    console.error('❌ send-yesist-broadcast error:', error);
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
    console.error('❌ upsert-opportunities error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/list-gemini-models — returns models your API key can use (for debugging)
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
      
      Categorize the opportunity into one of these: 'CallForPapers', 'Internship', 'Grant', 'Conference', 'Scholarship', 'Fellowship', 'Attachment', 'Hackathon', 'Event', 'Volunteer', 'Challenge', 'Project', 'Other'.
      
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

// ── Pending Opportunities (Inbox) ──────────────────────────────────────────

// GET /api/admin/pending
router.get('/pending', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const pending = await db.collection('pending_opportunities').find({ status: 'pending' }).sort({ submittedAt: -1 }).toArray();
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
      oppToPublish.isVerified = true; // Add a verification flag for the UI
    } else {
      oppToPublish.postedBy = pendingDoc.reporter?.name || 'Opportunities Kenya Admin';
    }

    await db.collection('opportunities').replaceOne({ id: oppToPublish.id }, oppToPublish, { upsert: true });

    // Update pending status
    await db.collection('pending_opportunities').updateOne({ _id: pendingDoc._id }, { $set: { status: 'approved', approvedAt: new Date() } });

    // Fetch active subscribers to send the new opportunity alert
    const subscribers = await db
      .collection('subscribers')
      .find({ unsubscribed: { $ne: true } })
      .project({ email: 1 })
      .toArray();

    if (subscribers.length > 0) {
      // Non-blocking: send the email in the background so the admin UI responds instantly
      sendNewOpportunityEmail(subscribers, oppToPublish).catch(err => console.error("Failed to send alert:", err));
    }

    // NEW: Notify the original poster that their opportunity is now live
    if (pendingDoc.reporter?.email) {
      sendPosterApprovalEmail(pendingDoc.reporter.email, oppToPublish).catch(err => {
          console.error('Approval notification to poster failed:', err.message);
      });
    }

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
    
    const { ObjectId } = await import('mongodb');
    
    await db.collection('pending_opportunities').updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'rejected', rejectedAt: new Date() } }
    );
    res.json({ message: 'Opportunity rejected.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Organization Management ────────────────────────────────────────────────

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

export default router;
