import { useState, useCallback, useRef } from 'react';
import { API_URL } from '../constants/api';
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
        const maxRetries = 1;

        while (retries <= maxRetries) {
            try {
                // Check if selected model is an image generation model
                const selectedModel = MODELS.find(m => m.id === modelId);

                // Handle Hugging Face Image Models
                if (selectedModel?.type === 'image-hf') {
                    try {
                        const lastMessage = messages[messages.length - 1];
                        const promptContent = Array.isArray(lastMessage.content)
                            ? lastMessage.content.find(c => c.type === 'text')?.text
                            : lastMessage.content;

                        if (!promptContent) throw new Error('No prompt provided for image generation.');

                        const hfKey = import.meta.env.VITE_HUGGING_FACE_API_KEY;
                        if (!hfKey) throw new Error('Hugging Face API key is missing. Please add it to your .env file.');

                        const response = await fetch(
                            `/hf/models/${modelId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${hfKey}`,
                                    "Content-Type": "application/json",
                                },
                                method: "POST",
                                body: JSON.stringify({ inputs: promptContent }),
                            }
                        );

                        const contentType = response.headers.get("content-type");

                        if (!response.ok || (contentType && !contentType.startsWith('image/'))) {
                            let errorMessage = 'Failed to generate image from Hugging Face';
                            if (contentType && contentType.includes("application/json")) {
                                const errorData = await response.json();
                                errorMessage = errorData.error || errorMessage;
                                if (errorData.estimated_time) {
                                    errorMessage = `Model is loading. Estimated time: ${Math.round(errorData.estimated_time)}s. Please try again soon.`;
                                }
                            } else if (!response.ok) {
                                const textError = await response.text();
                                errorMessage = textError || `HTTP Error ${response.status}`;
                            } else {
                                errorMessage = "Hugging Face returned an unexpected response format.";
                            }
                            throw new Error(errorMessage);
                        }

                        const blob = await response.blob();
                        const reader = new FileReader();
                        const base64Promise = new Promise((resolve, reject) => {
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = reject;
                        });
                        reader.readAsDataURL(blob);
                        const base64Data = await base64Promise;

                        const result = `![Generated Image](${base64Data})`;
                        setAnswer(result);
                        setLoading(false);
                        return result;
                    } catch (hfError) {
                        setError(hfError.message || 'Hugging Face generation failed.');
                        setLoading(false);
                        return; // Do not retry HF errors
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
                            const searchRes = await fetch(`/ddg?q=${encodeURIComponent(searchQuery)}`);
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

                // Standard OpenRouter request with streaming
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

                if (!response.ok) {
                    const errJson = await response.json().catch(() => null);
                    console.error('API Error Details:', errJson);

                    const openRouterError = errJson?.error?.message || errJson?.error?.metadata?.raw || '';
                    const providerError = errJson?.error?.metadata?.provider_error || '';

                    let errMsg = openRouterError || providerError || response.statusText || 'Request failed';

                    // Check for transient provider errors to trigger retry (like in reference project)
                    if (errMsg.toLowerCase().includes('provider returned error') && retries < maxRetries) {
                        console.warn(`Transient provider error detected. Retrying... (${retries + 1}/${maxRetries})`);
                        retries++;
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

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;

                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                const content = data.choices?.[0]?.delta?.content || '';
                                if (content) {
                                    fullAnswer += content;
                                    setAnswer((prev) => prev + content);
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
                if (err.name === 'AbortError') {
                    setLoading(false);
                    abortControllerRef.current = null;
                    return;
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
