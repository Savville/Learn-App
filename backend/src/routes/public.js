import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDB } from '../config/database.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateUserToken, verifyUserToken } from '../middleware/auth.js';
import { ObjectId } from 'mongodb';
import {
  sendAdminSubmissionNotification,
  sendPosterAcknowledgementEmail,
  sendOrganizationVerificationRequest,
  sendOrganizationRequestAcknowledgement,
  sendOTPEmail
} from '../services/emailService.js';
import { initiateSTKPush } from '../services/mpesaService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

const storage = multer.memoryStorage();

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

const kycStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(PROJECT_ROOT, 'backend', 'uploads', 'kyc');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'kyc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadKyc = multer({
  storage: kycStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: KYC upload only supports PDF, JPG, or PNG.'));
  }
});

const GENERIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'aol.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
]);

const WHITELISTED_LINK_HOSTS = [
  'google.com',
  'forms.gle',
  'typeform.com',
  'tally.so',
  'airtable.com',
  'linkedin.com',
  'facebook.com',
  'instagram.com',
  'x.com',
  'twitter.com',
  'whatsapp.com',
  'bit.ly',
  'tinyurl.com',
  'eventbrite.com',
  'career2.successfactors.com',
  'jobs.lever.co',
  'jobs.smartrecruiters.com',
  'boards.greenhouse.io',
];

function getHost(value = '') {
  try {
    return new URL(value).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function tokenizeName(value = '') {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !['ltd', 'limited', 'company', 'co', 'inc'].includes(token));
}

function detectRedFlags(opportunity = {}, reporter = {}) {
  const flags = [];
  const text = `${opportunity.title || ''} ${opportunity.description || ''} ${opportunity.fullDescription || ''}`.toLowerCase();
  const provider = (opportunity.provider || '').trim();
  const applicationLink = opportunity.applicationLink || '';
  const websiteOrSocial = reporter.websiteOrSocial || '';
  const email = (reporter.email || '').toLowerCase();
  const emailDomain = email.includes('@') ? email.split('@').pop() : '';

  if (opportunity.upfrontCost === 'Has Upfront Cost') {
    flags.push('Upfront fee mentioned');
  }

  if (!provider || provider.length < 3 || /^(unknown|various|n\/a|tbd|private|confidential)$/i.test(provider)) {
    flags.push('Vague company name');
  }

  if (emailDomain && GENERIC_EMAIL_DOMAINS.has(emailDomain)) {
    flags.push('Personal email used');
  }

  if (/urgent|apply immediately|limited slots|last chance|act fast|today only|hurry|deadline looming/i.test(text)) {
    flags.push('Pressure language detected');
  }

  if (/passport|bank account|bank details|otp|pin|password|national id|id number|cvv|mpesa pin/i.test(text)) {
    flags.push('Sensitive data request language detected');
  }

  if (applicationLink) {
    const linkHost = getHost(applicationLink);
    if (linkHost && !WHITELISTED_LINK_HOSTS.some(host => linkHost === host || linkHost.endsWith(`.${host}`))) {
      const providerTokens = tokenizeName(provider);
      const providerMatch = providerTokens.some(token => linkHost.includes(token));
      if (!providerMatch) {
        flags.push('Application link does not match provider');
      }
    }
  }

  if (websiteOrSocial) {
    const websiteHost = getHost(websiteOrSocial);
    const orgTokens = tokenizeName(reporter.organization || provider || '');
    if (websiteHost && orgTokens.length > 0 && !orgTokens.some(token => websiteHost.includes(token))) {
      flags.push('Website or social page does not match organization');
    }
  }

  return [...new Set(flags)];
}

const router = express.Router();

async function checkDarajaStatus(checkoutRequestId, expectedType, db) {
  const tx = await db.collection('transactions').findOne({ checkoutRequestId, type: expectedType });
  if (!tx) return { status: 404, json: { error: 'Transaction not found' } };
  if (tx.status !== 'pending') {
    return { status: 200, json: { status: tx.status, amountPaid: tx.amountPaid || tx.amount, resultDesc: tx.resultDesc } };
  }

  const { querySTKPush } = await import('../services/mpesaService.js');
  const queryRes = await querySTKPush(checkoutRequestId);

  if (queryRes.success && queryRes.data) {
    const resultCode = String(queryRes.data.ResultCode);
    if (resultCode === "0") {
      await handleSuccessfulPayment(checkoutRequestId, db, queryRes.data.ResultDesc || 'Completed via Query');
      const updatedTx = await db.collection('transactions').findOne({ checkoutRequestId });
      return { status: 200, json: { status: 'completed', amountPaid: updatedTx.amount, resultDesc: updatedTx.resultDesc } };
    } else if (resultCode === "1032") {
      await db.collection('transactions').updateOne({ checkoutRequestId }, { $set: { status: 'failed', failReason: 'User cancelled' } });
      return { status: 200, json: { status: 'failed', resultDesc: 'User cancelled' } };
    } else if (resultCode === "1037") {
      await db.collection('transactions').updateOne({ checkoutRequestId }, { $set: { status: 'failed', failReason: 'Timeout' } });
      return { status: 200, json: { status: 'failed', resultDesc: 'Timeout' } };
    } else if (resultCode !== undefined) {
      await db.collection('transactions').updateOne({ checkoutRequestId }, { $set: { status: 'failed', failReason: queryRes.data.ResultDesc } });
      return { status: 200, json: { status: 'failed', resultDesc: queryRes.data.ResultDesc } };
    }
  }
  return { status: 200, json: { status: 'pending' } };
}

async function handleSuccessfulPayment(checkoutRequestId, db, resultDesc) {
  const tx = await db.collection('transactions').findOne({ checkoutRequestId, status: 'pending' });
  if (!tx) return;

  await db.collection('transactions').updateOne(
    { checkoutRequestId },
    { $set: { status: 'completed', resultDesc, completedAt: new Date() } }
  );

  if (tx.type === 'crowdfund') {
    await db.collection('opportunities').updateOne(
      { id: tx.opportunityId },
      { $inc: { fundedAmount: tx.amount } }
    );
  } else if (tx.type === 'escrow') {
    await db.collection('pending_opportunities').updateOne(
      { 'opportunity.id': tx.opportunityId },
      { $set: { isEscrowFunded: true, escrowAmount: tx.amount, status: 'EscrowHeld' } }
    );
    await db.collection('opportunities').updateOne(
      { id: tx.opportunityId },
      { $set: { isEscrowFunded: true, escrowAmount: tx.amount } }
    );
    if (tx.applicationId) {
      const { ObjectId } = await import('mongodb');
      await db.collection('applications').updateOne(
        { _id: new ObjectId(tx.applicationId) },
        { $set: { status: 'approved', escrowFunded: true, updatedAt: new Date() } }
      );
    }
  }
}


router.post('/upload-image', upload.single('coverImage'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const base64Image = req.file.buffer.toString('base64');
    const formData = new URLSearchParams();
    formData.append('image', base64Image);

    // Using the ImgBB API key
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '3c9815af4ede90b33765fe8fa05dcb65';

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('ImgBB upload failed:', data);
      throw new Error(data.error?.message || 'Failed to upload to image host');
    }

    res.json({ imageUrl: data.data.url });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

router.post('/parse-opportunity', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ error: 'rawText is required.' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY missing.' });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
      - If the category is 'Project' or 'StudentProject', you MUST extract 'Timeline' as a feature in the extractedFeatures array. Any other complex project requirements (like daily availability duration) should just be merged nicely into the description.
      - Extract 'Venue' or 'Location' as the 'Location' feature.

      Respond ONLY with a valid JSON object using the following structure. Do not include markdown formatting like \`\`\`json.
      
      {
        "basicInfo": {
          "title": "...",
          "provider": "...",
          "category": "...",
          "description": "...",
          "fullDescription": "...",
          "fundingType": "Fully Funded | Partially Funded | Paid Internship | Unpaid Internship | N/A",
          "compensationType": "Paid | Stipend | Unpaid | N/A",
          "upfrontCost": "No Upfront Cost | Has Upfront Cost"
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
          }
        ],
        "eligibilityRequirements": ["Requirement 1", "Requirement 2"],
        "benefits": ["Benefit 1", "Benefit 2"],
        "thematicAreas": [
          {
            "heading": "...",
            "topics": ["topic 1", "topic 2"]
          }
        ],
        "suggestCustomForm": false
      }
      
      Intelligence Rules for New Fields:
      - compensationType: Use 'Paid' if a salary is mentioned, 'Stipend' for fixed pocket money/allowance, 'Unpaid' if zero payment, and 'N/A' for conferences/events.
      - upfrontCost: Set to 'No Upfront Cost' ONLY if the text explicitly says travel/visa are covered, if it's remote, or if it is local to Kenya with zero fees. 
      - If the opportunity is international and doesn't mention airfare/visa coverage, set upfrontCost to 'Has Upfront Cost'.
      - suggestCustomForm: Set to true ONLY IF category is 'Job' or 'Internship' AND there is NO clear external application URL detected in the text. This allows the poster to build an internal form.

      Raw Text to analyze:
      """
      ${rawText}
      """
    `;

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (apiError) {
      if (apiError.message?.includes('503') || apiError.message?.includes('demand') || apiError.message?.includes('overloaded')) {
        console.warn(`[GEMINI DELAY] API is currently overloaded. Waiting 3 seconds before retrying exactly once...`);
        // Wait 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Retry with the exact same model since demand spikes are usually extremely short-lived
        result = await model.generateContent(prompt);
      } else {
        throw apiError;
      }
    }

    const responseText = result.response.text();
    const cleaned = responseText.replace(/```[\s\S]*?```/g, '').trim();
    const parsedData = JSON.parse(cleaned);
    res.json(parsedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to parse text", details: error.message });
  }
});

// ── Agnes AI 2.0 Flash parsing endpoint (public) ─────────────────────────────
// Faster, more reliable alternative to Gemini. Uses OpenAI-compatible API.
router.post('/parse-agnes', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ error: 'rawText is required.' });
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY missing.' });

    const openai = (await import('openai')).default || (await import('openai'));
    const Client = openai.OpenAI || openai;
    const client = new Client({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://apihub.agnes-ai.com/v1'
    });

    const prompt = `You are an expert data extractor for a student and professional opportunities portal.
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
- If the category is 'Project' or 'StudentProject', you MUST extract 'Timeline' as a feature in the extractedFeatures array. Any other complex project requirements (like daily availability duration) should just be merged nicely into the description.
- Extract 'Venue' or 'Location' as the 'Location' feature.

Respond ONLY with a valid JSON object using the following structure. Do not include markdown formatting like \`\`\`json.

{
  "basicInfo": {
    "title": "...",
    "provider": "...",
    "category": "...",
    "description": "...",
    "fullDescription": "...",
    "fundingType": "Fully Funded | Partially Funded | Paid Internship | Unpaid Internship | N/A",
    "compensationType": "Paid | Stipend | Unpaid | N/A",
    "upfrontCost": "No Upfront Cost | Has Upfront Cost"
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
    }
  ],
  "eligibilityRequirements": ["Requirement 1", "Requirement 2"],
  "benefits": ["Benefit 1", "Benefit 2"],
  "thematicAreas": [
    {
      "heading": "...",
      "topics": ["topic 1", "topic 2"]
    }
  ],
  "suggestCustomForm": false
}

Intelligence Rules for New Fields:
- compensationType: Use 'Paid' if a salary is mentioned, 'Stipend' for fixed pocket money/allowance, 'Unpaid' if zero payment, and 'N/A' for conferences/events.
- upfrontCost: Set to 'No Upfront Cost' ONLY if the text explicitly says travel/visa are covered, if it's remote, or if it is local to Kenya with zero fees.
- If the opportunity is international and doesn't mention airfare/visa coverage, set upfrontCost to 'Has Upfront Cost'.
- suggestCustomForm: Set to true ONLY IF category is 'Job' or 'Internship' AND there is NO clear external application URL detected in the text. This allows the poster to build an internal form.

Raw Text to analyze:
"""
${rawText}
"""`;

    const response = await client.chat.completions.create({
      model: 'agnes-2.0-flash',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const responseText = response.choices[0]?.message?.content || '';
    const cleaned = responseText.replace(/```[\s\S]*?```/g, '').trim();
    const parsedData = JSON.parse(cleaned);
    res.json(parsedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to parse via Agnes AI", details: error.message });
  }
});

