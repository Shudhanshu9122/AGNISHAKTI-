/**
 * Comprehensive Gemini Model Tester
 * Tests all available Gemini models with both API keys
 * Uses image analysis to verify working models
 */

const fs = require('fs');
const path = require('path');

// Load API keys from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeysMatch = envContent.match(/GEMINI_API_KEYS=(.+)/);
const API_KEYS = apiKeysMatch ? apiKeysMatch[1].split(',').map(k => k.trim()) : [];

console.log(`\n🔑 Found ${API_KEYS.length} API keys\n`);

// Comprehensive list of Gemini models (70+ models)
const MODELS_TO_TEST = [
    // Gemini 3.x models (Latest - 2026)
    'gemini-3-pro-preview',
    'gemini-3-pro',
    'gemini-3-flash-preview',
    'gemini-3-flash',
    'gemini-3-pro-image-preview',

    // Gemini 2.5 models (Stable - 2025/2026)
    'gemini-2.5-pro',
    'gemini-2.5-pro-preview',
    'gemini-2.5-pro-latest',
    'gemini-2.5-pro-001',
    'gemini-2.5-pro-002',
    'gemini-2.5-flash',
    'gemini-2.5-flash-preview',
    'gemini-2.5-flash-latest',
    'gemini-2.5-flash-001',
    'gemini-2.5-flash-002',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash-lite-preview',
    'gemini-2.5-flash-lite-latest',
    'gemini-2.5-flash-image',
    'gemini-2.5-flash-image-preview',

    // Gemini 2.0 models
    'gemini-2.0-flash',
    'gemini-2.0-flash-preview',
    'gemini-2.0-flash-latest',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash-002',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-lite-preview',
    'gemini-2.0-flash-lite-001',
    'gemini-2.0-flash-image',

    // Gemini 1.5 models (Older but stable)
    'gemini-1.5-pro',
    'gemini-1.5-pro-preview',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro-001',
    'gemini-1.5-pro-002',
    'gemini-1.5-flash',
    'gemini-1.5-flash-preview',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-8b',
    'gemini-1.5-flash-8b-preview',
    'gemini-1.5-flash-8b-latest',
    'gemini-1.5-flash-8b-001',

    // Experimental models
    'gemini-exp-1206',
    'gemini-exp-1121',
    'gemini-exp-1114',
    'gemini-exp-1111',

    // Legacy naming patterns
    'models/gemini-3-pro-preview',
    'models/gemini-3-flash-preview',
    'models/gemini-2.5-pro',
    'models/gemini-2.5-flash',
    'models/gemini-2.0-flash',
    'models/gemini-1.5-pro',
    'models/gemini-1.5-flash',

    // Alternative naming
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-flash',
    'gemini-ultra',

    // Specific versioned models
    'gemini-pro-001',
    'gemini-pro-002',
    'gemini-flash-001',
    'gemini-flash-002',
];

// Sample base64 image (1x1 red pixel PNG)
const SAMPLE_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

// Test a single model with a specific API key
async function testModel(modelName, apiKey, keyIndex) {
    const endpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
        `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent`,
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'x-goog-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                inline_data: {
                                    mime_type: 'image/png',
                                    data: SAMPLE_IMAGE_BASE64
                                }
                            },
                            {
                                text: 'What color is this image?'
                            }
                        ]
                    }]
                }),
            });

            const data = await response.json();

            if (response.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return {
                    success: true,
                    endpoint: endpoint.includes('v1beta') ? 'v1beta' : 'v1',
                    response: data.candidates[0].content.parts[0].text.substring(0, 50)
                };
            } else if (data.error) {
                return {
                    success: false,
                    error: data.error.message || data.error.status || 'Unknown error'
                };
            }
        } catch (error) {
            // Try next endpoint
            continue;
        }
    }

    return {
        success: false,
        error: 'All endpoints failed'
    };
}

// Main test function
async function runTests() {
    console.log('🧪 Starting Comprehensive Gemini Model Test\n');
    console.log(`📋 Testing ${MODELS_TO_TEST.length} models with ${API_KEYS.length} API keys\n`);
    console.log('━'.repeat(80));

    const results = {
        working: [],
        failed: [],
        byKey: {}
    };

    API_KEYS.forEach((_, idx) => {
        results.byKey[idx] = { working: [], failed: [] };
    });

    let testCount = 0;
    const totalTests = MODELS_TO_TEST.length * API_KEYS.length;

    for (const model of MODELS_TO_TEST) {
        for (let keyIdx = 0; keyIdx < API_KEYS.length; keyIdx++) {
            testCount++;
            const apiKey = API_KEYS[keyIdx];

            process.stdout.write(`\r[${testCount}/${totalTests}] Testing: ${model.padEnd(40)} with Key ${keyIdx + 1}...`);

            const result = await testModel(model, apiKey, keyIdx);

            if (result.success) {
                const workingModel = {
                    model,
                    endpoint: result.endpoint,
                    keyIndex: keyIdx,
                    response: result.response
                };

                // Only add to working list if not already there
                if (!results.working.find(m => m.model === model && m.endpoint === result.endpoint)) {
                    results.working.push(workingModel);
                }
                results.byKey[keyIdx].working.push(workingModel);

                process.stdout.write(` ✅\n`);
            } else {
                results.byKey[keyIdx].failed.push({ model, error: result.error });

                // Only add to failed if it failed on all keys tested so far
                if (keyIdx === API_KEYS.length - 1 && !results.working.find(m => m.model === model)) {
                    results.failed.push({ model, error: result.error });
                }
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    console.log('\n' + '━'.repeat(80));
    console.log('\n📊 TEST RESULTS\n');

    // Working models
    console.log(`✅ WORKING MODELS (${results.working.length}):\n`);
    results.working.forEach((m, idx) => {
        console.log(`${idx + 1}. ${m.model.padEnd(45)} [${m.endpoint}] (Key ${m.keyIndex + 1})`);
    });

    // Results by API key
    console.log('\n\n🔑 RESULTS BY API KEY:\n');
    API_KEYS.forEach((key, idx) => {
        const masked = key.substring(0, 10) + '...' + key.substring(key.length - 4);
        console.log(`\nKey ${idx + 1} (${masked}):`);
        console.log(`  ✅ Working: ${results.byKey[idx].working.length}`);
        console.log(`  ❌ Failed: ${results.byKey[idx].failed.length}`);
    });

    // Save results to file
    const outputPath = path.join(__dirname, 'gemini_model_test_results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n\n💾 Full results saved to: ${outputPath}`);

    // Generate priority list for implementation
    console.log('\n\n🎯 RECOMMENDED MODEL PRIORITY LIST:\n');
    const priorityList = results.working
        .filter((m, idx, self) => self.findIndex(x => x.model === m.model) === idx) // Remove duplicates
        .slice(0, 20); // Top 20

    priorityList.forEach((m, idx) => {
        console.log(`${idx + 1}. "${m.model}",  // ${m.endpoint}`);
    });

    console.log('\n' + '━'.repeat(80));
    console.log(`\n✨ Test Complete! Found ${results.working.length} working model configurations.\n`);

    return results;
}

// Run the tests
runTests().catch(console.error);
