/**
 * Gemini Model Tester for Agnishakti
 * Tests all available Gemini models to find which ones work
 * Run: node test_gemini_models.js
 */

const https = require('https');
const http = require('http');

// Load API keys from .env.local
require('dotenv').config({ path: '.env.local' });

// Comprehensive list of Gemini models to test (January 2026)
const ALL_GEMINI_MODELS = [
    // Gemini 3.x (Latest - December 2025)
    "gemini-3-flash-preview",
    "gemini-3-pro-preview",
    "gemini-3-pro-image-preview",

    // Gemini 2.5.x (Stable - June 2025)
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-pro-preview",
    "gemini-2.5-flash-preview",
    "gemini-2.5-flash-lite-preview",
    "gemini-2.5-flash-lite-preview-06-17",
    "gemini-2.5-flash-native-audio-preview-12-2025",
    "gemini-2.5-pro-preview-tts",
    "gemini-2.5-flash-preview-tts",

    // Gemini 2.0.x (Stable)
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-thinking-exp",
    "gemini-2.0-flash-thinking-exp-01-21",
    "gemini-2.0-pro-exp",
    "gemini-2.0-pro",

    // Gemini 1.5.x (Legacy but may still work)
    "gemini-1.5-pro",
    "gemini-1.5-pro-002",
    "gemini-1.5-pro-001",
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash-8b-001",
    "gemini-1.5-flash-8b-latest",

    // Experimental models
    "gemini-exp-1206",
    "gemini-exp-1121",
    "gemini-exp-1114",
    "learnlm-1.5-pro-experimental",

    // Vision specific
    "gemini-pro-vision",
    "gemini-1.5-pro-vision",

    // Legacy (likely deprecated)
    "gemini-pro",
    "gemini-ultra",
];

// Get API key
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("ERROR: GEMINI_API_KEY not found in .env.local");
    process.exit(1);
}

console.log("=".repeat(60));
console.log("GEMINI MODEL TESTER FOR AGNISHAKTI");
console.log("=".repeat(60));
console.log(`API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 5)}`);
console.log(`Testing ${ALL_GEMINI_MODELS.length} models...`);
console.log("=".repeat(60));

// Simple test prompt (no image needed for text test)
const testPrompt = "Say 'OK' if you are working.";

async function testModel(modelName) {
    return new Promise((resolve) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

        const postData = JSON.stringify({
            contents: [{ parts: [{ text: testPrompt }] }]
        });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 15000
        };

        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        if (json.candidates && json.candidates[0]) {
                            resolve({ model: modelName, status: 'WORKING', code: 200 });
                        } else {
                            resolve({ model: modelName, status: 'NO_OUTPUT', code: res.statusCode });
                        }
                    } catch (e) {
                        resolve({ model: modelName, status: 'PARSE_ERROR', code: res.statusCode });
                    }
                } else if (res.statusCode === 429) {
                    resolve({ model: modelName, status: 'RATE_LIMITED', code: 429 });
                } else if (res.statusCode === 404) {
                    resolve({ model: modelName, status: 'NOT_FOUND', code: 404 });
                } else {
                    resolve({ model: modelName, status: 'ERROR', code: res.statusCode });
                }
            });
        });

        req.on('error', (e) => {
            resolve({ model: modelName, status: 'NETWORK_ERROR', code: 0, error: e.message });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ model: modelName, status: 'TIMEOUT', code: 0 });
        });

        req.write(postData);
        req.end();
    });
}

async function runTests() {
    const results = {
        working: [],
        rateLimited: [],
        notFound: [],
        error: []
    };

    for (const model of ALL_GEMINI_MODELS) {
        process.stdout.write(`Testing ${model}... `);
        const result = await testModel(model);

        if (result.status === 'WORKING') {
            console.log("✅ WORKING");
            results.working.push(model);
        } else if (result.status === 'RATE_LIMITED') {
            console.log("⚠️ RATE LIMITED (but exists!)");
            results.rateLimited.push(model);
        } else if (result.status === 'NOT_FOUND') {
            console.log("❌ NOT FOUND");
            results.notFound.push(model);
        } else {
            console.log(`❌ ${result.status} (${result.code})`);
            results.error.push({ model, status: result.status, code: result.code });
        }

        // Small delay to avoid hitting rate limits
        await new Promise(r => setTimeout(r, 500));
    }

    console.log("\n" + "=".repeat(60));
    console.log("RESULTS SUMMARY");
    console.log("=".repeat(60));

    console.log("\n✅ WORKING MODELS (" + results.working.length + "):");
    results.working.forEach(m => console.log(`   - ${m}`));

    console.log("\n⚠️ RATE LIMITED (exist but quota exceeded) (" + results.rateLimited.length + "):");
    results.rateLimited.forEach(m => console.log(`   - ${m}`));

    console.log("\n❌ NOT FOUND (" + results.notFound.length + "):");
    results.notFound.forEach(m => console.log(`   - ${m}`));

    console.log("\n❌ OTHER ERRORS (" + results.error.length + "):");
    results.error.forEach(e => console.log(`   - ${e.model}: ${e.status} (${e.code})`));

    // Generate the recommended models array
    const recommendedModels = [...results.working, ...results.rateLimited];

    console.log("\n" + "=".repeat(60));
    console.log("RECOMMENDED MODELS ARRAY FOR backend.js:");
    console.log("=".repeat(60));
    console.log(`const WORKING_MODELS = [`);
    recommendedModels.forEach(m => console.log(`  "${m}",`));
    console.log(`];`);

    // Save results to file
    const output = {
        testedAt: new Date().toISOString(),
        apiKeyPrefix: API_KEY.substring(0, 10),
        working: results.working,
        rateLimited: results.rateLimited,
        notFound: results.notFound,
        errors: results.error,
        recommendedArray: recommendedModels
    };

    require('fs').writeFileSync('gemini_test_results.json', JSON.stringify(output, null, 2));
    console.log("\n✅ Results saved to gemini_test_results.json");
}

runTests().catch(console.error);
