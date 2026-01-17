/**
 * Test Script for AgniShakti AI Assistant API Key Fallback
 * 
 * This script tests the automatic API key rotation when quota is exceeded.
 * Run this to verify your fallback mechanism is working correctly.
 */

const API_ENDPOINT = 'http://localhost:3001/api/chat';

// Test messages
const testMessages = [
    {
        messages: [
            { role: 'user', content: 'How does AgniShakti work?', timestamp: new Date().toISOString() }
        ]
    },
    {
        messages: [
            { role: 'user', content: 'What are the benefits of AgniShakti?', timestamp: new Date().toISOString() }
        ]
    },
    {
        messages: [
            { role: 'user', content: 'Can AgniShakti work with existing CCTV cameras?', timestamp: new Date().toISOString() }
        ]
    },
    {
        messages: [
            { role: 'user', content: 'How fast are the fire alerts?', timestamp: new Date().toISOString() }
        ]
    },
    {
        messages: [
            { role: 'user', content: 'What industries can use AgniShakti?', timestamp: new Date().toISOString() }
        ]
    }
];

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

async function testChat(testData, testNumber) {
    console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.blue}Test ${testNumber}: ${testData.messages[0].content}${colors.reset}`);
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

    try {
        const startTime = Date.now();

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData),
        });

        const data = await response.json();
        const duration = Date.now() - startTime;

        if (data.success) {
            console.log(`${colors.green}✓ Success${colors.reset} (${duration}ms)`);
            console.log(`${colors.reset}Response: ${data.message.substring(0, 150)}...${colors.reset}`);
            return { success: true, duration };
        } else {
            console.log(`${colors.red}✗ Failed${colors.reset}`);
            console.log(`${colors.red}Error: ${data.error}${colors.reset}`);
            if (data.fallbackMessage) {
                console.log(`${colors.yellow}Fallback: ${data.fallbackMessage}${colors.reset}`);
            }
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.log(`${colors.red}✗ Request Failed${colors.reset}`);
        console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║  AgniShakti AI Assistant - API Key Fallback Test      ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

    console.log(`${colors.yellow}Testing ${testMessages.length} chat requests...${colors.reset}`);
    console.log(`${colors.yellow}This will test the API key rotation mechanism.${colors.reset}\n`);

    const results = [];

    for (let i = 0; i < testMessages.length; i++) {
        const result = await testChat(testMessages[i], i + 1);
        results.push(result);

        // Wait 1 second between requests to avoid rate limiting
        if (i < testMessages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Summary
    console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.blue}Test Summary${colors.reset}`);
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const avgDuration = results
        .filter(r => r.duration)
        .reduce((sum, r) => sum + r.duration, 0) / successful;

    console.log(`${colors.green}✓ Successful: ${successful}/${testMessages.length}${colors.reset}`);
    console.log(`${colors.red}✗ Failed: ${failed}/${testMessages.length}${colors.reset}`);

    if (successful > 0) {
        console.log(`${colors.blue}⏱ Average Response Time: ${avgDuration.toFixed(0)}ms${colors.reset}`);
    }

    console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

    if (successful === testMessages.length) {
        console.log(`${colors.green}🎉 All tests passed! API key fallback is working correctly.${colors.reset}\n`);
    } else if (successful > 0) {
        console.log(`${colors.yellow}⚠️  Some tests failed. Check the errors above.${colors.reset}\n`);
    } else {
        console.log(`${colors.red}❌ All tests failed. Check your API configuration.${colors.reset}\n`);
    }
}

// Stress test function to trigger quota exhaustion
async function stressTest(requestCount = 20) {
    console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║  Stress Test - Testing API Key Rotation               ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

    console.log(`${colors.yellow}Sending ${requestCount} rapid requests to test quota handling...${colors.reset}\n`);

    const testData = {
        messages: [
            { role: 'user', content: 'Test message', timestamp: new Date().toISOString() }
        ]
    };

    let successCount = 0;
    let failCount = 0;
    let quotaExceededCount = 0;

    for (let i = 0; i < requestCount; i++) {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testData),
            });

            const data = await response.json();

            if (data.success) {
                successCount++;
                process.stdout.write(`${colors.green}.${colors.reset}`);
            } else {
                if (data.error && data.error.includes('quota')) {
                    quotaExceededCount++;
                    process.stdout.write(`${colors.yellow}Q${colors.reset}`);
                } else {
                    failCount++;
                    process.stdout.write(`${colors.red}X${colors.reset}`);
                }
            }
        } catch (error) {
            failCount++;
            process.stdout.write(`${colors.red}E${colors.reset}`);
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.blue}Stress Test Results${colors.reset}`);
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.green}✓ Successful: ${successCount}/${requestCount}${colors.reset}`);
    console.log(`${colors.yellow}⚠ Quota Exceeded: ${quotaExceededCount}/${requestCount}${colors.reset}`);
    console.log(`${colors.red}✗ Failed: ${failCount}/${requestCount}${colors.reset}`);
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    if (quotaExceededCount > 0 && successCount > 0) {
        console.log(`${colors.green}🎉 API key rotation is working! System switched keys during the test.${colors.reset}\n`);
    }
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

if (command === 'stress') {
    const count = parseInt(args[1]) || 20;
    stressTest(count);
} else if (command === 'help') {
    console.log(`
${colors.cyan}AgniShakti AI Assistant Test Script${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node test_chat_api.js              Run basic tests (5 requests)
  node test_chat_api.js stress       Run stress test (20 requests)
  node test_chat_api.js stress 50    Run stress test with custom count
  node test_chat_api.js help         Show this help message

${colors.yellow}Legend:${colors.reset}
  ${colors.green}.${colors.reset} = Success
  ${colors.yellow}Q${colors.reset} = Quota exceeded (API key rotated)
  ${colors.red}X${colors.reset} = Failed
  ${colors.red}E${colors.reset} = Error

${colors.yellow}Note:${colors.reset} Make sure your development server is running on http://localhost:3001
  `);
} else {
    runTests();
}
