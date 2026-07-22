import express from 'express';
import { verifyAdminKey } from '../middleware/auth.js';

const router = express.Router();

// ── Parse Request Queue ──────────────────────────────────────────────────────
// Agnes AI 2.0 Flash free tier allows 20 RPM. This queue ensures we process
// only one request at a time with a 3s gap between requests, staying well
// within the 20 RPM limit even under heavy load.
const queue = [];
let processing = false;
const QUEUE_PROCESS_DELAY_MS = 3000; // 3s between requests = 20 RPM

async function processQueue() {
    if (processing || queue.length === 0) return;
    processing = true;

    while (queue.length > 0) {
        const { req, res } = queue.shift();
        try {
            // Re-execute the parse logic for this queued request
            await handleParse(req, res);
        } catch (err) {
            console.error('[Queue] Parse failed for queued request:', err.message);
        }
        // Wait before next request
        if (queue.length > 0) {
            await new Promise(r => setTimeout(r, QUEUE_PROCESS_DELAY_MS));
        }
    }

    processing = false;
}

function enqueueParse(req, res) {
    queue.push({ req, res });
    console.log(`[Queue] Parse request enqueued. Queue size: ${queue.length}`);
    // Kick off processing
    processQueue();
}

// ── Parse Handler (shared by direct and queued calls) ────────────────────────
async function handleParse(req, res) {
    const { rawText } = req.body;
    if (!rawText) {
        res.status(400).json({ error: 'rawText is required.' });
        return;
    }
    if (!process.env.OPENAI_API_KEY) {
        res.status(500).json({ error: 'OPENAI_API_KEY not configured.' });
        return;
    }

    const openaiMod = await import('openai');
    const client = new openaiMod.OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL || 'https://apihub.agnes-ai.com/v1'
    });
    const model = process.env.OPENAI_MODEL || 'agnes-2.0-flash';

    const prompt = `You are an expert data extractor for a student and professional opportunities portal.
Analyze the following raw text and extract key data points to create an opportunity listing.

Categorize into: 'CallForPapers','Internship','Grant','Conference','Scholarship','Fellowship','Attachment','Hackathon','Event','Volunteer','Challenge','Project','StudentProject','Gig','Job','Partnership','StartupFunding','Other'.

Respond ONLY with valid JSON (no markdown):
{
  "basicInfo": {"title":"...","provider":"...","category":"...","description":"2-3 sentence summary","fundingType":"Fully Funded | Partially Funded | Paid Internship | Unpaid Internship | N/A"},
  "extractedFeatures": [{"feature":"Application Link","value":"URL or empty","importance":"High","notes":""},{"feature":"Deadline","value":"Date","importance":"High","notes":""},{"feature":"Location","value":"...","importance":"Medium","notes":""},{"feature":"Eligibility","value":"...","importance":"High","notes":""}]
}

Raw Text: """
${rawText}
"""`;

    let response;
    try {
        response = await client.chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3
        });
    } catch (apiError) {
        console.error('Agnes AI API error:', apiError);
        res.status(500).json({ error: 'Failed to parse via Agnes AI', details: apiError?.message || '' });
        return;
    }

    const responseText = response.choices?.[0]?.message?.content || '';
    const cleaned = responseText.trim();
    let parsedData;
    try {
        parsedData = JSON.parse(cleaned);
    } catch (jsonError) {
        console.error('JSON parse failed for Agnes AI:', jsonError);
        res.status(500).json({ error: 'Model returned invalid JSON.' });
        return;
    }

    res.json({ ...parsedData, _model: model, _provider: 'agnes-ai' });
}

// POST /api/admin/parse-agnes — Agnes AI (OpenAI-compatible) parsing endpoint
// Requests are queued to stay within Agnes AI's 20 RPM free tier limit.
router.post('/', verifyAdminKey, (req, res) => {
    enqueueParse(req, res);
});

export default router;