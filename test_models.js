// Native fetch is available in Node 18+

const API_KEY = process.env.VITE_OPENROUTER_API_KEY || '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';

const MODELS_TO_TEST = [
    'google/gemma-3-12b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen3-next-80b-a3b-instruct:free'
];

async function testModel(modelId) {
    try {
        console.log(`Testing ${modelId}...`);
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
                max_tokens: 5
            })
        });

        const fs = await import('fs');
        let result = '';

        if (response.ok) {
            result = `✅ ${modelId} is WORKING\n`;
            console.log(result.trim());
        } else {
            result = `❌ ${modelId} FAILED: ${response.status}\n`;
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
