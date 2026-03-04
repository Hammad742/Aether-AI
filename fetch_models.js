/* global process */
// Native fetch is available in Node 18+

const API_KEY = process.env.VITE_OPENROUTER_API_KEY;

async function getFreeModels() {
    try {
        console.log('Fetching models from OpenRouter...');
        const response = await fetch('https://openrouter.ai/api/v1/models');
        if (!response.ok) throw new Error(`Failed to fetch models: ${response.statusText}`);

        const data = await response.json();
        const allModels = data.data;

        // Filter for ANY image models (paid or free)
        console.log('Scanning for ALL image models...');
        let foundModels = [];
        allModels.filter(model => {
            const isImage = model.architecture?.modality === 'text->image' ||
                model.id.toLowerCase().includes('stable-diffusion') ||
                model.id.toLowerCase().includes('dall-e') ||
                model.id.toLowerCase().includes('midjourney') ||
                model.id.toLowerCase().includes('flux') ||
                model.name.toLowerCase().includes('image') ||
                (model.description && model.description.toLowerCase().includes('image generation'));

            if (isImage) {
                foundModels.push({
                    id: model.id,
                    name: model.name,
                    pricing: model.pricing
                });
            }
            return false;
        });

        const fs = await import('fs');
        fs.writeFileSync('image_models_list.txt', JSON.stringify(foundModels, null, 2));
        console.log(`Saved ${foundModels.length} image models to image_models_list.txt`);
        return; // Exit function early


    } catch (error) {
        console.error('Error:', error);
    }
}

getFreeModels();
