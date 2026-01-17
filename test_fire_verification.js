/**
 * Quick Test for Gemini Fire Verification
 * Tests with a sample fire image URL
 * Run: node test_fire_verification.js
 */

require('dotenv').config({ path: '.env.local' });

const testImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Flame.jpg/220px-Flame.jpg";

async function testFireVerification() {
    console.log("=".repeat(60));
    console.log("TESTING GEMINI FIRE VERIFICATION");
    console.log("=".repeat(60));

    // Get API keys
    const apiKeysRaw = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    const apiKeys = apiKeysRaw.split(",").map(k => k.trim()).filter(k => k.length > 0);

    console.log("API Keys available:", apiKeys.length);
    console.log("Test image:", testImageUrl);
    console.log("=".repeat(60));

    // Working models from our test
    const WORKING_MODELS = [
        "gemini-3-flash-preview",
        "gemini-2.5-flash",
        "gemini-3-pro-preview",
        "gemini-2.5-pro",
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash-lite",
    ];

    const prompt = `You are an AI fire-safety verification system. Analyze this image and determine if there is real fire present. Respond ONLY in JSON format:
{
  "fire_detected": true or false,
  "confidence": "low | medium | high",
  "reason": "brief explanation",
  "action": "trigger_alert | ignore"
}`;

    // Fetch image
    console.log("\n1. Fetching test image...");
    const https = require('https');

    const imageData = await new Promise((resolve, reject) => {
        https.get(testImageUrl, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Handle redirect
                https.get(response.headers.location, (res2) => {
                    const chunks = [];
                    res2.on('data', chunk => chunks.push(chunk));
                    res2.on('end', () => {
                        const buffer = Buffer.concat(chunks);
                        resolve({
                            base64: buffer.toString('base64'),
                            mimeType: res2.headers['content-type'] || 'image/jpeg',
                            size: buffer.length
                        });
                    });
                }).on('error', reject);
            } else {
                const chunks = [];
                response.on('data', chunk => chunks.push(chunk));
                response.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    resolve({
                        base64: buffer.toString('base64'),
                        mimeType: response.headers['content-type'] || 'image/jpeg',
                        size: buffer.length
                    });
                });
            }
        }).on('error', reject);
    });

    console.log(`   Image fetched: ${imageData.size} bytes, ${imageData.mimeType}`);

    // Try each model
    console.log("\n2. Testing models...\n");

    for (const apiKey of apiKeys) {
        console.log(`Using API key: ${apiKey.substring(0, 15)}...`);

        for (const modelName of WORKING_MODELS) {
            try {
                process.stdout.write(`   Testing ${modelName}... `);

                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

                const requestBody = {
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: imageData.mimeType,
                                    data: imageData.base64
                                }
                            }
                        ]
                    }]
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                const data = await response.json();

                if (response.status === 429) {
                    console.log("⚠️ Rate limited");
                    continue;
                }

                if (response.status === 404) {
                    console.log("❌ Not found");
                    continue;
                }

                if (!response.ok) {
                    console.log(`❌ Error ${response.status}`);
                    continue;
                }

                // Success!
                console.log("✅ SUCCESS!");

                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                console.log("\n" + "=".repeat(60));
                console.log("GEMINI RESPONSE:");
                console.log("=".repeat(60));
                console.log(text);
                console.log("=".repeat(60));

                // Parse JSON
                try {
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const result = JSON.parse(jsonMatch[0]);
                        console.log("\nPARSED RESULT:");
                        console.log(JSON.stringify(result, null, 2));
                        console.log("\n✅ FIRE VERIFICATION WORKING!\n");
                    }
                } catch (e) {
                    console.log("Could not parse JSON:", e.message);
                }

                return; // Exit after first success

            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
            }
        }
    }

    console.log("\n❌ All models and API keys failed!");
}

testFireVerification().catch(console.error);
