// Main application component for an AI assistant interface
// Handles user interactions, API calls to OpenRouter, and state management

import { useMemo, useRef, useState, useEffect } from 'react'
import { fallbackHeaders, MAX_FILE_CHARS } from './constants/api'
import { MODELS, NOVA_FILE_MODEL_ID, VISION_MODEL_IDS } from './constants/models'
import ChatMessage from './components/ChatMessage'
import ErrorBanner from './components/ErrorBanner'
import Header from './components/Header'
import PromptForm from './components/PromptForm'
import QuickActions from './components/QuickActions'
import Sidebar from './components/Sidebar'
import { useChat } from './hooks/useChat'
import { useTranslation } from './hooks/useTranslation'
import { useSettings } from './context/SettingsContext'
import SettingsModal from './components/SettingsModal'
import Login from './components/Login'

// Helper function to generate an unambiguous, exact timestamp and user context for the system prompt
const getSystemPrompt = (customInstructions) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
    
    let basePrompt = `You are Aether AI Assistant. The exact current date is ${dateStr} and the local time is ${timeStr}. Provide accurate, real-time context if asked about current events, dates, or times strictly based on this exact timestamp.`;

    if (customInstructions) {
        if (customInstructions.aboutUser?.trim()) {
            basePrompt += `\n\nAbout the User:\n${customInstructions.aboutUser.trim()}`;
        }
        if (customInstructions.respondHow?.trim()) {
            basePrompt += `\n\nCustom Instructions on How to Respond:\n${customInstructions.respondHow.trim()}`;
        }
    }

    return {
        role: 'system',
        content: basePrompt
    };
};

