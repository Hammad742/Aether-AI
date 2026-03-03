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



    const sendMessage = useCallback(async (modelId, messages) => {
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

                if (selectedModel?.type === 'image') {
                    // ... (Pollinations logic remains) ...
                    const lastMessage = messages[messages.length - 1];
                    const promptContent = Array.isArray(lastMessage.content)
                        ? lastMessage.content.find(c => c.type === 'text')?.text
                        : lastMessage.content;

                    if (!promptContent) throw new Error('No prompt provided for image generation.');

                    const encodedPrompt = encodeURIComponent(promptContent);
                    const randomSeed = Math.floor(Math.random() * 100000);

                    const pollinationUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${selectedModel.id}&seed=${randomSeed}&nologo=true`;
                    const imageUrl = `https://images.weserv.nl/?url=${encodeURIComponent(pollinationUrl)}&output=jpg`;

                    await new Promise(resolve => setTimeout(resolve, 500));

                    setAnswer(`![Generated Image](${imageUrl})`);
                    setLoading(false);
                    return;
                }

                // Handle Paid Image Models (DALL-E 3 via OpenRouter)
                if (selectedModel?.type === 'image-paid') {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: apiHeaders,
                        body: JSON.stringify({
                            model: modelId,
                            messages: messages,
                            max_tokens: 1000,
                        }),
                    });

                    if (!response.ok) {
                        const errJson = await response.json().catch(() => null);
                        throw new Error(errJson?.error?.message || 'Failed to generate image with DALL-E 3');
                    }

                    const data = await response.json();
                    const content = data.choices?.[0]?.message?.content;
                    if (content) {
                        setAnswer(content);
                    } else {
                        throw new Error('No content returned from DALL-E 3');
                    }

                    setLoading(false);
                    return;
                }

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: apiHeaders,
                    body: JSON.stringify({
                        model: modelId,
                        messages: messages,
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

                    // Check for transient provider errors to trigger retry
                    if (errMsg.toLowerCase().includes('provider returned error') && retries < maxRetries) {
                        console.warn(`Transient provider error detected. Retrying... (${retries + 1}/${maxRetries})`);
                        retries++;
                        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait before retry
                        continue;
                    }

                    // Enhance error message for the user
                    if (errMsg.toLowerCase().includes('provider returned error')) {
                        errMsg = "The AI provider for this model is currently unstable on OpenRouter. Please try again in a few seconds or switch to a different free model.";
                    } else if (errMsg.toLowerCase().includes('rate limit')) {
                        errMsg = "You've hit the rate limit for this free model. Please wait a minute or switch to another free model.";
                    }

                    throw new Error(errMsg);
                }

                if (!response.body) throw new Error('ReadableStream not supported in this browser.');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                let fullAnswer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.trim() === '') continue;
                        if (line.trim() === 'data: [DONE]') continue;

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

                // If we reach here, either it was a non-provider error or we exhausted retries
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
