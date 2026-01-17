/**
 * Quick test for the updated chat API
 */

async function testChatAPI() {
    console.log('🧪 Testing Updated Chat API\n');
    console.log('━'.repeat(60));

    const testMessages = [
        'How does AgniShakti work?',
        'What are the benefits?',
        'Can it work with existing cameras?'
    ];

    for (let i = 0; i < testMessages.length; i++) {
        console.log(`\n📝 Test ${i + 1}: "${testMessages[i]}"`);
        console.log('─'.repeat(60));

        try {
            const startTime = Date.now();

            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'user', content: testMessages[i], timestamp: new Date().toISOString() }
                    ]
                }),
            });

            const data = await response.json();
            const duration = Date.now() - startTime;

            if (data.success) {
                console.log(`✅ Success (${duration}ms)`);
                console.log(`📄 Response: ${data.message.substring(0, 200)}${data.message.length > 200 ? '...' : ''}`);
            } else {
                console.log(`❌ Failed`);
                console.log(`Error: ${data.error}`);
                if (data.fallbackMessage) {
                    console.log(`Fallback: ${data.fallbackMessage}`);
                }
            }
        } catch (error) {
            console.log(`❌ Request Error: ${error.message}`);
        }

        // Wait 2 seconds between requests
        if (i < testMessages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log('\n' + '━'.repeat(60));
    console.log('✨ Test Complete!\n');
}

testChatAPI().catch(console.error);
