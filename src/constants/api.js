// API configuration constants for OpenRouter integration

export const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Default headers sent with every API request
export const fallbackHeaders = {
    'Content-Type': 'application/json',
    'X-Title': 'Hammad OpenRouter Model', // Application identifier for OpenRouter
}

// Number of characters to limit from long files (roughly ~25k-30k tokens for free models)
export const MAX_FILE_CHARS = 30000;