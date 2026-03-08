// Model configuration constants for available AI models on OpenRouter

// Available AI models with their OpenRouter IDs and display labels
// All models are free tier options
export const MODELS = [
    // Confirmed Verified Working (Stable & Fast)
    { id: 'stepfun/step-3.5-flash:free', label: 'StepFun Step 3.5 Flash', shortLabel: 'Step 3.5 Flash' },
    { id: 'arcee-ai/trinity-mini:free', label: 'Arcee Trinity Mini', shortLabel: 'Trinity Mini' },
    { id: 'nvidia/nemotron-nano-12b-v2-vl:free', label: 'Nemotron Nano 12B 2 VL', shortLabel: 'Nemotron 12B VL' },
    { id: 'nvidia/nemotron-3-nano-30b-a3b:free', label: 'Nemotron 3 30B', shortLabel: 'Nemotron 30B' },
    { id: 'black-forest-labs/FLUX.1-schnell', label: 'FLUX.1 Schnell (Hugging Face)', shortLabel: 'FLUX (Image Generation)', type: 'image-hf' },
]

// Set of model IDs that support vision/image analysis capabilities
export const VISION_MODEL_IDS = new Set([
    'nvidia/nemotron-nano-12b-v2-vl:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
])

// Defines the model ID that supports file attachments (text files)
export const NOVA_FILE_MODEL_ID = 'amazon/nova-micro-v1:free'; // Placeholder