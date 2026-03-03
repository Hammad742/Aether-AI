/**
 * Rough estimation for language model tokens.
 * A standard rule of thumb is 1 token ~= 4 characters in English text.
 */
export const estimateTokens = (text) => {
    if (!text || typeof text !== 'string') return 0;
    // We add 1 to ensure even a small string returns at least 1 token if not empty
    return Math.max(1, Math.ceil(text.length / 4));
};

export const calculateSessionTokens = (messages, systemPrompt = '', currentPrompt = '') => {
    let totalChars = 0;

    // Add system instructions if active
    if (systemPrompt) {
        totalChars += systemPrompt.length;
    }

    // Add the input box contents dynamically
    if (currentPrompt) {
        totalChars += currentPrompt.length;
    }

    // Process all historical messages mapped in the active session
    if (messages && messages.length > 0) {
        messages.forEach(msg => {
            if (typeof msg.content === 'string') {
                totalChars += msg.content.length;
            } else if (Array.isArray(msg.content)) {
                // E.g. Vision models format or file parts
                msg.content.forEach(part => {
                    if (part.type === 'text' && part.text) {
                        totalChars += part.text.length;
                    }
                    if (part.type === 'image_url') {
                        // Rough base cost of imaging depending on resolution limits; adding standard base tokens
                        totalChars += (256 * 4);
                    }
                });
            }
        });
    }

    return estimateTokens(' '.repeat(totalChars));
};
