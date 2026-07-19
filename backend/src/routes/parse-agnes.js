import express from 'express';
import { verifyAdminKey } from '../middleware/auth.js';

const router = express.Router();

// POST /api/admin/parse-agnes — Agnes AI (OpenAI-compatible) parsing endpoint
router.post('/', verifyAdminKey, async (req, res) => {
    try {
        const { rawText } = req.body;
        if (!rawText) return res.status(400).json({ error: 'rawText is required.' });
        if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not configured.' });

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

Raw Text: """\n${rawText}\n"""`;

        const response = await client.chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3
        });

        const responseText = response.choices[0]?.message?.content || '';
        const cleaned = responseText.trim();
        let parsedData;
        try {
            parsedData = JSON.parse(cleaned);
        } catch (jsonError) {
            console.error('JSON parse failed for Agnes AI:', jsonError);
            return res.status(500).json({ error: 'Model returned invalid JSON.' });
        }

        res.json({ ...parsedData, _model: model, _provider: 'agnes-ai' });
    } catch (error) {
        console.error('Agnes AI extraction error:', error);
        res.status(500).json({ error: 'Failed to parse via Agnes AI', details: error?.message || '' });
    }
});

export default router;