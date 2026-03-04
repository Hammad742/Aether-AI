
const API_KEY = process.env.VITE_OPENROUTER_API_KEY;

// Models to verify (Known working + potential lightweights)
const MODELS = [
    { id: 'stepfun/step-3.5-flash:free', name: 'StepFun Flash' }, // Confirmed working
    { id: 'arcee-ai/trinity-mini:free', name: 'Trinity Mini' }, // Passed verification earlier
    { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B' }, // Lightweight fallback
    { id: 'google/gemma-3-4b-it:free', name: 'Gemma 3 4B' }, // Lightweight Google
];

async function verifyCandidates() {
    console.log("--- Verifying Candidates ---");
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
    let output = "--- Verified Candidates ---\n";
    workingModels.forEach(m => output += `{ id: '${m.id}', label: '${m.name}', shortLabel: '${m.name}' },\n`);

    fs.writeFileSync('verified_candidates.txt', output);
    console.log("\nWritten to verified_candidates.txt");
}

verifyCandidates();
