
const API_KEY = process.env.VITE_OPENROUTER_API_KEY || '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';

const MODELS = [
    { id: 'arcee-ai/trinity-mini:free', name: 'Trinity Mini' },
    { id: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'Nemotron 12B' },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3' },
    { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3' },
    { id: 'stepfun/step-3.5-flash:free', name: 'StepFun Flash' },
    { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 30B' }
];

async function verifyModels() {
    console.log("--- Verifying Active Models ---");
    const workingModels = [];

    for (const model of MODELS) {
        process.stdout.write(`Testing ${model.name} (${model.id})... `);
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000); // Strict 10s timeout

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
            console.log(`❌ ERROR (${err.name}: ${err.message})`);
        }
    }

    const fs = await import('fs');
    let output = "--- Working Models List ---\n";
    workingModels.forEach(m => output += `{ id: '${m.id}', label: '${m.name}', shortLabel: '${m.name}' },\n`);

    fs.writeFileSync('verified_models.txt', output);
    console.log("Written to verified_models.txt");
}

verifyModels();
