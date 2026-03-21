import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDB } from '../config/database.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendAdminSubmissionNotification, sendPosterAcknowledgementEmail } from '../services/emailService.js';

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
          "fullDescription": "A comprehensive, detailed description of the entire opportunity. If the category is Project/Challenge, explain the open-ended nature. Do NOT put benefits or eligibility here.",
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
          }
        ],
        "eligibilityRequirements": ["Requirement 1", "Requirement 2"],
        "benefits": ["Benefit 1", "Benefit 2"],
        "thematicAreas": [
          {
            "heading": "...",
            "topics": ["topic 1", "topic 2"]
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
    if (!opportunity || !reporter || !reporter.name || !reporter.email) {
        return res.status(400).json({ error: 'Opportunity data and reporter details are required.' });
    }
    const db = getDB();
    
    const doc = {
        opportunity, // holds title, provider, extractedFeatures, etc
        status: 'pending',
        reporter,
        submittedAt: new Date().toISOString(),
    };
    
    await db.collection('pending_opportunities').insertOne(doc);
    
    // Notify admin in the background
    sendAdminSubmissionNotification(reporter, opportunity).catch(err => {
        console.error('Submission notification failed:', err.message);
    });

    // Notify the poster that we received it
    sendPosterAcknowledgementEmail(reporter.email, reporter.name, opportunity.title).catch(err => {
        console.error('Acknowledgment email to poster failed:', err.message);
    });

    res.json({ message: 'Submitted successfully for verification.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
