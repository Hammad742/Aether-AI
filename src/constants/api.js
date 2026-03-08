// API configuration constants for OpenRouter integration

export const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Hugging Face and Search URLs (Absolute for production compatibility)
export const HF_BASE_URL = 'https://router.huggingface.co/hf-inference';
export const DDG_BASE_URL = 'https://html.duckduckgo.com/html/';

// Default headers sent with every API request
export const fallbackHeaders = {
    'Content-Type': 'application/json',
    'X-Title': 'Aether OpenRouter Model', // Application identifier for OpenRouter
}

// Maximum number of characters allowed in file attachments to avoid API limits
export const MAX_FILE_CHARS = 120000