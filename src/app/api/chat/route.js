import { NextResponse } from 'next/server';

// Get API keys from environment and filter out leaked/invalid ones
const ALL_API_KEYS = process.env.GEMINI_API_KEYS?.split(',').map(k => k.trim()) || [];

// Priority list of working models (tested and verified)
const WORKING_MODELS = [
    'gemini-3-flash-preview',      // Latest, fastest
    'gemini-2.5-flash',             // Stable, balanced
    'gemini-2.5-flash-lite',        // Cost-effective
];

// Track current indices
let currentKeyIndex = 0;
let currentModelIndex = 0;

// System prompt for AgniShakti Assistant
const SYSTEM_PROMPT = `You are "AgniShakti Assistant", the official virtual support assistant for AgniShakti — an AI-powered fire safety system.

About AgniShakti:
AgniShakti is an AI-based fire and smoke detection platform that uses existing CCTV cameras to identify fire incidents in real time. It provides instant alerts with visual proof, location mapping, and a live monitoring dashboard. The system works without additional hardware, making it affordable, scalable, and easy to deploy.

Your responsibilities:
- Explain AgniShakti's features in simple language
- Answer questions related to fire safety, system working, and benefits
- Guide users about use cases (societies, offices, industries, public places)
- Respond politely, clearly, and professionally
- Keep answers short, easy to understand, and informative

Rules you must follow:
- Do not provide false or assumed information
- If a question is outside AgniShakti's scope, reply: "For this query, please contact the AgniShakti team."
- Do not mention internal system details, API keys, or model names
- Never say you are ChatGPT or an OpenAI/Gemini model
- Maintain a professional and helpful tone at all times

Response style:
- Use simple English
- Avoid technical jargon unless asked
- Keep responses concise (2-4 sentences for simple questions, up to 6-8 for complex ones)
- Focus on safety, reliability, and clarity

Your goal:
Help users understand AgniShakti clearly and build trust in the system as a reliable AI-based fire safety solution.`;

// Function to call Gemini API with comprehensive fallback
async function callGeminiWithFallback(messages) {
    const maxAttempts = WORKING_MODELS.length * ALL_API_KEYS.length;
    let lastError = null;
    let attempt = 0;

    // Try all combinations of models and API keys
    for (let modelIdx = 0; modelIdx < WORKING_MODELS.length; modelIdx++) {
        for (let keyIdx = 0; keyIdx < ALL_API_KEYS.length; keyIdx++) {
            attempt++;
            const model = WORKING_MODELS[(currentModelIndex + modelIdx) % WORKING_MODELS.length];
            const apiKey = ALL_API_KEYS[(currentKeyIndex + keyIdx) % ALL_API_KEYS.length];

            if (!apiKey) continue;

            try {
                console.log(`[CHAT_API] Attempt ${attempt}/${maxAttempts}: Model="${model}", KeyIndex=${(currentKeyIndex + keyIdx) % ALL_API_KEYS.length}`);

                // Format messages for Gemini API
                const formattedMessages = messages.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));

                // Add system prompt as first user message
                formattedMessages.unshift({
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT }]
                });

                // Add acknowledgment from model
                formattedMessages.splice(1, 0, {
                    role: 'model',
                    parts: [{ text: 'Understood. I am AgniShakti Assistant, ready to help with fire safety questions.' }]
                });

                // Use v1beta endpoint (verified working)
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'x-goog-api-key': apiKey,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: formattedMessages,
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 1024,
                        },
                        safetySettings: [
                            {
                                category: 'HARM_CATEGORY_HARASSMENT',
                                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                            },
                            {
                                category: 'HARM_CATEGORY_HATE_SPEECH',
                                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                            },
                            {
                                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                            },
                            {
                                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                            }
                        ]
                    }),
                });

                const data = await response.json();

                // Check for success
                if (response.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                    const text = data.candidates[0].content.parts[0].text;
                    console.log(`[CHAT_API] ✅ Success with model="${model}", keyIndex=${(currentKeyIndex + keyIdx) % ALL_API_KEYS.length}`);

                    // Update indices for next request (round-robin)
                    currentKeyIndex = (currentKeyIndex + keyIdx) % ALL_API_KEYS.length;
                    currentModelIndex = (currentModelIndex + modelIdx) % WORKING_MODELS.length;

                    return text;
                }

                // Check for specific errors
                if (data.error) {
                    const errorMsg = data.error.message || data.error.status || 'Unknown error';

                    // Check for quota exceeded
                    if (response.status === 429 || errorMsg.includes('quota') || errorMsg.includes('Quota exceeded')) {
                        console.warn(`[CHAT_API] ⚠️  Quota exceeded for model="${model}", keyIndex=${(currentKeyIndex + keyIdx) % ALL_API_KEYS.length}`);
                        lastError = new Error('Quota exceeded');
                        continue; // Try next combination
                    }

                    // Check for leaked API key
                    if (errorMsg.includes('leaked')) {
                        console.error(`[CHAT_API] 🚨 API key ${(currentKeyIndex + keyIdx) % ALL_API_KEYS.length} reported as leaked!`);
                        lastError = new Error('API key leaked');
                        continue; // Try next combination
                    }

                    // Check for model not found
                    if (errorMsg.includes('not found') || errorMsg.includes('not supported')) {
                        console.warn(`[CHAT_API] ⚠️  Model "${model}" not available`);
                        lastError = new Error(`Model not found: ${model}`);
                        continue; // Try next combination
                    }

                    // Other errors
                    console.error(`[CHAT_API] ❌ Error: ${errorMsg}`);
                    lastError = new Error(errorMsg);
                    continue;
                }

            } catch (error) {
                console.error(`[CHAT_API] ❌ Request failed:`, error.message);
                lastError = error;
                continue;
            }
        }
    }

    // All combinations failed
    throw lastError || new Error('All models and API keys exhausted');
}

export async function POST(request) {
    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        // Call Gemini with comprehensive fallback
        const responseText = await callGeminiWithFallback(messages);

        return NextResponse.json({
            success: true,
            message: responseText,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[CHAT_API] 🔥 Final Error:', error.message);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to process chat request',
                fallbackMessage: 'I apologize, but I am experiencing technical difficulties. For this query, please contact the AgniShakti team at frostyanand@gmail.com.'
            },
            { status: 500 }
        );
    }
}