router.post('/submit-opportunity', async (req, res) => {
  try {
    const { opportunity, reporter } = req.body;
    if (
      !opportunity ||
      !reporter ||
      !reporter.name ||
      !reporter.organization ||
      !reporter.role ||
      !reporter.telephone ||
      !reporter.email ||
      !reporter.websiteOrSocial
    ) {
      return res.status(400).json({ error: 'Opportunity data and full reporter identity details are required.' });
    }

    // ── MANDATORY ESCROW for Job and Gig categories ────────────────────────────
    const JOB_CATEGORIES = ['Job', 'Gig'];
    if (JOB_CATEGORIES.includes(opportunity.category)) {
      if (!opportunity.isEscrow) {
        return res.status(400).json({
          error: 'Escrow protection is mandatory for Job and Gig listings. Please enable escrow and set an amount before submitting.'
        });
      }
      if (!opportunity.escrowAmount || Number(opportunity.escrowAmount) < 100) {
        return res.status(400).json({
          error: 'Escrow amount must be at least KES 100 for Job and Gig listings.'
        });
      }
    }

    // ── Block poster from re-submitting an edit of a live Job/Gig ──────────────
    if (opportunity.editOf && JOB_CATEGORIES.includes(opportunity.category)) {
      const db0 = getDB();
      const liveJob = await db0.collection('opportunities').findOne({ id: opportunity.editOf });
      if (liveJob && JOB_CATEGORIES.includes(liveJob.category)) {
        return res.status(403).json({
          error: 'Jobs and Gigs cannot be edited after approval to protect the integrity of the escrow agreement.'
        });
      }
    }

    // ── Project endorsement required ─────────────────────────────────────────
    const PROJECT_CATEGORIES = ['StudentProject', 'Project'];
    if (PROJECT_CATEGORIES.includes(opportunity.category)) {
      const endorsement = opportunity.institutionalEndorsement;
      if (!endorsement?.institutionName?.trim() || !endorsement?.contactTitle?.trim()) {
        return res.status(400).json({ error: 'Institution name and endorser role are required for project posts.' });
      }
      if (!endorsement.evidenceUrl?.trim() && !endorsement.adminEvidenceFile && !opportunity.kycProofFilename) {
        return res.status(400).json({ error: 'Endorsement evidence (upload or link) is required for project posts.' });
      }
      if (opportunity.isEscrow) {
        if (!opportunity.escrowAmount || Number(opportunity.escrowAmount) < 100) {
          return res.status(400).json({ error: 'Funding goal must be at least KES 100 when raising funds.' });
        }
        if (!opportunity.providerMpesa?.trim()) {
          return res.status(400).json({ error: 'M-PESA payout number is required when raising funds.' });
        }
      } else {
        opportunity.isEscrow = false;
        opportunity.escrowAmount = undefined;
      }
    }

    if (opportunity.category === 'Challenge') {
      opportunity.isEscrow = false;
      opportunity.escrowAmount = undefined;
    }

    const db = getDB();

    const normalizedReporter = {
      ...reporter,
      name: reporter.name.trim(),
      organization: reporter.organization.trim(),
      role: reporter.role.trim(),
      telephone: reporter.telephone.trim(),
      email: reporter.email.trim().toLowerCase(),
      websiteOrSocial: reporter.websiteOrSocial.trim(),
    };
    const riskFlags = detectRedFlags(opportunity, normalizedReporter);

    // Clean up temporary AI flags before saving
    if (opportunity.suggestCustomForm !== undefined) {
      delete opportunity.suggestCustomForm;
    }

    // Check if reporter is a verified organization
    const org = await db.collection('organizations').findOne({
      email: normalizedReporter.email
    });

    const isOrganizationPost = !!org;
    const orgName = org ? org.orgName : null;

    // Save with status pending
    await db.collection('pending_opportunities').insertOne({
      reporter: normalizedReporter,
      opportunity,
      isOrganizationPost,
      orgName,
      status: 'Unverified',
      reviewState: 'Unverified',
      riskFlags,
      auditTrail: {
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        proofLinks: [],
      },
      submittedAt: new Date()
    });

    // Notify admin in the background
    sendAdminSubmissionNotification(normalizedReporter, opportunity).catch(err => {
      console.error('Submission notification failed:', err.message);
    });

    // Notify the poster that we received it
    sendPosterAcknowledgementEmail(normalizedReporter.email, normalizedReporter.name, opportunity.title).catch(err => {
      console.error('Acknowledgment email to poster failed:', err.message);
    });

    res.json({ message: 'Submitted successfully for verification.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/report-opportunity/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, details, reporterName, reporterEmail } = req.body;

    if (!id || !reason) {
      return res.status(400).json({ error: 'Report reason is required.' });
    }

    const db = getDB();
    await db.collection('opportunity_reports').insertOne({
      opportunityId: id,
      reason: reason.trim(),
      details: (details || '').trim(),
      reporterName: (reporterName || '').trim(),
      reporterEmail: (reporterEmail || '').trim().toLowerCase(),
      status: 'open',
      submittedAt: new Date(),
    });

    res.json({ message: 'Report received. We will review it quickly.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/organizations/request
router.post('/organizations/request', async (req, res) => {
  try {
    const { name, organization, email, telephone, description } = req.body;

    if (!name || !organization || !email) {
      return res.status(400).json({ error: 'Name, Organization, and Email are required.' });
    }

    const db = getDB();

    // Save the request for Admin UI management
    await db.collection('organization_requests').insertOne({
      ...req.body,
      status: 'pending',
      requestedAt: new Date()
    });

    // Notify admin & requester
    sendOrganizationVerificationRequest(req.body).catch(err => console.error('Admin org notification failed:', err));
    sendOrganizationRequestAcknowledgement(req.body).catch(err => console.error('Requester org acknowledgement failed:', err));

    res.json({ message: 'Request sent successfully. We will contact you soon.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// Phase 4: Secure Data Access for Posters & Applicants
// ==========================================

// 1. Generate & Send OTP
router.post('/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const normalizedEmail = email.trim().toLowerCase();

    // Generate 4-digit code
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const db = getDB();
    await db.collection('auth_otps').updateOne(
      { email: normalizedEmail },
      { $set: { otp, createdAt: new Date() } },
      { upsert: true }
    );

    // Send it
    await sendOTPEmail(normalizedEmail, otp);
    res.json({ message: 'Code sent to email' });
  } catch (error) {
    console.error('OTP Send Error:', error);
    res.status(500).json({ error: 'Failed to send code' });
  }
});

// 2. Verify OTP & Issue Token
router.post('/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // OTP is only valid for 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const db = getDB();
    const record = await db.collection('auth_otps').findOne({
      email: normalizedEmail,
      otp,
      createdAt: { $gt: tenMinutesAgo }
    });

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired code. Codes are valid for 10 minutes.' });
    }

    // Burn the code after successful use
    await db.collection('auth_otps').deleteOne({ _id: record._id });

    // Issue JWT
    const token = generateUserToken(normalizedEmail);
    res.json({ token, email: normalizedEmail });
  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// 3. SECURE ENDPOINT: Get Applicant's History
router.get('/me/applications', verifyUserToken, async (req, res) => {
  try {
    const email = req.user.email;
    const db = getDB();

    // Convert status='Pending' to 'pending' from old data
    const applications = await db.collection('applications')
      .find({ applicantEmail: email })
      .sort({ appliedAt: -1 })
      .toArray();

    // Map through applications and inject contactEmail if approved/paid
    for (let app of applications) {
      if (app.status === 'Pending') app.status = 'pending'; // Fallback
      if (app.status === 'approved' || app.status === 'paid') {
        const opp = await db.collection('opportunities').findOne({ id: app.opportunityId });
        const originalPending = await db.collection('pending_opportunities').findOne({ 'opportunity.id': app.opportunityId });
        app.posterContactEmail = opp?.contactEmail || originalPending?.reporter?.email;
      }
    }

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. SECURE ENDPOINT: Get Poster's Jobs
router.get('/me/posts', verifyUserToken, async (req, res) => {
  try {
    const email = req.user.email;
    const db = getDB();

    // Find jobs in raw opportunities and pending_opportunities
    const livePosts = await db.collection('opportunities')
      .find({ 'reporter.email': email }) // Assuming you saved reporter info or contactEmail
      .toArray();

    // Because in our submit route we saved reporter: { email } to pending_opportunities and might not have persisted reporter to the main opportunities initially,
    // let's grab from both to be safe, or just look up anything linked to their email string. We track submitted stuff.
    const pendingPosts = await db.collection('pending_opportunities')
      .find({ 'reporter.email': email })
      .toArray();

    res.json({ live: livePosts, pending: pendingPosts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. SECURE ENDPOINT: Get Candidates for a specific Job owned by this Poster
router.get('/me/posts/:id/applicants', verifyUserToken, async (req, res) => {
  try {
    const { id } = req.params;
    const email = req.user.email;
    const db = getDB();

    // Verify ownership
    const opp = await db.collection('opportunities').findOne({ id });
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

    // NOTE: If your opportunity object doesn't strictly have `reporter.email` attached to the live document, 
    // you might need to check pending_opportunities for ownership. Let's do that:
    const originalPending = await db.collection('pending_opportunities').findOne({ 'opportunity.id': id });
    if (originalPending?.reporter?.email !== email && opp.contactEmail !== email) {
      return res.status(403).json({ error: 'You do not own this post' });
    }

    const applicants = await db.collection('applications')
      .find({ opportunityId: id })
      .sort({ appliedAt: -1 })
      .toArray();

    res.json(applicants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. SECURE ENDPOINT: Delete pending post
router.delete('/me/posts/:id', verifyUserToken, async (req, res) => {
  try {
    const { id } = req.params;
    const email = req.user.email;
    const db = getDB();

    // Only allow deletion of pending_opportunities. 
    // First, verify if it is in pending_opportunities and matches the email
    const pendingPost = await db.collection('pending_opportunities').findOne({
      'opportunity.id': id,
      'reporter.email': email
    });

    if (!pendingPost) {
      return res.status(404).json({ error: 'Pending post not found or you do not have permission to delete it.' });
    }

    // Ensure it's not actually live
    const livePost = await db.collection('opportunities').findOne({ id });
    if (livePost) {
      return res.status(403).json({ error: 'Cannot delete a live post.' });
    }

    await db.collection('pending_opportunities').deleteOne({ _id: pendingPost._id });

    res.json({ success: true, message: 'Pending post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/applications/:appId/status', verifyUserToken, async (req, res) => {
  try {
    const { appId } = req.params;
    const { status, reason } = req.body;
    const email = req.user.email;
    const db = getDB();

    const application = await db.collection('applications').findOne({ _id: new ObjectId(appId) });
    if (!application) return res.status(404).json({ error: 'Application not found' });

    if (status === 'disputed') {
      // Must be the applicant raising the dispute
      if (application.applicantEmail !== email) {
        return res.status(403).json({ error: 'Only the applicant can raise a dispute.' });
      }

      const oppId = application.opportunityId;
      const opp = await db.collection('opportunities').findOne({ id: oppId });
      const originalPending = await db.collection('pending_opportunities').findOne({ 'opportunity.id': oppId });

      const posterEmail = application.posterContactEmail || opp?.contactEmail || originalPending?.reporter?.email;
      const escrowAmount = opp?.escrowAmount || originalPending?.opportunity?.escrowAmount;

      // In production, an actual email using nodemailer (e.g. `sendDisputeAlertEmail()`) would fire here.
      console.log(`\n\x1b[31m[SYSTEM ALERT] DISPUTE RAISED OFFLINE TRIGGRED\x1b[0m`);
      console.log(`Email Sent to: admin@opportunities.ke`);
      console.log(`Job Title: ${opp?.title || originalPending?.opportunity?.title}`);
      console.log(`Applicant Email: ${email}`);
      console.log(`Poster Email: ${posterEmail}`);
      console.log(`Escrow Amount at Risk: KES ${escrowAmount}`);
      console.log(`Complaint from Applicant: "${reason || 'No specific reason provided'}"`);
      console.log(`\x1b[33mAdmin must reply-all to ${email} and ${posterEmail} to mediate.\x1b[0m\n`);

    } else {
      // For all other statuses ('approved', 'rejected', 'paid'), ONLY the poster can trigger them.
      const oppId = application.opportunityId;
      const opp = await db.collection('opportunities').findOne({ id: oppId });
      const originalPending = await db.collection('pending_opportunities').findOne({ 'opportunity.id': oppId });

      if (originalPending?.reporter?.email !== email && opp?.contactEmail !== email) {
        return res.status(403).json({ error: 'You do not own the post this application is for' });
      }

      // If it's currently disputed, the poster cannot change the status! Admin locked.
      if (application.status === 'disputed' || application.status?.startsWith('resolved_')) {
        return res.status(403).json({ error: 'Status is locked. An active dispute is underway.' });
      }
    }

    const updateDoc = { $set: { status, updatedAt: new Date() } };
    if (reason && status === 'disputed') {
      updateDoc.$set.disputeReason = reason;
    }

    await db.collection('applications').updateOne(
      { _id: new ObjectId(appId) },
      updateDoc
    );

    // Create Notification for the Applicant
    if (status !== 'disputed') {
      let actionText = '';
      if (status === 'approved') actionText = 'approved your application';
      else if (status === 'rejected') actionText = 'declined your application';
      else if (status === 'shortlisted') actionText = 'shortlisted you';
      else if (status === 'interviewing') actionText = 'wants to interview you';
      else if (status === 'paid') actionText = 'marked you as paid';

      if (actionText) {
        await db.collection('notifications').insertOne({
          email: application.applicantEmail.toLowerCase(),
          type: 'application_update',
          title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: `The poster for "${application.opportunityTitle}" has ${actionText}.`,
          isRead: false,
          createdAt: new Date(),
          link: '/applied' // link to Tracker
        });
      }
    }

    res.json({ message: 'Status updated successfully', status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit an application to a custom internal form
router.post('/opportunities/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, data } = req.body; // 'data' is the JSON object mapped to the form keys

    if (!email || !data || typeof data !== 'object') {
      return res.status(400).json({ error: "Applicant email and application data are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = getDB();
    const opportunity = await db.collection('opportunities').findOne({ id });

    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found." });
    }

    if (!opportunity.applicationForm?.isEnabled) {
      return res.status(400).json({ error: "This opportunity does not accept internal applications." });
    }

    // Check for double applying
    const existing = await db.collection('applications').findOne({ opportunityId: id, applicantEmail: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: "You have already applied to this opportunity." });
    }

    // For Job/Gig, a valid M-PESA number is required so the admin can remit payment
    const JOB_CATEGORIES = ['Job', 'Gig'];
    if (JOB_CATEGORIES.includes(opportunity.category)) {
      const mpesaNumber = (data.mpesa_number || '').toString().trim();
      if (!/^2547\d{8}$/.test(mpesaNumber)) {
        return res.status(400).json({
          error: 'A valid M-PESA number in the format 2547XXXXXXXX is required for Job and Gig applications.'
        });
      }
    }

    // Insert the new application
    await db.collection('applications').insertOne({
      opportunityId: id,
      opportunityTitle: opportunity.title,
      applicantEmail: normalizedEmail,
      applicantData: data,
      status: 'pending',
      appliedAt: new Date(),
    });

    res.status(201).json({ message: "Application submitted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ==========================================
// Phase 3: The Escrow Financial Engine
// ==========================================

// Initiate STK Push (Poster depositing Escrow)
router.post('/payments/deposit', verifyUserToken, async (req, res) => {
  try {
    const { amount, phone, opportunityId, applicationId } = req.body;
    const email = req.user.email;
    const db = getDB();

    if (!amount || amount < 1) return res.status(400).json({ error: 'Valid amount required' });
    if (!phone || !phone.match(/^2547\d{8}$/)) return res.status(400).json({ error: 'Valid Safaricom phone required (format 2547XXXXXXXX)' });

    // ── Validate ownership: check pending first, then live opportunities ───────
    let opportunityCategory = null;
    const pendingOpp = await db.collection('pending_opportunities').findOne({ 'opportunity.id': opportunityId });
    if (pendingOpp) {
      if (pendingOpp.reporter?.email !== email) {
        return res.status(403).json({ error: 'Unauthorized to fund this post' });
      }
      opportunityCategory = pendingOpp.opportunity?.category;
    } else {
      // Job was already approved and is now live
      const liveOpp = await db.collection('opportunities').findOne({ id: opportunityId });
      if (!liveOpp || liveOpp.reporter?.email !== email) {
        return res.status(403).json({ error: 'Unauthorized to fund this post' });
      }
      opportunityCategory = liveOpp.category;
    }

    // ── Only allow escrow deposits for Job/Gig ─────────────────────────────────
    if (!['Job', 'Gig'].includes(opportunityCategory)) {
      return res.status(400).json({ error: 'Escrow deposits are only allowed for Job and Gig listings.' });
    }

    // Call Daraja Sandbox
    const result = await initiateSTKPush(phone, amount, opportunityId, 'Escrow Deposit');

    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Failed to initiate STK Push' });
    }

    // Log transaction so the webhook can find it
    await db.collection('transactions').insertOne({
      opportunityId,
      applicationId: applicationId || null,
      posterEmail: email,
      amount,
      phone,
      checkoutRequestId: result.data.CheckoutRequestID,
      status: 'pending',
      type: 'escrow',
      createdAt: new Date(),
    });

    res.json({
      message: 'STK Push sent to your phone. Enter PIN to complete deposit.',
      checkoutRequestId: result.data.CheckoutRequestID
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initiate STK Push (Public Crowdfunding for Projects/Hackathons)
router.post('/payments/crowdfund', async (req, res) => {
  try {
    const { amount, phone, opportunityId, name, isAnonymous } = req.body;
    const db = getDB();

    if (!amount || amount < 10) return res.status(400).json({ error: 'Valid amount required (Min KES 10)' });
    if (!phone || !phone.match(/^2547\d{8}$/)) return res.status(400).json({ error: 'Valid Safaricom phone required (format 2547XXXXXXXX)' });

    // Validate opportunity
    const liveOpp = await db.collection('opportunities').findOne({ id: opportunityId });
    if (!liveOpp) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    if (!['Project', 'StudentProject', 'Hackathon'].includes(liveOpp.category)) {
      return res.status(400).json({ error: 'Crowdfunding is only allowed for Community/Student Projects and Hackathons.' });
    }

    // Call Daraja Sandbox
    const { initiateSTKPush } = await import('../services/mpesaService.js');
    const result = await initiateSTKPush(phone, amount, opportunityId, 'Crowdfund Contribution');

    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Failed to initiate STK Push' });
    }

    // Log transaction so the webhook can find it
    await db.collection('transactions').insertOne({
      opportunityId,
      opportunityTitle: liveOpp.title,
      opportunityCategory: liveOpp.category,
      posterEmail: liveOpp.contactEmail || liveOpp.reporter?.email || 'N/A',
      contributorName: isAnonymous ? 'Anonymous' : (name || 'Anonymous'),
      contributorPhone: phone,
      amount,
      checkoutRequestId: result.data.CheckoutRequestID,
      status: 'pending',
      type: 'crowdfund',
      createdAt: new Date(),
    });

    res.json({
      message: 'STK Push sent to your phone. Enter PIN to contribute.',
      checkoutRequestId: result.data.CheckoutRequestID
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/public/opportunities/:id/contributors (Public Aggregation)
router.get('/opportunities/:id/contributors', async (req, res) => {
  try {
    const db = getDB();
    const opportunityId = req.params.id;

    const contributors = await db.collection('transactions').aggregate([
      { $match: { opportunityId, type: 'crowdfund', status: 'completed' } },
      { $group: { _id: "$contributorName", amount: { $sum: "$amount" } } },
      { $project: { name: { $ifNull: ["$_id", "Anonymous"] }, amount: 1, _id: 0 } },
      { $sort: { amount: -1 } }
    ]).toArray();

    res.json(contributors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/public/payments/crowdfund/status/:checkoutRequestId (Public Polling)
router.get('/payments/crowdfund/status/:checkoutRequestId', async (req, res) => {
  try {
    const db = getDB();
    const result = await checkDarajaStatus(req.params.checkoutRequestId, 'crowdfund', db);
    res.status(result.status).json(result.json);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/public/payments/status/:checkoutRequestId
router.get('/payments/status/:checkoutRequestId', verifyUserToken, async (req, res) => {
  try {
    const db = getDB();
    const tx = await db.collection('transactions').findOne({ checkoutRequestId: req.params.checkoutRequestId });

    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    if (tx.posterEmail !== req.user.email) return res.status(403).json({ error: 'Unauthorized to view this transaction' });

    const result = await checkDarajaStatus(req.params.checkoutRequestId, 'escrow', db);
    res.status(result.status).json(result.json);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Daraja Webhook Callback (Safaricom calls this silently)
// SECURITY: Validate CheckoutRequestID against our own DB before trusting any data.
// A forged callback from an attacker will not match a real transaction we initiated.
router.post('/payments/mpesa/callback', async (req, res) => {
  try {
    const callbackData = req.body?.Body?.stkCallback;
    if (!callbackData) return res.status(200).send('OK');

    const db = getDB();
    const checkoutRequestId = callbackData.CheckoutRequestID;

    // SECURITY: Reject callbacks with no ID.
    if (!checkoutRequestId) {
      console.warn('[M-PESA] Callback received with no CheckoutRequestID. Ignoring.');
      return res.status(200).send('OK');
    }

    // SECURITY: Only process callbacks for transactions WE created with status 'pending'.
    // This blocks webhook forgery — an attacker's ID won't exist in our DB.
    const existingTx = await db.collection('transactions').findOne({ checkoutRequestId, status: 'pending' });
    if (!existingTx) {
      console.warn(`[M-PESA] SECURITY: Callback for unknown or already-processed ID: ${checkoutRequestId}. Ignoring.`);
      return res.status(200).send('OK'); // Always return 200 to Safaricom to stop retries
    }

    // ResultCode 0 means Success
    if (callbackData.ResultCode === 0) {
      const meta = callbackData.CallbackMetadata?.Item || [];
      const receiptNo = meta.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
      const amountPaid = meta.find(i => i.Name === 'Amount')?.Value;

      // SECURITY: Cross-check paid amount vs. what was requested.
      // Prevents underpayment attacks (e.g. paying KES 1 for a KES 1000 escrow).
      if (amountPaid && existingTx.amount && Number(amountPaid) < Number(existingTx.amount)) {
        console.warn(`[M-PESA] SECURITY: Amount mismatch on ${checkoutRequestId}. Expected KES ${existingTx.amount}, got KES ${amountPaid}.`);
        await db.collection('transactions').updateOne(
          { checkoutRequestId },
          { $set: { status: 'failed', failReason: 'Amount mismatch — possible underpayment', completedAt: new Date() } }
        );
        return res.status(200).send('OK');
      }

      await handleSuccessfulPayment(checkoutRequestId, db, 'Completed via Webhook');
    } else {
      // Payment Failed or User Cancelled
      await db.collection('transactions').updateOne(
        { checkoutRequestId },
        { $set: { status: 'failed', failReason: callbackData.ResultDesc, completedAt: new Date() } }
      );
      console.log(`[M-PESA] Payment failed for ${checkoutRequestId}: ${callbackData.ResultDesc}`);
    }

    res.status(200).send('Webhook Processed');
  } catch (error) {
    console.error('M-PESA Callback Error:', error);
    res.status(500).send('Error');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Poster approves escrow release → notifies admin to send STK to job doer
// ─────────────────────────────────────────────────────────────────────────────
router.post('/me/posts/:opportunityId/release-escrow', verifyUserToken, async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { applicationId } = req.body;
    const email = req.user.email;
    const db = getDB();
    const { ObjectId } = await import('mongodb');

    if (!applicationId) return res.status(400).json({ error: 'applicationId is required.' });

    // Verify poster owns the job
    const opp = await db.collection('opportunities').findOne({ id: opportunityId });
    const pendingOpp = await db.collection('pending_opportunities').findOne({ 'opportunity.id': opportunityId });
    const posterEmail = opp?.reporter?.email || pendingOpp?.reporter?.email;
    if (!opp || posterEmail !== email) {
      return res.status(403).json({ error: 'You do not own this job post.' });
    }

    // Verify escrow is funded
    if (!opp.isEscrowFunded) {
      return res.status(400).json({ error: 'Escrow has not been funded yet for this job.' });
    }

    // Verify the application is approved and belongs to this job
    const application = await db.collection('applications').findOne({
      _id: new ObjectId(applicationId),
      opportunityId,
      status: 'approved'
    });

    if (!application) {
      return res.status(404).json({ error: 'Approved application not found for this job.' });
    }

    // Get the applicant's M-PESA number
    const mpesaNumber = application.applicantData?.mpesa_number;
    if (!mpesaNumber || !/^2547\d{8}$/.test(mpesaNumber.toString())) {
      return res.status(400).json({ error: 'Applicant does not have a valid M-PESA number on record.' });
    }

    // Calculate net payout (escrowAmount - 5% platform fee - 2% M-PESA B2C fee)
    const escrowAmount = opp.escrowAmount || 0;
    const platformFee = Math.ceil(escrowAmount * 0.05);
    const transactionFee = Math.ceil((escrowAmount - platformFee) * 0.02);
    const netPayable = escrowAmount - platformFee - transactionFee;

    // Call Daraja B2C API
    const { initiateB2CPayout } = await import('../services/mpesaService.js');
    const b2cResult = await initiateB2CPayout(mpesaNumber, netPayable, `Payout for ${opportunityId}`);

    if (!b2cResult.success) {
      return res.status(500).json({ error: b2cResult.error || 'Failed to initiate Daraja B2C Payout' });
    }

    // Log the transaction
    await db.collection('transactions').insertOne({
      opportunityId,
      applicationId,
      posterEmail: email,
      recipientEmail: application.applicantEmail,
      phone: mpesaNumber,
      amount: netPayable,
      conversationId: b2cResult.data.ConversationID,
      status: 'pending',
      type: 'payout',
      createdAt: new Date(),
    });

    // Mark release as requested on the application
    await db.collection('applications').updateOne(
      { _id: new ObjectId(applicationId) },
      {
        $set: {
          escrowReleaseRequested: true,
          escrowReleaseRequestedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    res.json({
      message: '✅ Payment release successfully requested via Daraja B2C.',
      netPayable,
      applicantPhone: mpesaNumber
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Creator submits a Payout Request (Crowdfunding Expenses)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/me/posts/:id/payout-request', verifyUserToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { expenseType, vendorName, reason, amount, paybillNumber, receiptUrl } = req.body;
    const email = req.user.email;
    const db = getDB();

    if (!expenseType || !vendorName || !reason || !amount || !paybillNumber) {
      return res.status(400).json({ error: 'Missing required payout request fields.' });
    }

    // Verify ownership
    const opp = await db.collection('opportunities').findOne({ id });
    const pendingOpp = await db.collection('pending_opportunities').findOne({ 'opportunity.id': id });
    const posterEmail = opp?.reporter?.email || pendingOpp?.reporter?.email;

    if (!opp && !pendingOpp) {
      return res.status(404).json({ error: 'Opportunity not found.' });
    }
    if (posterEmail !== email) {
      return res.status(403).json({ error: 'You do not own this project.' });
    }

    const { ObjectId } = await import('mongodb');
    const newRequest = {
      _id: new ObjectId(),
      expenseType,
      vendorName,
      reason,
      amount: Number(amount),
      paybillNumber,
      receiptUrl: receiptUrl || null,
      status: 'pending',
      requestedAt: new Date()
    };

    // Add to the opportunity's payoutRequests array
    await db.collection('opportunities').updateOne(
      { id },
      { $push: { payoutRequests: newRequest } }
    );
    // Also update pending collection if it's there
    await db.collection('pending_opportunities').updateOne(
      { 'opportunity.id': id },
      { $push: { 'opportunity.payoutRequests': newRequest } }
    );

    res.status(201).json({ message: 'Payout request submitted successfully.', request: newRequest });
  } catch (err) {
    console.error('Error submitting payout request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Daraja B2C Webhook Callback
router.post('/payments/mpesa/b2c/result', async (req, res) => {
  try {
    const callbackData = req.body?.Result;
    if (!callbackData) return res.status(200).send('OK');

    const db = getDB();
    const conversationId = callbackData.ConversationID;

    // Must exist and be pending
    const existingTx = await db.collection('transactions').findOne({ conversationId, status: 'pending' });
    if (!existingTx) {
      return res.status(200).send('OK');
    }

    // ResultCode 0 means Success
    if (callbackData.ResultCode === 0) {
      const { ObjectId } = await import('mongodb');

      const receiptNo = callbackData.TransactionID;

      await db.collection('transactions').updateOne(
        { conversationId },
        { $set: { status: 'completed', receiptNo, completedAt: new Date() } }
      );

      // Mark the application as officially PAID
      await db.collection('applications').updateOne(
        { _id: new ObjectId(existingTx.applicationId) },
        { $set: { status: 'paid', updatedAt: new Date() } }
      );

      // Notify the freelancer
      await db.collection('notifications').insertOne({
        email: existingTx.recipientEmail.toLowerCase(),
        type: 'payment',
        title: `Payment Received!`,
        message: `Your payment of KES ${existingTx.amount} has been successfully sent to your M-PESA. (Receipt: ${receiptNo})`,
        isRead: false,
        createdAt: new Date(),
        link: '/applied'
      });
      console.log(`[B2C Payout] Success for ${existingTx.recipientEmail}. Receipt: ${receiptNo}`);

    } else {
      // Failed B2C transaction
      await db.collection('transactions').updateOne(
        { conversationId },
        { $set: { status: 'failed', failReason: callbackData.ResultDesc, completedAt: new Date() } }
      );

      const { ObjectId } = await import('mongodb');
      await db.collection('applications').updateOne(
        { _id: new ObjectId(existingTx.applicationId) },
        { $set: { escrowReleaseRequested: false, updatedAt: new Date() } } // Reset so they can try again
      );

      console.log(`[B2C Payout] Failed for ${existingTx.recipientEmail}: ${callbackData.ResultDesc}`);
    }

    res.status(200).send('Webhook Processed');
  } catch (error) {
    console.error('B2C Callback Error:', error);
    res.status(500).send('Error');
  }
});

// Daraja B2C Timeout Callback
router.post('/payments/mpesa/b2c/timeout', async (req, res) => {
  res.status(200).send('OK');
});

// ==========================================
// Phase 5: Bookmarks (Tracker)
// ==========================================

// ==========================================
// NOTIFICATIONS API
// ==========================================

// GET /api/public/me/notifications
router.get('/me/notifications', verifyUserToken, async (req, res) => {
  try {
    const email = req.user.email;
    const db = getDB();
    const notifications = await db.collection('notifications')
      .find({ email: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/public/me/notifications/:id/read
router.put('/me/notifications/:id/read', verifyUserToken, async (req, res) => {
  try {
    const email = req.user.email;
    const { id } = req.params;
    const db = getDB();

    // Validate ObjectID if possible, or just string match if it's not ObjectID
    const query = { _id: new (require('mongodb').ObjectId)(id), email: email.toLowerCase() };

    await db.collection('notifications').updateOne(query, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/public/me/bookmarks
router.get('/me/bookmarks', verifyUserToken, async (req, res) => {
  try {
    const email = req.user.email;
    const db = getDB();
    const bookmarks = await db.collection('bookmarks').find({ email: email.toLowerCase() }).toArray();
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/public/bookmarks
router.post('/bookmarks', verifyUserToken, async (req, res) => {
  try {
    const email = req.user.email.toLowerCase();
    const { opportunityId } = req.body;
    if (!opportunityId) return res.status(400).json({ error: 'opportunityId required' });

    const db = getDB();
    const existing = await db.collection('bookmarks').findOne({ email, opportunityId });
    if (existing) {
      // Toggle off
      await db.collection('bookmarks').deleteOne({ _id: existing._id });
      res.json({ saved: false });
    } else {
      // Toggle on
      await db.collection('bookmarks').insertOne({
        email,
        opportunityId,
        savedAt: new Date()
      });
      res.json({ saved: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/public/upload-kyc
router.post('/upload-kyc', verifyUserToken, uploadKyc.single('kycDocument'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    res.json({ filename: req.file.filename, message: 'Proof uploaded securely.' });
  } catch (error) {
    console.error('KYC Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/public/endorsement/:opportunityId — public evidence for approved projects only
router.get('/endorsement/:opportunityId', async (req, res) => {
  try {
    const db = getDB();
    const opp = await db.collection('opportunities').findOne({ id: req.params.opportunityId });
    if (!opp || !['StudentProject', 'Project'].includes(opp.category)) {
      return res.status(404).json({ error: 'Endorsement not found.' });
    }
    const filename =
      opp.institutionalEndorsement?.adminEvidenceFile ||
      opp.kycProofFilename;
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(404).json({ error: 'Endorsement file not found.' });
    }
    const filePath = path.join(PROJECT_ROOT, 'backend', 'uploads', 'kyc', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Endorsement file not found.' });
    }
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/fix-ownership', async (req, res) => {
  try {
    const db = getDB();
    const targetEmail = 'ochiwilliampotieno@gmail.com';
    const result = await db.collection('opportunities').updateMany(
      {
        $or: [
          { title: { $regex: 'UHPC', $options: 'i' } },
          { title: { $regex: 'AGRO', $options: 'i' } },
          { category: 'Crowdfund' },
          { isEscrow: true, 'reporter.email': { $exists: false } }
        ]
      },
      {
        $set: {
          'reporter.email': targetEmail,
          'reporter.name': 'William',
          contactEmail: targetEmail
        }
      }
    );
    res.json({ message: 'Success', matched: result.matchedCount, modified: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/seed-opportunities', async (req, res) => {
  try {
    const db = getDB();


    // Delete expired opportunities
    await db.collection('opportunities').deleteMany({
      id: {
        $in: [
          'arice-scholarship-program-2026-27',
          'london-metropolitan-sanctuary-scholarship-2026',
          'hamad-bin-khalifa-university-scholarship-2026',
          'sbw-berlin-scholarship-in-germany-2026',
          'vice-chancellor-international-excellence-scholarship-2026'
        ]
      }
    });

    // Wipe out old duplicate Google Internships
    await db.collection('opportunities').deleteMany({
      title: { $regex: 'Google Student Researcher Internship', $options: 'i' }
    });

    const newOpps = [
      {
        id: 'boston-university-presidential-scholarship-2026',
        title: 'Boston University Presidential Scholarship 2026',
        provider: 'Boston University',
        category: 'Scholarship',
        description: 'A prestigious $25,000/year scholarship for high-achieving international students to pursue their undergraduate degree in the USA.',
        fullDescription: 'Are you looking for a high-value undergraduate scholarship in the USA? The Boston University Presidential Scholarship 2026 is an excellent opportunity for international students who want to study at one of the most prestigious universities in the United States. This funded scholarship in USA helps talented students from all over the world pursue their undergraduate degree at Boston University. The scholarship focuses on academic excellence, leadership potential, and active participation in extracurricular activities. It also supports cultural exchange by bringing students from different countries into one diverse academic environment.',
        deadline: '2026-12-01T23:59:59.000Z',
        location: 'Boston, USA',
        eligibility: { educationLevel: 'UnderGrad', requirements: ['International applicants eligible', 'Top 5% of graduating class', 'Strong SAT/ACT scores'] },
        benefits: ['$25,000 per academic year', 'Study at a top-ranked university'],
        applicationType: 'Platform Link',
        applicationLink: 'https://www.bu.edu/admissions/apply/',
        fundingType: 'Partially Funded',
        compensationType: 'N/A',
        upfrontCost: 'No Upfront Cost',
        featured: true,
        dateAdded: '2026-07-05T10:00:00.000Z',
        logoUrl: '/images/boston_university.png',
        postedBy: 'Opportunities Kenya Admin',
        contactEmail: 'admin@opportunities.ke',
        reporter: { name: 'Opportunities Kenya Admin', email: 'admin@opportunities.ke' },
        isVerified: true,
        status: 'Verified'
      },
      {
        id: 'bond-university-leadership-scholarships-2026',
        title: 'Bond University Leadership Scholarships 2026 in Australia',
        provider: 'Bond University',
        category: 'Scholarship',
        description: 'Bond University Leadership Scholarships 2026 offer an excellent opportunity for students with outstanding academic performance, leadership experience, and community involvement.',
        fullDescription: 'Bond University Leadership Scholarships 2026 offer an excellent opportunity for students with outstanding academic performance, leadership experience, and community involvement. These undergraduate scholarships in Australia aim to support talented students who want to pursue higher education at Bond University. The Bond University scholarships for undergraduates provides a 25% tuition fee remission for eligible undergraduate degree programs.',
        deadline: '2026-08-31T23:59:59.000Z',
        location: 'Australia',
        eligibility: { educationLevel: 'UnderGrad', requirements: ['International applicants eligible', 'Outstanding academic performance', 'Leadership experience'] },
        benefits: ['25% tuition fee remission'],
        applicationType: 'Platform Link',
        applicationLink: 'https://student-bond.studylink.com/index.cfm',
        fundingType: 'Partially Funded',
        compensationType: 'N/A',
        upfrontCost: 'No Upfront Cost',
        featured: true,
        dateAdded: '2026-07-05T10:00:00.000Z',
        logoUrl: '/images/bond_university.png',
        postedBy: 'Tracy',
        contactEmail: 'tracy@opportunities.ke',
        reporter: { name: 'Tracy', email: 'tracy@opportunities.ke' },
        isVerified: true,
        status: 'Verified'
      },
      {
        id: 'ellison-undergraduate-scholars-program-2027',
        title: 'Ellison Undergraduate Scholars Program 2027 in UK',
        provider: 'Ellison Institute of Technology (EIT) / University of Oxford',
        category: 'Scholarship',
        description: 'The Ellison Scholars Program is a fully funded scholarship in UK for outstanding students from around the world who want to create a positive global impact through science, research, and innovation.',
        fullDescription: 'Applications are open for the Ellison Undergraduate Scholars Program 2027 in UK. The Ellison Scholars Program is a fully funded scholarship in UK for outstanding students from around the world who want to create a positive global impact through science, research, and innovation. The Ellison Institute of Technology (EIT) offers this international scholarship in partnership with the University of Oxford. Through this undergraduate scholarship, students will study at one of the world’s top universities while working on innovative EIT projects that focus on solving major global challenges.',
        deadline: '2026-07-31T23:59:59.000Z',
        location: 'UK',
        eligibility: { educationLevel: 'UnderGrad', requirements: ['International applicants eligible', 'Passion for science, research, and innovation'] },
        benefits: ['Fully Funded undergraduate study at the University of Oxford', 'Hands-on research and innovation experience'],
        applicationType: 'Platform Link',
        applicationLink: 'https://eit.org/education-and-scholarships/undergraduate#Eligibility',
        fundingType: 'Fully Funded',
        compensationType: 'Stipend',
        upfrontCost: 'No Upfront Cost',
        featured: true,
        dateAdded: '2026-07-05T10:00:00.000Z',
        logoUrl: '/images/UK_ellison.jpg',
        postedBy: 'Kevin',
        contactEmail: 'kevin@opportunities.ke',
        reporter: { name: 'Kevin', email: 'kevin@opportunities.ke' },
        isVerified: true,
        status: 'Verified'
      },
      {
        id: 'salford-international-excellence-scholarship-2026',
        title: 'Salford International Excellence Scholarship 2026 in UK',
        provider: 'University of Salford',
        category: 'Scholarship',
        description: 'The University of Salford in Manchester, UK is offering this International Excellence Award for international students from all over the world.',
        fullDescription: 'Applications are open for the Salford International Excellence Scholarship 2026. The University of Salford in Manchester, UK is offering this International Excellence Award for international students from all over the world. This international scholarship is a partially funded scholarship in United Kingdom available for undergraduate and master’s degree programs. The Salford International Excellence Scholarship 2026 provides financial support to talented international students who show leadership potential.',
        deadline: '2026-07-14T23:59:59.000Z',
        location: 'UK',
        eligibility: { educationLevel: 'Both', requirements: ['International applicants eligible', 'Leadership potential'] },
        benefits: ['Tuition fee waiver ranging from £3000 to £3500'],
        applicationType: 'Platform Link',
        applicationLink: 'https://www.salford.ac.uk/international/scholarships/global-gold-excellence-scholarship',
        fundingType: 'Partially Funded',
        compensationType: 'N/A',
        upfrontCost: 'No Upfront Cost',
        featured: true,
        dateAdded: '2026-07-05T10:00:00.000Z',
        logoUrl: '/images/salford_scholarship.png',
        postedBy: 'Victor',
        contactEmail: 'victor@opportunities.ke',
        reporter: { name: 'Victor', email: 'victor@opportunities.ke' },
        isVerified: true,
        status: 'Verified'
      },
      {
        id: 'google-student-researcher-internship-2026',
        title: 'Google Student Researcher Internship 2026',
        provider: 'Google',
        category: 'Internship',
        description: "Become a Student Researcher! The Google Student Researcher Internship in USA is a paid internship for bachelor's and master's students.",
        fullDescription: "Become a Student Researcher! The Google Student Researcher Internship in USA is a paid internship for bachelor's and master's students. Work alongside world-class researchers and engineers to solve real-world problems. The internship offers an excellent opportunity to gain practical experience, develop your technical skills, and contribute to cutting-edge projects at Google.",
        deadline: '2026-12-31T23:59:59.000Z',
        location: 'USA (Multiple Locations)',
        eligibility: { educationLevel: 'Both', requirements: ["Currently enrolled in a Bachelor's or Master's degree program", 'Strong programming skills in C++, Java, or Python', 'Experience with data structures and algorithms'] },
        benefits: ['Paid internship', 'Relocation assistance (if eligible)', 'Mentorship from Google engineers'],
        applicationType: 'Platform Link',
        applicationLink: 'https://careers.google.com/students/',
        fundingType: 'Paid Internship',
        compensationType: 'Paid',
        upfrontCost: 'No Upfront Cost',
        featured: true,
        dateAdded: '2026-07-05T10:00:00.000Z',
        logoUrl: '/images/google.jpg',
        postedBy: 'Stephen',
        contactEmail: 'stephen@opportunities.ke',
        reporter: { name: 'Stephen', email: 'stephen@opportunities.ke' },
        isVerified: true,
        status: 'Verified'
      },
      {
        id: 'cyprus-science-university-scholarship',
        title: 'Cyprus Science University Scholarship',
        provider: 'Cyprus Science University',
        category: 'Scholarship',
        description: 'International students can apply for the Cyprus Science University Scholarship. The institute is offering scholarships for international students to pursue undergraduate or postgraduate degree programs.',
        fullDescription: "International students can apply for the Cyprus Science University Scholarship. The institute is offering scholarships for international students to pursue undergraduate or postgraduate degree programs. The university provides many ways to get financial help in your studies. This time Cyprus Science University is offering partially funded scholarships to support international students to help them with financial burden and promote education. The scholarship award will depend on student's SAT scores and the program they are enrolled for. All the international undergraduate students are entitled to receive up to 60% scholarship for undergraduate courses, and Postgraduate international students will receive up to 50% scholarship. Cyprus Science University is accredited by higher education authorities of Northern Cyprus and Turkey. It is an excellent chance to study in a European country next to Turkey.",
        deadline: '2026-08-31T23:59:59.000Z',
        location: 'Cyprus',
        eligibility: { educationLevel: 'Both', requirements: ['International applicants eligible'] },
        benefits: ['Up to 60% scholarship for undergraduate courses', 'Up to 50% scholarship for postgraduate courses'],
        applicationType: 'Platform Link',
        applicationLink: 'https://csu.edu.tr/',
        fundingType: 'Partially Funded',
        compensationType: 'N/A',
        upfrontCost: 'No Upfront Cost',
        featured: true,
        dateAdded: '2026-07-05T10:00:00.000Z',
        logoUrl: '/images/cyprus_science_university.jpg',
        postedBy: 'Hillary',
        contactEmail: 'hillary@opportunities.ke',
        reporter: { name: 'Hillary', email: 'hillary@opportunities.ke' },
        isVerified: true,
        status: 'Verified'
      }
    ];

    for (const opp of newOpps) {
      await db.collection('opportunities').updateOne(
        { id: opp.id },
        { $set: opp },
        { upsert: true }
      );
    }

    res.json({ message: 'Successfully seeded 6 opportunities. Old Google entries deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

// =========================================================
// ESCROW FUNDED NOTIFICATION — POST /api/public/escrow-funded
// =========================================================
// Called when an escrow transaction completes.
// Notifies the applicant (job doer) via email that the poster
// has deposited funds and the job is now active.
router.post('/escrow-funded', async (req, res) => {
  try {
    const { conversationId, amount, applicantEmail, opportunityTitle } = req.body;

    if (!conversationId || !applicantEmail) {
      return res.status(400).json({ error: 'conversationId and applicantEmail required' });
    }

    const db = getDB();

    // Fetch conversation to get applicant name
    const conv = await db.collection('conversations').findOne({ _id: conversationId });
    const applicantName = conv?.applicantName || 'Applicant';

    // Send email notification
    if (applicantEmail) {
      try {
        await sendEscrowFundedEmail({
          to: applicantEmail,
          applicantName,
          opportunityTitle: opportunityTitle || (conv?.opportunityTitle || 'the opportunity'),
          amount: amount || 'the deposited amount',
        });
        console.log(`[ESCROW] Notification sent to ${applicantEmail}`);
      } catch (emailErr) {
        console.error('[ESCROW] Email send failed:', emailErr.message);
      }
    }

    res.json({ success: true, message: 'Escrow funded notification processed' });
  } catch (error) {
    console.error('Escrow funded error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper: Send escrow-funded email using Resend
async function sendEscrowFundedEmail({ to, applicantName, opportunityTitle, amount }) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'Opportunities Kenya <noreply@opportunitieskenya.live>',
    to,
    subject: `âœ… Escrow Funded: ${opportunityTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0933ed;">Payment Received âœ…</h2>
        <p>Hi <strong>${applicantName}</strong>,</p>
        <p>Great news! The poster has successfully deposited <strong>KES ${amount}</strong> into escrow for:</p>
        <div style="background: #f0f4ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0; color: #0933ed;">${opportunityTitle}</h3>
        </div>
        <p>The job is now <strong style="color: green;">ACTIVE</strong> and you can start applying!</p>
        <br/>
        <a href="https://opportunitieskenya.live" style="display: inline-block; background: #0933ed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Your Dashboard</a>
        <br/><br/>
        <p style="color: #666; font-size: 12px;">Opportunities Kenya â€” Connecting talent with opportunity.</p>
      </div>
    `,
  });
}

// Refurbished
