/**
 * Direct Agnes AI vs Gemini Parsing Test
 * 
 * Calls both APIs directly without needing the backend server running.
 * Reads sample TXT files from the OPPORTUNITIES/ folder (2 levels up).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const OPPORTUNITIES_DIR = path.join(ROOT_DIR, 'OPPORTUNITIES');

// Env vars
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://apihub.agnes-ai.com/v1';

console.log('='.repeat(80));
console.log('AGNES AI vs GEMINI DIRECT PARSING COMPARISON');
console.log('='.repeat(80));
console.log(`Gemini API Key: ${GEMINI_API_KEY ? '✓ Configured' : '✗ Missing'}`);
console.log(`OpenAI API Key: ${OPENAI_API_KEY ? '✓ Configured' : '✗ Missing'}`);
console.log(`OpenAI Base URL: ${OPENAI_BASE_URL}`);
console.log();

// Get sample TXT files
const txtFiles = fs.readdirSync(OPPORTUNITIES_DIR)
    .filter(f => f.endsWith('.txt'))
    .slice(0, 3); // Test with first 3 files

console.log(`Testing with ${txtFiles.length} sample files...\n`);

// Common prompt for both models
function buildPrompt(text) {
    return `You are an expert data extractor for a student and professional opportunities portal.
Analyze the following raw text and extract key data points to create an opportunity listing.

Categorize into one of: 'CallForPapers','Internship','Grant','Conference','Scholarship','Fellowship','Attachment','Hackathon','Event','Volunteer','Challenge','Project','StudentProject','Gig','Job','Partnership','StartupFunding','Other'.

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "basicInfo": {
    "title": "...",
    "provider": "...",
    "category": "...",
    "description": "2-3 sentence summary highlighting the most important info for the applicant.",
    "fundingType": "Fully Funded | Partially Funded | Paid Internship | Unpaid Internship | N/A"
  },
  "extractedFeatures": [
    {"feature": "Application Link", "value": "URL or empty", "importance": "High", "notes": "Critical for applying"},
    {"feature": "Deadline", "value": "Date", "importance": "High", "notes": ""},
    {"feature": "Location", "value": "...", "importance": "Medium", "notes": ""},
    {"feature": "Eligibility", "value": "...", "importance": "High", "notes": "Brief summary of who can apply"}
  ]
}

Raw Text: """
${text}
"""`;
}

// Parse JSON from model response (handles markdown fences)
function parseResponse(text) {
    const cleaned = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
    return JSON.parse(cleaned);
}

// Test with Gemini (direct API call)
async function testGemini(text) {
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const prompt = buildPrompt(text);

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3
            }
        });

        const response = await model.generateContent(prompt);

        return parseResponse(response.response.text());
    } catch (error) {
        return { _error: error.message };
    }
}

// Test with Agnes AI (via OpenAI SDK)
async function testAgnes(text) {
    try {
        const openai = new OpenAI({
            apiKey: OPENAI_API_KEY,
            baseURL: OPENAI_BASE_URL
        });

        const prompt = buildPrompt(text);

        const response = await openai.chat.completions.create({
            model: 'agnes-2.0-flash',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3
        });

        const responseText = response.choices[0]?.message?.content || '';
        return parseResponse(responseText);
    } catch (error) {
        return { _error: error.message };
    }
}

// Run comparison
async function runComparison() {
    const results = [];

    for (const file of txtFiles) {
        const filePath = path.join(OPPORTUNITIES_DIR, file);
        const text = fs.readFileSync(filePath, 'utf-8');

        console.log(`${'─'.repeat(70)}`);
        console.log(`📄 File: ${file}`);
        console.log(`   Size: ${text.length} characters`);
        console.log();

        // Test Gemini
        console.log('  ⏳ Calling Gemini 2.0 Flash...');
        let geminiResult;
        try {
            geminiResult = await testGemini(text);
            console.log(`  ✅ Gemini: "${geminiResult.basicInfo?.title || 'ERROR'}"`);
        } catch (e) {
            geminiResult = { _error: e.message };
            console.log(`  ❌ Gemini failed: ${e.message}`);
        }

        // Test Agnes AI
        console.log('  ⏳ Calling Agnes AI 2.0 Flash...');
        let agnesResult;
        try {
            agnesResult = await testAgnes(text);
            console.log(`  ✅ Agnes: "${agnesResult.basicInfo?.title || 'ERROR'}"`);
        } catch (e) {
            agnesResult = { _error: e.message };
            console.log(`  ❌ Agnes failed: ${e.message}`);
        }

        // Store comparison
        results.push({
            file,
            gemini: {
                success: !geminiResult._error,
                title: geminiResult.basicInfo?.title || null,
                provider: geminiResult.basicInfo?.provider || null,
                category: geminiResult.basicInfo?.category || null,
                fundingType: geminiResult.basicInfo?.fundingType || null,
                description: geminiResult.basicInfo?.description ? geminiResult.basicInfo.description.substring(0, 100) + '...' : null,
                deadline: geminiResult.extractedFeatures?.find(f => f.feature === 'Deadline')?.value || null,
                applicationLink: geminiResult.extractedFeatures?.find(f => f.feature === 'Application Link')?.value || null,
                error: geminiResult._error || null
            },
            agnes: {
                success: !agnesResult._error,
                title: agnesResult.basicInfo?.title || null,
                provider: agnesResult.basicInfo?.provider || null,
                category: agnesResult.basicInfo?.category || null,
                fundingType: agnesResult.basicInfo?.fundingType || null,
                description: agnesResult.basicInfo?.description ? agnesResult.basicInfo.description.substring(0, 100) + '...' : null,
                deadline: agnesResult.extractedFeatures?.find(f => f.feature === 'Deadline')?.value || null,
                applicationLink: agnesResult.extractedFeatures?.find(f => f.feature === 'Application Link')?.value || null,
                error: agnesResult._error || null
            }
        });

        // Print comparison
        console.log();
        console.log('  COMPARISON:');
        console.log(`  | Field       | Gemini                              | Agnes AI                           |`);
        console.log(`  |-------------|-------------------------------------|------------------------------------|`);
        console.log(`  | Title       | ${(geminiResult.basicInfo?.title || 'ERROR').substring(0, 39)} | ${(agnesResult.basicInfo?.title || 'ERROR').substring(0, 38)} |`);
        console.log(`  | Category    | ${(geminiResult.basicInfo?.category || 'ERROR').substring(0, 39)} | ${(agnesResult.basicInfo?.category || 'ERROR').substring(0, 38)} |`);
        console.log(`  | Funding     | ${(geminiResult.basicInfo?.fundingType || 'N/A').substring(0, 39)} | ${(agnesResult.basicInfo?.fundingType || 'N/A').substring(0, 38)} |`);
        console.log(`  | Deadline    | ${(geminiResult.extractedFeatures?.find(f => f.feature === 'Deadline')?.value || 'N/A').substring(0, 39)} | ${(agnesResult.extractedFeatures?.find(f => f.feature === 'Deadline')?.value || 'N/A').substring(0, 38)} |`);
        console.log();
    }

    // Summary
    console.log(`${'='.repeat(80)}`);
    console.log('FINAL SUMMARY');
    console.log('='.repeat(80));

    const geminiSuccess = results.filter(r => r.gemini.success).length;
    const agnesSuccess = results.filter(r => r.agnes.success).length;

    console.log(`  Gemini Success: ${geminiSuccess}/${results.length}`);
    console.log(`  Agnes AI Success: ${agnesSuccess}/${results.length}`);
    console.log();

    if (geminiSuccess === agnesSuccess) {
        console.log(`  🤝 Result: Tie! Both models parsed ${geminiSuccess}/${results.length} successfully.`);
    } else if (geminiSuccess > agnesSuccess) {
        console.log(`  🏆 Winner: Gemini (${geminiSuccess} vs ${agnesSuccess})`);
    } else {
        console.log(`  🏆 Winner: Agnes AI (${agnesSuccess} vs ${geminiSuccess})`);
    }

    // Save results to JSON file
    const outputPath = path.join(ROOT_DIR, 'backend', 'test-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n  📁 Full results saved to: ${outputPath}`);
}

runComparison().catch(console.error);