function App() {
    // Translation hook
    const { t } = useTranslation()
    
    // Global Settings
    const { settings, updateSetting } = useSettings()

    // State management for AI assistant interface
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('aetherai_isAuthenticated') === 'true';
    })

    useEffect(() => {
        localStorage.setItem('aetherai_isAuthenticated', isAuthenticated);
    }, [isAuthenticated]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

    // Model selection and configuration
    const [selectedModel, setSelectedModel] = useState(() => {
        const saved = localStorage.getItem('aetherai_selectedModel')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                const exists = MODELS.find(m => m.id === parsed.id)
                if (exists) return exists
            } catch { /* Ignore syntax error */ }
        }
        const defaultModel = MODELS.find(m => m.id === 'stepfun/step-3.5-flash:free') || MODELS[0]
        return defaultModel
    })

    // Chat History
    const [chatHistory, setChatHistory] = useState(() => {
        const saved = localStorage.getItem('aetherai_chatHistory')
        if (saved) {
            try { return JSON.parse(saved) } catch { /* Ignore syntax error */ }
        }
        return []
    })

    const [currentChatId, setCurrentChatId] = useState(() => {
        return localStorage.getItem('aetherai_currentChatId') || null
    })

    const [messages, setMessages] = useState(() => {
        const savedHistory = localStorage.getItem('aetherai_chatHistory')
        const savedId = localStorage.getItem('aetherai_currentChatId')
        if (savedHistory && savedId) {
            try {
                const history = JSON.parse(savedHistory)
                const chat = history.find(c => c.id === savedId)
                if (chat) return chat.messages || []
            } catch { /* Ignore syntax error */ }
        }
        return []
    })

    // Persist state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('aetherai_selectedModel', JSON.stringify(selectedModel))
    }, [selectedModel])

    useEffect(() => {
        localStorage.setItem('aetherai_chatHistory', JSON.stringify(chatHistory))
    }, [chatHistory])

    useEffect(() => {
        if (currentChatId) {
            localStorage.setItem('aetherai_currentChatId', currentChatId)
        } else {
            localStorage.removeItem('aetherai_currentChatId')
        }
    }, [currentChatId])

    // User input
    const [prompt, setPrompt] = useState('')

    // File and image attachments
    const [imageData, setImageData] = useState(null)
    const [fileAttachment, setFileAttachment] = useState(null)

    // DOM references
    const imageInputRef = useRef(null)
    const fileInputRef = useRef(null)
    const messagesEndRef = useRef(null)

    // Auto-scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, prompt]) // Also scroll when typing? Maybe just messages + loading state

    // Prepare API headers with authorization and referrer information
    const apiHeaders = useMemo(() => {
        const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        const userKey = settings?.personalApiKey;
        const key = userKey || envKey;
        const referer = typeof window !== 'undefined' ? window.location.origin : ''
        return {
            ...fallbackHeaders,
            ...(referer ? { 'HTTP-Referer': referer } : {}),
            ...(key ? { Authorization: `Bearer ${key}` } : {}),
        }
    }, [settings?.personalApiKey])

    // specific Local error state
    const [validationError, setValidationError] = useState('')

    // Use custom hook for chat logic
    const { answer, loading, error: apiError, sendMessage, resetChat, stopGeneration } = useChat(apiHeaders)

    // Scroll when answer streams
    useEffect(() => {
        if (loading) scrollToBottom()
    }, [answer, loading])

    // Determine model capabilities based on selected model
    const isVisionModel = useMemo(() => VISION_MODEL_IDS.has(selectedModel.id), [selectedModel.id])
    const isNovaFileModel = useMemo(() => selectedModel.id === NOVA_FILE_MODEL_ID, [selectedModel.id])

    // Helper functions for managing attachments

    const clearImage = () => {
        setImageData(null)
        if (imageInputRef.current) imageInputRef.current.value = ''
    }

    const clearFile = () => {
        setFileAttachment(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const resetAttachments = () => {
        clearImage()
        clearFile()
    }

    const clearAll = () => {
        setPrompt('')
        setMessages([]) // Clear history
        setCurrentChatId(null)
        resetAttachments()
        resetChat()
        setValidationError('')
    }

    // File and image handling functions

    const handleImageChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => setImageData(reader.result)
        reader.readAsDataURL(file)
    }

    // Process text file attachment with size and length validation
    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Check file size limit (2MB)
        if (file.size > 2 * 1024 * 1024) {
            setValidationError('File too large. Please attach a file under 2MB.')
            return
        }

        // Read file content and truncate if necessary
        const reader = new FileReader()
        reader.onload = () => {
            const content = typeof reader.result === 'string' ? reader.result : ''
            const truncated = content.slice(0, MAX_FILE_CHARS)
            const notice = content.length > MAX_FILE_CHARS ? '\n\n[Content truncated to avoid exceeding model limits.]' : ''

            setFileAttachment({
                name: file.name,
                content: `${truncated}${notice}`
            })
            setValidationError('')
        }
        reader.readAsText(file)
    }



    // Main function to handle form submission and API call to OpenRouter
    const handleSubmit = async (event, isWebSearchActive = false) => {
        if (event && event.preventDefault) {
            event.preventDefault()
        }

        // Check what content the user has provided
        const hasText = !!prompt.trim()
        const hasImage = !!imageData
        const hasFile = !!fileAttachment?.content

        // Prevent submission if already loading or no valid content
        if (loading) return
        if (!hasText && !hasFile && (!isVisionModel || !hasImage)) return

        // Reset state for new request
        setValidationError('')

        // Check for API key
        if (!apiHeaders.Authorization) {
            setValidationError('Add VITE_OPENROUTER_API_KEY to your .env file to call the model.')
            return
        }

        try {
            // Build message content based on available inputs (text, image, file)
            const parts = []
            const hasAttachment = isVisionModel && hasImage
            const fallbackText = !hasText && (hasAttachment || hasFile) ? 'Please analyze the attached item(s).' : ''

            // Add text content (user prompt or fallback)
            if (hasText || fallbackText) {
                parts.push({
                    type: 'text',
                    text: hasText ? prompt.trim() : fallbackText
                })
            }

            // Add image content for vision models
            if (isVisionModel && hasImage) {
                parts.push({
                    type: 'image_url',
                    image_url: {
                        url: imageData,
                    },
                })
            }

            // Add file content
            if (hasFile) {
                parts.push({
                    type: 'text',
                    text: `File: ${fileAttachment.name}\n\n${fileAttachment.content}`,
                })
            }

            // Construct new user message object
            const displayUserMessage = {
                role: 'user',
                content: hasText ? prompt.trim() : (fallbackText || "Sent an attachment")
            }

            const newMessages = [...messages, displayUserMessage]
            setMessages(newMessages)
            setPrompt('')
            resetAttachments()

            let activeChatId = currentChatId;

            // Add to sidebar chat history if this is the first prompt in a session
            if (!activeChatId) {
                activeChatId = Date.now().toString()
                setCurrentChatId(activeChatId)
                const title = hasText ? prompt.trim() : (fileAttachment?.name || 'Image attached')
                setChatHistory(prev => [{ id: activeChatId, title, messages: newMessages }, ...prev])
            } else {
                setChatHistory(prev => prev.map(chat =>
                    chat.id === activeChatId ? { ...chat, messages: newMessages } : chat
                ))
            }

            // Prepare history for API (including system prompt if needed, or previous messages)
            // Map current 'messages' state to API format if needed. 
            // For now, let's just send the NEW message + context if we want history.
            // But we need to convert 'messages' state back to API format.
            // Simplified: Just update local history and chat.

            // Inject a system prompt with real-time awareness and custom user configurations
            const systemPrompt = getSystemPrompt(settings?.customInstructions);

            // Build the full conversation history for the API
            const apiMessages = [
                systemPrompt,
                ...messages.map(m => ({ role: m.role, content: m.content })), // basic mapping
                { role: 'user', content: parts.length > 0 ? parts : prompt.trim() } // current valid API message
            ]

            // Send message using custom hook
            const finalResponse = await sendMessage(selectedModel.id, apiMessages, isWebSearchActive)

            // Append assistant response to history
            if (finalResponse) {
                const updatedMessages = [...newMessages, { role: 'assistant', content: finalResponse }]
                setMessages(updatedMessages)
                setChatHistory(prev => prev.map(chat =>
                    chat.id === activeChatId ? { ...chat, messages: updatedMessages } : chat
                ))
                resetChat() // Clear streaming state
                
                // Track Usage Analytics
                if (settings?.analytics) {
                    const isImageModel = selectedModel.id.includes('FLUX') || selectedModel.id.toLowerCase().includes('image');
                    updateSetting('analytics', {
                        ...settings.analytics,
                        messagesSent: (settings.analytics.messagesSent || 0) + 1,
                        imagesGenerated: isImageModel ? (settings.analytics.imagesGenerated || 0) + 1 : (settings.analytics.imagesGenerated || 0)
                    });
                }
            }

        } catch (err) {
            setValidationError(err?.message || 'Something went wrong.')
        }
    }

    const handleRegenerate = async (isWebSearchActive = false) => {
        if (loading || messages.length === 0) return;

        // Find the last user message
        let lastUserIndex = -1;
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                lastUserIndex = i;
                break;
            }
        }

        if (lastUserIndex === -1) return;

        // Truncate messages to include up to the last user message
        const truncatedMessages = messages.slice(0, lastUserIndex + 1);

        // Update local state temporarily (remove the generated response)
        setMessages(truncatedMessages);
        setValidationError('');

        try {
            const systemPrompt = getSystemPrompt(settings?.customInstructions);

            const apiMessages = [
                systemPrompt,
                ...truncatedMessages.map(m => ({ role: m.role, content: m.content }))
            ];

            const finalResponse = await sendMessage(selectedModel.id, apiMessages, isWebSearchActive);

            if (finalResponse) {
                const updatedMessages = [...truncatedMessages, { role: 'assistant', content: finalResponse }];
                setMessages(updatedMessages);
                setChatHistory(prev => prev.map(chat =>
                    chat.id === currentChatId ? { ...chat, messages: updatedMessages } : chat
                ));
                
                // Track Usage Analytics
                if (settings?.analytics) {
                    const isImageModel = selectedModel.id.includes('FLUX') || selectedModel.id.toLowerCase().includes('image');
                    updateSetting('analytics', {
                        ...settings.analytics,
                        messagesSent: (settings.analytics.messagesSent || 0) + 1,
                        imagesGenerated: isImageModel ? (settings.analytics.imagesGenerated || 0) + 1 : (settings.analytics.imagesGenerated || 0)
                    });
                }
            }
        } catch (err) {
            setValidationError(err?.message || 'Something went wrong.');
        }
    }

    // Handler functions for user interactions

    // Update selected model when user changes model selection
    const handleModelChange = (modelId) => {
        const nextModel = MODELS.find((model) => model.id === modelId)
        if (nextModel) {
            setSelectedModel(nextModel)
        }
    }

    const handleDeleteChat = (id) => {
        setChatHistory(prev => prev.filter(chat => chat.id !== id))
        if (currentChatId === id) clearAll()
    }

    const handleDeleteAllChats = () => {
        setChatHistory([])
        setCurrentChatId(null)
        setMessages([])
        localStorage.removeItem('aetherai_chatHistory')
        localStorage.removeItem('aetherai_currentChatId')
    }

    const handleExportAllData = () => {
        if (chatHistory.length === 0) {
            alert("No chats to export.")
            return;
        }
        const dataStr = JSON.stringify(chatHistory, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aetherai_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    const handleSelectChat = (id) => {
        const selectedChat = chatHistory.find(chat => chat.id === id);
        if (selectedChat) {
            setMessages(selectedChat.messages || []);
            setCurrentChatId(id);
            if (window.innerWidth < 768) toggleSidebar();
        }
    }

    // Set prompt text and switch model when user selects a quick action
    const handleQuickActionSelect = (text, options = {}) => {
        setPrompt(text)
        // Switch to image model if explicitly requested or inferred from text
        if (options.isImage || text.toLowerCase().includes('image')) {
            handleModelChange('black-forest-labs/FLUX.1-schnell')
        }
    }

    if (!isAuthenticated) {
        return <Login onLogin={() => setIsAuthenticated(true)} />
    }

    return (
        // Prevent iOS native scroll bounce and address-bar scaling stutters
        <div className="flex h-[100dvh] bg-[rgb(var(--bg-primary))] text-custom-primary overflow-hidden transition-colors duration-300">
            {/* Settings Modal (Overlay) */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onDeleteAllChats={handleDeleteAllChats}
                onExportAllData={handleExportAllData}
            />

            {/* Sidebar Component */}
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                onNewChat={clearAll}
                chatHistory={chatHistory}
                onDeleteChat={handleDeleteChat}
                currentChatId={currentChatId}
                onSelectChat={handleSelectChat}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onGenerateImage={handleQuickActionSelect}
            />

            <div className="relative z-10 flex flex-col flex-1 h-[100dvh] overflow-hidden transition-colors duration-300">
                <Header selectedModel={selectedModel} toggleSidebar={toggleSidebar} />

                <main className='flex-1 flex flex-col p-4 sm:p-6 overflow-hidden relative max-w-5xl mx-auto w-full'>

                    {messages.length === 0 ? (
                        /* Empty State: Centered Layout */
                        <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 w-full max-w-3xl mx-auto animate-in fade-in duration-500">

                            {/* Optional Greeting */}
                            <h2 className="text-2xl sm:text-3xl font-semibold text-custom-primary text-center">
                                {t('what_can_i_help_with')}
                            </h2>

                            {/* Centered Input */}
                            <div className="w-full">
                                <PromptForm prompt={prompt} onPromptChange={setPrompt} onSubmit={handleSubmit} onClearAll={clearAll} models={MODELS} selectedModel={selectedModel} onModelChange={handleModelChange} isVisionModel={isVisionModel} isNovaFileModel={isNovaFileModel} onImageChange={handleImageChange} onFileChange={handleFileChange} imageData={imageData} fileAttachment={fileAttachment} clearImage={clearImage} clearFile={clearFile} loading={loading} imageInputRef={imageInputRef} fileInputRef={fileInputRef} stopGeneration={stopGeneration} onRegenerate={handleRegenerate} showRegenerate={messages.length > 0} onGenerateImage={handleQuickActionSelect} />
                            </div>

                            {/* Quick Actions */}
                            <QuickActions onSelect={handleQuickActionSelect} />
                        </div>
                    ) : (
                        /* Active Chat State: Scrollable history + Bottom Input */
                        <>
                            <div className="flex-1 overflow-y-auto overflow-x-hidden pt-16 sm:pt-20 mb-4 scroll-smooth pr-2 custom-scrollbar chat-mobile-scrollbar w-full max-w-full">
                                {messages.map((msg, index) => (
                                    <ChatMessage
                                        key={index}
                                        role={msg.role}
                                        content={msg.content}
                                        model={msg.role === 'assistant' ? selectedModel : null}
                                    />
                                ))}

                                {/* Streaming Response Bubble */}
                                {loading && (
                                    <ChatMessage
                                        role="assistant"
                                        content={answer || "Thinking..."}
                                        model={selectedModel}
                                    />
                                )}

                                {/* Error Bubble */}
                                {(validationError || apiError) && (
                                    <ErrorBanner message={validationError || apiError} />
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area - Fixed at bottom of container */}
                            <div className="mt-auto relative z-20">
                                <PromptForm prompt={prompt} onPromptChange={setPrompt} onSubmit={handleSubmit} onClearAll={clearAll} models={MODELS} selectedModel={selectedModel} onModelChange={handleModelChange} isVisionModel={isVisionModel} isNovaFileModel={isNovaFileModel} onImageChange={handleImageChange} onFileChange={handleFileChange} imageData={imageData} fileAttachment={fileAttachment} clearImage={clearImage} clearFile={clearFile} loading={loading} imageInputRef={imageInputRef} fileInputRef={fileInputRef} stopGeneration={stopGeneration} onRegenerate={handleRegenerate} showRegenerate={messages.length > 0} onGenerateImage={handleQuickActionSelect} />
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}

export default App
