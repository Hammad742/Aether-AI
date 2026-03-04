/* global process */
// Native fetch is available in Node 18+

const API_KEY = process.env.VITE_OPENROUTER_API_KEY;

const MODELS_TO_TEST = [
    'mistralai/mistral-small-3.1-24b-instruct:free',
    'stepfun/step-3.5-flash:free'
];

async function testModel(modelId) {
    try {
        console.log(`Testing ${modelId}...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:5173',
                'X-Title': 'Model Tester'
            },
            body: JSON.stringify({
                model: modelId,
                messages: [{ role: 'user', content: 'Hi' }],
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const fs = await import('fs');
        let result = '';

        if (response.ok) {
            const data = await response.json();
            result = `✅ ${modelId} is WORKING. Response: ${data.choices[0].message.content}\n`;
            console.log(result.trim());
        } else {
            const errorText = await response.text();
            result = `❌ ${modelId} FAILED: ${response.status} - ${errorText}\n`;
            console.log(result.trim());
        }
        fs.appendFileSync('test_results.txt', result);
        return response.ok;
    } catch (error) {
        const fs = await import('fs');
        fs.appendFileSync('test_results.txt', `❌ ${modelId} ERROR: ${error.message}\n`);
        console.log(`❌ ${modelId} ERROR: ${error.message}`);
        return false;
    }
}

async function runTests() {
    for (const model of MODELS_TO_TEST) {
        await testModel(model);
    }
}

runTests();
