// API configuration constants for OpenRouter integration

const isLocalOrVercel = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('vercel.app')
);

export const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Hugging Face and Search URLs (Proxy endpoints for CORS safety in Dev and Vercel production)
export const HF_BASE_URL = isLocalOrVercel 
    ? '/hf' 
    : 'https://router.huggingface.co/hf-inference';

export const DDG_BASE_URL = isLocalOrVercel 
    ? '/ddg' 
    : 'https://html.duckduckgo.com/html/';

// Default headers sent with every API request
export const fallbackHeaders = {
    'Content-Type': 'application/json',
    'X-Title': 'Aether OpenRouter Model', // Application identifier for OpenRouter
}

// Maximum number of characters allowed in file attachments to avoid API limits
export const MAX_FILE_CHARS = 120000