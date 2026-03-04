/* global process */
const API_KEY = process.env.VITE_OPENROUTER_API_KEY;

async function fetchFreeModels() {
    try {
        console.log("Fetching models...");
        const response = await fetch('https://openrouter.ai/api/v1/models');
        const data = await response.json();

        if (data.data) {
            const freeModels = data.data.filter(m => m.id.includes(':free') || m.pricing.prompt === '0');
            console.log(`Found ${freeModels.length} free models.`);

            const fs = await import('fs');
            let output = `Found ${freeModels.length} free models.\n\n`;

            freeModels.forEach(m => output += `${m.id} | ${m.name}\n`);

            fs.writeFileSync('free_models_list.txt', output);
            console.log("Written to free_models_list.txt");

        } else {
            console.log("Failed to fetch models.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

fetchFreeModels();
