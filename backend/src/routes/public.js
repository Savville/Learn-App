import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDB } from '../config/database.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateUserToken, verifyUserToken } from '../middleware/auth.js';
import { 
  sendAdminSubmissionNotification, 
  sendPosterAcknowledgementEmail,
  sendOrganizationVerificationRequest,
  sendOrganizationRequestAcknowledgement,
  sendOTPEmail
} from '../services/emailService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

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

router.post('/upload-image', upload.single('coverImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  res.json({ imageUrl: `/images/opportunities/${req.file.filename}` });
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
      
      Categorize the opportunity into one of these: 'CallForPapers', 'Internship', 'Grant', 'Conference', 'Scholarship', 'Fellowship', 'Attachment', 'Hackathon', 'Event', 'Volunteer', 'Challenge', 'Project', 'Gig', 'Job', 'Other'.
      
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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleaned = responseText.replace(/```[\s\S]*?```/g, '').trim();
    const parsedData = JSON.parse(cleaned);
    res.json(parsedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to parse text", details: error.message });
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
    
    const db = getDB();
    const record = await db.collection('auth_otps').findOne({ email: normalizedEmail, otp });

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired code' });
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
    
    const applications = await db.collection('applications')
      .find({ applicantEmail: email })
      .sort({ appliedAt: -1 })
      .toArray();

    // Map opportunity titles and URLs if you want better links
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

    // Insert the new application
    await db.collection('applications').insertOne({
      opportunityId: id,
      opportunityTitle: opportunity.title,
      applicantEmail: normalizedEmail,
      applicantData: data,
      status: 'Pending',
      appliedAt: new Date(),
    });

    res.status(201).json({ message: "Application submitted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
