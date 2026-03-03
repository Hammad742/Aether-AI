// Model configuration constants for available AI models on OpenRouter

// Available AI models with their OpenRouter IDs and display labels
// All models are free tier options
export const MODELS = [
    // Confirmed Working (Stable)
    { id: 'stepfun/step-3.5-flash:free', label: 'StepFun 3.5 Flash (Fastest)', shortLabel: 'StepFun Flash' },
    { id: 'nvidia/nemotron-nano-12b-v2-vl:free', label: 'Nemotron 12B VL (Multimodal)', shortLabel: 'Nemotron' },

    // Backup Models (Stable legacy)
    { id: 'arcee-ai/trinity-mini:free', label: 'Arcee Trinity Mini', shortLabel: 'Arcee' },
    { id: 'nvidia/nemotron-3-nano-30b-a3b:free', label: 'Nemotron 30B (Unstable)', shortLabel: 'Nemotron 30B' },


    // Image Generation Models - REMOVED per user request
    // { id: 'flux', label: 'Flux (Best Quality)', shortLabel: 'Flux', type: 'image' },
    // { id: 'turbo', label: 'Turbo (Fastest)', shortLabel: 'Turbo', type: 'image' },
    // { id: 'stable-diffusion-xl-lightning', label: 'Stable Diffusion XL', shortLabel: 'SDXL Lightning', type: 'image' },
    // { id: 'dreamshaper', label: 'DreamShaper', shortLabel: 'DreamShaper', type: 'image' },
    // { id: 'midjourney', label: 'OpenJourney', shortLabel: 'OpenJourney', type: 'image' },
    // { id: 'waifu-diffusion', label: 'Waifu Diffusion', shortLabel: 'Waifu Diffusion', type: 'image' },

    // Paid Image Models - REMOVED per user request
    // { id: 'openai/gpt-5-image', label: 'GPT-5 Image (OpenAI - High Quality)', shortLabel: 'GPT-5 Image', type: 'image-paid' },
    // { id: 'google/gemini-3-pro-image-preview', label: 'Gemini 3 Pro Image (Google)', shortLabel: 'Gemini 3 Image', type: 'image-paid' },
]

// Set of model IDs that support vision/image analysis capabilities
export const VISION_MODEL_IDS = new Set([
    'nvidia/nemotron-nano-12b-v2-vl:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
])

// Defines the model ID that supports file attachments (text files)
export const NOVA_FILE_MODEL_ID = 'amazon/nova-micro-v1:free'; // Placeholder