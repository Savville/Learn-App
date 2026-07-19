/**
 * Agnes AI vs Gemini Parsing Comparison Test
 * 
 * Reads sample TXT files from OPPORTUNITIES/ folder
 * Sends each to both /api/admin/parse-opportunity (Gemini) 
 * and /api/admin/parse-agnes (Agnes AI)
 * Compares JSON output quality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

// Get sample TXT files
const OPPORTUNITIES_DIR = path.join(__dirname, '..', 'OPPORTUNITIES');
const txtFiles = fs.readdirSync(OPPORTUNITIES_DIR)
    .filter(f => f.endsWith('.txt'))
    .slice(0, 5); // Test with first 5 files

console.log('='.repeat(80));
console.log('AGNES AI vs GEMINI PARSING COMPARISON TEST');
console.log('='.repeat(80));
console.log(`Testing with ${txtFiles.length} sample files...\n`);

// Read all sample texts
const samples = txtFiles.map(file => ({
    file,
    text: fs.readFileSync(path.join(OPPORTUNITIES_DIR, file), 'utf-8')
}));

// Agnes AI client (uses OpenAI SDK)
const agnesClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: process.env.OPENAI_BASE_URL || 'https://apihub.agnes-ai.com/v1'
});

const PROMPT = `You are an expert data extractor for a student and professional opportunities portal.
Analyze the following raw text and extract key data points to create an opportunity listing.

Categorize into: 'CallForPapers','Internship','Grant','Conference','Scholarship','Fellowship','Attachment','Hackathon','Event','Volunteer','Challenge','Project','StudentProject','Gig','Job','Partnership','StartupFunding','Other'.

Respond ONLY with valid JSON (no markdown):
{
  "basicInfo": {"title":"...","provider":"...","category":"...","description":"2-3 sentence summary","fundingType":"Fully Funded | Partially Funded | Paid Internship | Unpaid Internship | N/A"},
  "extractedFeatures": [{"feature":"Application Link","value":"URL or empty","importance":"High","notes":""},{"feature":"Deadline","value":"Date","importance":"High","notes":""},{"feature":"Location","value":"...","importance":"Medium","notes":""},{"feature":"Eligibility","value":"...","importance":"High","notes":""}]
}

Raw Text: """\n${RAW_TEXT_PLACEHOLDER}\n"""`;

async function testGemini(sample) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/parse-opportunity`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rawText: sample.text })
        });

        if (!response.ok) {
            const error = await response.json();
            return { success: false, error };
        }

        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function testAgnes(sample) {
    try {
        const prompt = PROMPT.replace('${RAW_TEXT_PLACEHOLDER}', sample.text);

        const response = await agnesClient.chat.completions.create({
            model: 'agnes-2.0-flash',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3
        });

        const responseText = response.choices[0]?.message?.content || '';
        const cleaned = responseText.trim();

        try {
            return JSON.parse(cleaned);
        } catch (jsonError) {
            return { success: false, error: 'Invalid JSON from Agnes AI' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Run comparison test
async function runComparison() {
    const results = [];

    for (const sample of samples) {
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`📄 Testing: ${sample.file}`);
        console.log(`   Length: ${sample.text.length} characters`);
        console.log(`${'─'.repeat(60)}`);

        // Test Gemini
        console.log('  ⏳ Calling Gemini...');
        const geminiResult = await testGemini(sample);
        console.log(`  ✅ Gemini: ${geminiResult.basicInfo?.title || 'FAILED'}`);

        // Test Agnes AI
        console.log('  ⏳ Calling Agnes AI...');
        const agnesResult = await testAgnes(sample);
        console.log(`  ✅ Agnes AI: ${agnesResult.basicInfo?.title || 'FAILED'}`);

        // Compare
        const comparison = {
            file: sample.file,
            gemini: {
                success: !geminiResult.success,
                title: geminiResult.basicInfo?.title || null,
                category: geminiResult.basicInfo?.category || null,
                deadline: geminiResult.extractedFeatures?.find(f => f.feature === 'Deadline')?.value || null,
                error: geminiResult.error || null
            },
            agnes: {
                success: !agnesResult.success,
                title: agnesResult.basicInfo?.title || null,
                category: agnesResult.basicInfo?.category || null,
                deadline: agnesResult.extractedFeatures?.find(f => f.feature === 'Deadline')?.value || null,
                error: agnesResult.error || null
            }
        };

        results.push(comparison);

        // Show side-by-side comparison
        console.log('\n  COMPARISON:');
        console.log(`  | Field        | Gemini                    | Agnes AI                     |`);
        console.log(`  |--------------|---------------------------|------------------------------|`);
        console.log(`  | Title        | ${(geminiResult.basicInfo?.title || 'ERROR').substring(0, 27)} | ${(agnesResult.basicInfo?.title || 'ERROR').substring(0, 30)} |`);
        console.log(`  | Category     | ${(geminiResult.basicInfo?.category || 'ERROR').substring(0, 27)} | ${(agnesResult.basicInfo?.category || 'ERROR').substring(0, 30)} |`);
        console.log(`  | Deadline     | ${(geminiResult.extractedFeatures?.find(f => f.feature === 'Deadline')?.value || 'N/A').substring(0, 27)} | ${(agnesResult.extractedFeatures?.find(f => f.feature === 'Deadline')?.value || 'N/A').substring(0, 30)} |`);
    }

    // Summary
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('SUMMARY');
    console.log('='.repeat(80));

    const geminiSuccess = results.filter(r => r.gemini.success).length;
    const agnesSuccess = results.filter(r => r.agnes.success).length;

    console.log(`  Gemini Success: ${geminiSuccess}/${results.length}`);
    console.log(`  Agnes AI Success: ${agnesSuccess}/${results.length}`);

    if (geminiSuccess === agnesSuccess) {
        console.log(`  \n  🤝 Result: Tie! Both models parsed ${geminiSuccess}/${results.length} successfully.`);
    } else if (geminiSuccess > agnesSuccess) {
        console.log(`  \n  🏆 Winner: Gemini (${geminiSuccess} vs ${agnesSuccess})`);
    } else {
        console.log(`  \n  🏆 Winner: Agnes AI (${agnesSuccess} vs ${geminiSuccess})`);
    }
}

runComparison().catch(console.error);