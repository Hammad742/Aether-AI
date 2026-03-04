
const API_KEY = process.env.VITE_OPENROUTER_API_KEY;

// Testing "Unusual Suspects" to find stable models
const MODELS = [
    { id: 'stepfun/step-3.5-flash:free', name: 'StepFun Flash' }, // Control
    { id: 'liquid/lfm-2.5-1.2b-instruct:free', name: 'Liquid LFM 1.2B' },
    { id: 'google/gemma-3n-e2b-it:free', name: 'Gemma 3 Nano 2B' },
    { id: 'qwen/qwen3-4b-instruct:free', name: 'Qwen 3 4B' }, // Trying smaller Qwen
    { id: 'z-ai/glm-4.5-air:free', name: 'GLM 4.5 Air' },
    { id: 'upstage/solar-pro-3:free', name: 'Solar Pro 3' },
    { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3' }, // Retry
    { id: 'arcee-ai/trinity-mini:free', name: 'Trinity Mini' }, // Retry
    { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 30B' } // Retry
];

async function verifyFinalBatch() {
    console.log("--- Verifying Final Batch ---");
    const workingModels = [];

    for (const model of MODELS) {
        process.stdout.write(`Testing ${model.name}... `);
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:5173',
                },
                body: JSON.stringify({
                    model: model.id,
                    messages: [{ role: 'user', content: 'Hi' }],
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (response.ok) {
                console.log("✅ OK");
                workingModels.push(model);
            } else {
                console.log(`❌ FAIL (${response.status})`);
            }
        } catch (err) {
            console.log(`❌ ERROR (${err.name})`);
        }
    }

    const fs = await import('fs');
    let output = "--- Verified Final Batch ---\n";
    workingModels.forEach(m => output += `{ id: '${m.id}', label: '${m.name}', shortLabel: '${m.name}' },\n`);

    fs.writeFileSync('verified_final.txt', output);
    console.log("\nWritten to verified_final.txt");
}

verifyFinalBatch();
