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
  sendBroadcastEmail,
  sendNewOpportunityEmail,
  sendPosterApprovalEmail,
  sendOrganizationApprovalEmail,
  seangapoTemplate,
  yesistTemplate
} from '../services/emailService.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Resolve the project root (3 levels up from backend/src/routes/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

// â”€â”€ Multer Configuration for Image Uploads â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Interest-matching helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// POST /api/admin/send-digest  â€” send branded digest to all active subscribers
// Body (all optional):
//   { opportunityIds: ["id1","id2",...] }  â†’ specific opps
//   { lastN: 5 }                            â†’ last N added (default 5)
//   {}                                      â†’ last 5 added
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
    console.error('âŒ send-digest error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/send-personalized-digest
// Sends each active subscriber opportunities matched to their interests.
// Subscribers with no interests saved receive the full pool as a general digest.
// Body (optional): { lastN: 10 }  â€” how many recent opportunities to pull (default 10)
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
          // No keyword match â€” fall back to full pool so they still get something
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

const SEANGAPO_SUBJECT = 'From Seangapo Floods to Real Solutions â€“ Nairobi\'s Solvable Water Crisis';

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

const YESIST_SUBJECT = '24 Hours Remaining â€” IEEE Africa Entrepreneurship Summit Hackathon 2026';

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

// GET /api/admin/list-gemini-models â€” returns models your API key can use (for debugging)
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

// â”€â”€ Pending Opportunities (Inbox) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    // Copy escrow funding state to the live opportunity doc
    if (pendingDoc.isEscrowFunded) {
      oppToPublish.isEscrowFunded = true;
      oppToPublish.escrowAmount = pendingDoc.escrowAmount || oppToPublish.escrowAmount;
    }

    await db.collection('opportunities').replaceOne({ id: oppToPublish.id }, oppToPublish, { upsert: true });

    // Update pending status
    await db.collection('pending_opportunities').updateOne({ _id: pendingDoc._id }, { $set: { status: 'Verified', approvedAt: new Date(), reviewedAt: new Date(), reviewedBy, proofLinks } });

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

// â”€â”€ Organization Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Opportunity Content Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Opportunity not found.' });
    }

    res.json({ message: 'Opportunity deleted successfully.' });
  } catch (error) {
    console.error('âŒ Delete opportunity error:', error);
    res.status(500).json({ error: error.message });
  }
});

// â”€â”€ NEW ESCROW DISPUTE ADMIN ROUTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

router.get('/disputes', verifyAdminKey, async (req, res) => {
  try {
    const db = getDB();
    const disputes = await db.collection('applications')
      .find({ status: 'disputed' })
      .sort({ updatedAt: -1 })
      .toArray();

    // Attach opportunity data for better context on the admin UI
    const oppIds = [...new Set(disputes.map(d => d.opportunityId))];
    const opportunities = await db.collection('opportunities')
      .find({ id: { $in: oppIds } })
      .toArray();

    const pendingOpps = await db.collection('pending_opportunities')
      .find({ 'opportunity.id': { $in: oppIds } })
      .toArray();

    // Map opportunities so they are easy to look up
    const oppMap = {};
    opportunities.forEach(o => { oppMap[o.id] = o; });
    pendingOpps.forEach(po => {
      if (!oppMap[po.opportunity.id]) {
        oppMap[po.opportunity.id] = {
          ...po.opportunity,
          posterEmail: po.reporter?.email
        };
      }
    });

    const enrichedDisputes = disputes.map(d => ({
      ...d,
      opportunityTitle: oppMap[d.opportunityId]?.title || 'Unknown Title',
      escrowAmount: oppMap[d.opportunityId]?.escrowAmount || 0,
      posterEmailFallback: oppMap[d.opportunityId]?.posterEmail || oppMap[d.opportunityId]?.contactEmail
    }));

    res.json(enrichedDisputes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/applications/:appId/resolve', verifyAdminKey, async (req, res) => {
  try {
    const { appId } = req.params;
    const { resolution } = req.body; // 'resolved_paid' or 'resolved_refunded'

    if (!['resolved_paid', 'resolved_refunded'].includes(resolution)) {
      return res.status(400).json({ error: "Invalid resolution status" });
    }

    const { ObjectId } = await import('mongodb');
    const db = getDB();
    const result = await db.collection('applications').updateOne(
      { _id: new ObjectId(appId), status: 'disputed' }, // Ensure we only resolve disputed apps
      { $set: { status: resolution, updatedAt: new Date(), resolvedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Disputed application not found." });
    }

    res.json({ message: `Dispute resolved as ${resolution}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// â”€â”€â”€â”€â”€â”// POST /api/admin/applications/:appId/pay-doer — admin initiates M-PESA payment to job doer
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

export default router;

// Refurbished
