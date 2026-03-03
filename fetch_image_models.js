// Native fetch is available in Node 18+

async function getModels() {
    try {
        console.log('Fetching image models from Pollinations.ai...');
        const response = await fetch('https://image.pollinations.ai/models');
        if (!response.ok) throw new Error(`Failed to fetch models: ${response.statusText}`);

        const models = await response.json();
        console.log(JSON.stringify(models, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

getModels();
