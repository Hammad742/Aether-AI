/**
 * Utility to generate images using the HuggingFace Inference API
 * Uses the free, high-quality Flux.1-schnell model by default.
 */

const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
const DEFAULT_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

export const generateImage = async (prompt, model = DEFAULT_MODEL) => {
    if (!HF_API_KEY) {
        throw new Error("HuggingFace API Key (VITE_HF_API_KEY) is missing from .env");
    }

    try {
        const response = await fetch(
            `/hf-api/models/${model}`,
            {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: prompt }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HuggingFace API Error (${response.status}): ${errorText}`);
        }

        // The API returns the raw image blob
        const blob = await response.blob();

        // Convert blob to Base64 data URL for easy rendering in the chat
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Failed to read image blob"));
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error("Image Generation Error:", error);
        throw error;
    }
};
