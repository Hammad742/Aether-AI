// Model configuration constants for available AI models on OpenRouter

// Available AI models with their OpenRouter IDs and display labels
// All models are free tier options
export const MODELS = [
    // Confirmed Verified Working (Stable & Fast)
    { id: 'google/gemma-4-26b-a4b-it:free', label: 'Google Gemma 4 26B', shortLabel: 'Gemma 4 26B' },
    { id: 'openai/gpt-oss-20b:free', label: 'OpenAI GPT OSS 20B', shortLabel: 'GPT OSS 20B' },
    { id: 'poolside/laguna-xs-2.1:free', label: 'Poolside Laguna XS', shortLabel: 'Laguna XS' },
    { id: 'nvidia/nemotron-nano-12b-v2-vl:free', label: 'Nemotron Nano 12B 2 VL', shortLabel: 'Nemotron 12B VL' },
    { id: 'flux', label: 'FLUX Image Generation', shortLabel: 'FLUX Image', type: 'image' },
]

// Set of model IDs that support vision/image analysis capabilities
export const VISION_MODEL_IDS = new Set([
    'nvidia/nemotron-nano-12b-v2-vl:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
])

// Defines the model ID that supports file attachments (text files)
export const NOVA_FILE_MODEL_ID = 'amazon/nova-micro-v1:free'; // Placeholder