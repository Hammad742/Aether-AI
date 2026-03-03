
// Native fetch is available in Node 18+

async function testImageGeneration() {
    const models = ['flux', 'turbo', 'dreamshaper', 'stable-diffusion-xl-lightning'];
    const prompt = 'A futuristic city';

    console.log('Testing image generation URLs...');

    for (const model of models) {
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model}&width=1024&height=1024&nologo=true`;
        console.log(`Testing: ${url}`);

        try {
            const response = await fetch(url);
            if (response.ok) {
                console.log(`✅ ${model}: Success (${response.status})`);
                // Check content type
                console.log(`   Type: ${response.headers.get('content-type')}`);
            } else {
                console.log(`❌ ${model}: Failed (${response.status} ${response.statusText})`);
                const text = await response.text();
                console.log(`   Response: ${text.substring(0, 100)}...`);
            }
        } catch (error) {
            console.log(`❌ ${model}: Error (${error.message})`);
        }
    }
}

testImageGeneration();
