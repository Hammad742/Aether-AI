// Native fetch is available in Node 18+

async function testAlternatives() {
    const urls = [
        'https://image.pollinations.ai/prompt/test-image?nologo=true', // Standard
        'https://pollinations.ai/p/test-image?nologo=true',            // Redirect style
        'https://pollinations.ai/prompt/test-image?nologo=true',       // Root domain
    ];

    const models = ['flux', 'turbo', 'dreamshaper'];

    console.log('Testing Domains...');
    for (const url of urls) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);

            console.log(`${url}: ${res.status} ${res.statusText}`);
            if (res.status === 200) {
                const type = res.headers.get('content-type');
                console.log(`   Content-Type: ${type}`);
            }
        } catch (e) {
            console.log(`${url}: Error ${e.message}`);
        }
    }

    console.log('\nTesting Models on image.pollinations.ai...');
    for (const model of models) {
        const url = `https://image.pollinations.ai/prompt/test-image?model=${model}&nologo=true`;
        try {
            const res = await fetch(url);
            console.log(`Model ${model}: ${res.status} ${res.statusText}`);
        } catch (e) {
            console.log(`Model ${model}: Error ${e.message}`);
        }
    }
}

testAlternatives();
