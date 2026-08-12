import { useState, useCallback, useRef } from 'react';
import { API_URL, HF_BASE_URL, DDG_BASE_URL } from '../constants/api';
import { MODELS } from '../constants/models';

export const useChat = (apiHeaders) => {
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const abortControllerRef = useRef(null);

    const stopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setLoading(false);
    }, []);

    const resetChat = useCallback(() => {
        setAnswer('');
        setError('');
        stopGeneration();
    }, [stopGeneration]);



    const sendMessage = useCallback(async (modelId, messages, isWebSearchActive = false) => {
        if (!modelId) {
            setError('Please select a model first');
            return;
        }
        resetChat();
        setLoading(true);
        setError('');

        abortControllerRef.current = new AbortController();

        let retries = 0;
        const maxRetries = 3;

        while (retries <= maxRetries) {
            let isTimeout = false;
            let timeoutId = null;

            try {
                // Check if selected model is an image generation model
                const selectedModel = MODELS.find(m => m.id === modelId);

                // Handle Image Models
                if (selectedModel?.type === 'image' || selectedModel?.type === 'image-hf') {
                    try {
                        const lastMessage = messages[messages.length - 1];
                        const promptContent = Array.isArray(lastMessage.content)
                            ? lastMessage.content.find(c => c.type === 'text')?.text
                            : lastMessage.content;

                        if (!promptContent) throw new Error('No prompt provided for image generation.');

                        setAnswer("Generating image...");

                        // Set a timeout of 35 seconds for image generation
                        timeoutId = setTimeout(() => {
                            if (abortControllerRef.current) {
                                isTimeout = true;
                                abortControllerRef.current.abort();
                            }
                        }, 35000);

                        const hfKey = import.meta.env.VITE_HUGGING_FACE_API_KEY;
                        let imageBase64 = null;

                        // Try Hugging Face first if key is present
                        if (hfKey) {
                            try {
                                console.log('Attempting Hugging Face image generation...');
                                const hfModel = selectedModel.id === 'flux' ? 'black-forest-labs/FLUX.1-dev' : selectedModel.id;
                                const hfResponse = await fetch(
                                    `${HF_BASE_URL}/models/${hfModel}`,
                                    {
                                        headers: {
                                            Authorization: `Bearer ${hfKey}`,
                                            "Content-Type": "application/json",
                                        },
                                        method: "POST",
                                        body: JSON.stringify({ inputs: promptContent }),
                                        signal: abortControllerRef.current.signal
                                    }
                                );

                                if (hfResponse.ok) {
                                    const contentType = hfResponse.headers.get("content-type");
                                    if (contentType && contentType.startsWith('image/')) {
                                        const blob = await hfResponse.blob();
                                        const reader = new FileReader();
                                        const base64Promise = new Promise((resolve, reject) => {
                                            reader.onloadend = () => resolve(reader.result);
                                            reader.onerror = reject;
                                        });
                                        reader.readAsDataURL(blob);
                                        imageBase64 = await base64Promise;
                                    }
                                }
                            } catch (hfErr) {
                                console.warn('Hugging Face image generation failed, falling back to Pollinations:', hfErr);
                            }
                        }

                        clearTimeout(timeoutId);

                        let result = '';

                        if (imageBase64) {
                            result = `![Generated Image](${imageBase64})`;
                        } else {
                            // Use local Vite dev proxy in development to bypass adblockers/CORS, and direct URL in production
                            console.log('Generating image link for Pollinations AI...');
                            const seed = Math.floor(Math.random() * 1000000);
                            const isDev = import.meta.env.DEV;
                            const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
                            const baseUrl = (isDev || isVercel) ? '/pollinations' : 'https://image.pollinations.ai';
                            
                            // Re-init the timeout for the Pollinations fetch request
                            timeoutId = setTimeout(() => {
                                if (abortControllerRef.current) {
                                    isTimeout = true;
                                    abortControllerRef.current.abort();
                                }
                            }, 35000);

                            let activeModelParam = 'flux';
                            let response = null;

                            // Pre-fetch image from Pollinations AI to ensure it is fully generated before showing it.
                            // This also implements client-side failovers: flux -> turbo -> default
                            try {
                                console.log('Attempting Pollinations image generation with FLUX...');
                                const imageUrl = `${baseUrl}/prompt/${encodeURIComponent(promptContent)}?model=${activeModelParam}&width=768&height=768&nologo=true&seed=${seed}`;
                                response = await fetch(imageUrl, { signal: abortControllerRef.current.signal });
                                if (!response.ok) throw new Error(`Flux failed with status ${response.status}`);
                            } catch (fluxErr) {
                                if (abortControllerRef.current?.signal?.aborted) throw fluxErr; // Don't fallback if user cancelled
                                console.warn('FLUX image model failed, falling back to Turbo:', fluxErr);
                                activeModelParam = 'turbo';
                                try {
                                    const imageUrl = `${baseUrl}/prompt/${encodeURIComponent(promptContent)}?model=${activeModelParam}&width=768&height=768&nologo=true&seed=${seed}`;
                                    response = await fetch(imageUrl, { signal: abortControllerRef.current.signal });
                                    if (!response.ok) throw new Error(`Turbo failed with status ${response.status}`);
                                } catch (turboErr) {
                                    if (abortControllerRef.current?.signal?.aborted) throw turboErr;
                                    console.warn('Turbo fallback failed, falling back to default:', turboErr);
                                    activeModelParam = 'default';
                                    const imageUrl = `${baseUrl}/prompt/${encodeURIComponent(promptContent)}?model=${activeModelParam}&width=768&height=768&nologo=true&seed=${seed}`;
                                    response = await fetch(imageUrl, { signal: abortControllerRef.current.signal });
                                }
                            }

                            clearTimeout(timeoutId);

                            if (!response || !response.ok) {
                                throw new Error(`Failed to generate image: ${response ? response.statusText : 'Network error'}`);
                            }

                            const finalImageUrl = `${baseUrl}/prompt/${encodeURIComponent(promptContent)}?model=${activeModelParam}&width=768&height=768&nologo=true&seed=${seed}`;
                            result = `![Generated Image](${finalImageUrl})`;
                        }

                        setAnswer(result);
                        setLoading(false);
                        return result;
                    } catch (imageError) {
                        clearTimeout(timeoutId);
                        if (imageError.name === 'AbortError' && isTimeout && retries < maxRetries) {
                            console.warn(`Image generation timed out. Retrying... (${retries + 1}/${maxRetries})`);
                            retries++;
                            abortControllerRef.current = new AbortController();
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            continue;
                        }
                        setError(imageError.message || 'Image generation failed.');
                        setLoading(false);
                        return; // Do not retry regular image errors
                    }
                }

                let finalMessages = [...messages];

                // Execute local Web Search via DuckDuckGo if requested
                if (isWebSearchActive) {
                    try {
                        const lastUserMsg = messages[messages.length - 1];
                        let searchQuery = '';

                        // Extract query from text or array payload
                        if (typeof lastUserMsg.content === 'string') {
                            searchQuery = lastUserMsg.content;
                        } else if (Array.isArray(lastUserMsg.content)) {
                            const textPart = lastUserMsg.content.find(p => p.type === 'text');
                            if (textPart) searchQuery = textPart.text;
                        }

                        if (searchQuery) {
                            setAnswer("Searching the web...");
                            // Fetch DuckDuckGo HTML silently
                            const searchRes = await fetch(`${DDG_BASE_URL}?q=${encodeURIComponent(searchQuery)}`);
                            const html = await searchRes.text();

                            // Naive extraction of snippet texts
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');
                            const snippets = Array.from(doc.querySelectorAll('.result__snippet'))
                                .map(el => el.textContent.trim())
                                .filter(text => text)
                                .slice(0, 5); // Take top 5 results

                            if (snippets.length > 0) {
                                const searchContext = `[Web Search Results for "${searchQuery}"]\n${snippets.map((s, i) => `${i + 1}. ${s}`).join('\n\n')}\n\nPlease use the above real-time information to answer the user's prompt.`;

                                // Inject context into the user's message
                                const updatedContent = typeof lastUserMsg.content === 'string'
                                    ? `${searchContext}\n\nUser: ${lastUserMsg.content}`
                                    : [{ type: 'text', text: searchContext }, ...lastUserMsg.content];

                                finalMessages = [
                                    ...messages.slice(0, -1),
                                    { ...lastUserMsg, content: updatedContent }
                                ];
                                setAnswer(""); // Clear loading text
                            } else {
                                setAnswer(""); // Clear if no results found
                            }
                        }
                    } catch (err) {
                        console.warn('Local web search failed:', err);
                        setAnswer(""); // Fail gracefully
                    }
                }

                // Standard OpenRouter request with streaming and 30s timeout
                timeoutId = setTimeout(() => {
                    if (abortControllerRef.current) {
                        isTimeout = true;
                        abortControllerRef.current.abort();
                    }
                }, 30000);

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: apiHeaders,
                    body: JSON.stringify({
                        model: modelId,
                        messages: finalMessages,
                        stream: true,
                    }),
                    signal: abortControllerRef.current.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errJson = await response.json().catch(() => null);
                    console.error('API Error Details:', errJson);

                    const openRouterError = errJson?.error?.message || errJson?.error?.metadata?.raw || '';
                    const providerError = errJson?.error?.metadata?.provider_error || '';

                    let errMsg = openRouterError || providerError || response.statusText || 'Request failed';

                    const isTransient = 
                        response.status === 408 || 
                        response.status === 429 || 
                        response.status >= 500 || 
                        errMsg.toLowerCase().includes('provider returned error') ||
                        errMsg.toLowerCase().includes('rate limit') ||
                        errMsg.toLowerCase().includes('rate-limited') ||
                        errMsg.toLowerCase().includes('overloaded');

                    // Check for transient provider errors to trigger retry
                    if (isTransient && retries < maxRetries) {
                        console.warn(`Transient error (${response.status}) detected. Retrying... (${retries + 1}/${maxRetries})`);
                        retries++;
                        abortControllerRef.current = new AbortController();
                        await new Promise(resolve => setTimeout(resolve, 2000 * retries)); // Exponential backoff: 2s, 4s, 6s
                        continue;
                    }

                    // On final retry failure, try failover to a stable model (GPT OSS 20B)
                    if (modelId !== 'openai/gpt-oss-20b:free') {
                        console.warn(`All retries failed for ${modelId}. Failover to openai/gpt-oss-20b:free...`);
                        modelId = 'openai/gpt-oss-20b:free';
                        retries = 0;
                        setAnswer("The selected model is currently offline. Safely falling back to GPT OSS 20B...\n\n");
                        abortControllerRef.current = new AbortController();
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        continue;
                    }

                    // Enhance error message for the user
                    if (errMsg.toLowerCase().includes('provider returned error')) {
                        errMsg = "The AI provider for this model is currently unstable on OpenRouter. Please try again or switch model.";
                    } else if (errMsg.toLowerCase().includes('rate limit')) {
                        errMsg = "Rate limit reached. Please wait a minute or switch to another free model.";
                    }

                    throw new Error(errMsg);
                }

                if (!response.body) throw new Error('ReadableStream not supported.');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                let fullAnswer = '';
                let buffer = '';
                let lastUpdateTime = Date.now();
                const updateThresholdMs = 80; // Update state at most every 80ms to throttle renders

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        // Process any remaining text in the buffer
                        if (buffer.trim()) {
                            const lines = buffer.split('\n');
                            for (const line of lines) {
                                if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
                                if (line.startsWith('data: ')) {
                                    try {
                                        const data = JSON.parse(line.slice(6));
                                        const content = data.choices?.[0]?.delta?.content || '';
                                        if (content) {
                                            fullAnswer += content;
                                        }
                                    } catch (e) {
                                        console.warn('Error parsing final stream chunk', e);
                                    }
                                }
                            }
                        }
                        // Ensure final answer is committed completely
                        setAnswer(fullAnswer);
                        break;
                    }

                    const chunk = decoder.decode(value, { stream: true });
                    const combined = buffer + chunk;
                    const lines = combined.split('\n');
                    
                    // The last item is either empty or a fragmented JSON string.
                    // Pop it off and store it in the buffer for the next iteration.
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;

                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                const content = data.choices?.[0]?.delta?.content || '';
                                if (content) {
                                    fullAnswer += content;
                                    
                                    // Throttle UI updates to once per 80ms interval
                                    const now = Date.now();
                                    if (now - lastUpdateTime >= updateThresholdMs) {
                                        setAnswer(fullAnswer);
                                        lastUpdateTime = now;
                                    }
                                }
                            } catch (e) {
                                console.warn('Error parsing stream chunk', e);
                            }
                        }
                    }
                }
                setLoading(false);
                abortControllerRef.current = null;
                return fullAnswer;

            } catch (err) {
                clearTimeout(timeoutId);
                if (err.name === 'AbortError') {
                    if (isTimeout && retries < maxRetries) {
                        console.warn(`Request timed out. Retrying... (${retries + 1}/${maxRetries})`);
                        retries++;
                        abortControllerRef.current = new AbortController();
                        await new Promise(resolve => setTimeout(resolve, 2000 * retries));
                        continue;
                    }
                    if (isTimeout && modelId !== 'openai/gpt-oss-20b:free') {
                        console.warn(`Request timed out all retries for ${modelId}. Failover to openai/gpt-oss-20b:free...`);
                        modelId = 'openai/gpt-oss-20b:free';
                        retries = 0;
                        setAnswer("The selected model is currently unresponsive. Safely falling back to GPT OSS 20B...\n\n");
                        abortControllerRef.current = new AbortController();
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        continue;
                    }
                    setLoading(false);
                    abortControllerRef.current = null;
                    return;
                }

                // Generic error failover
                if (modelId !== 'openai/gpt-oss-20b:free') {
                    console.warn(`Error occurred: ${err.message}. Failover to openai/gpt-oss-20b:free...`);
                    modelId = 'openai/gpt-oss-20b:free';
                    retries = 0;
                    setAnswer("An error occurred with this model. Safely falling back to GPT OSS 20B...\n\n");
                    abortControllerRef.current = new AbortController();
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    continue;
                }

                setError(err.message || 'Something went wrong.');
                setLoading(false);
                abortControllerRef.current = null;
                throw err;
            }
        }
    }, [apiHeaders, resetChat]);

    return {
        answer,
        loading,
        error,
        sendMessage,
        resetChat,
        stopGeneration,
    };
};
