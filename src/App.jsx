// Main application component for an AI assistant interface
// Handles user interactions, API calls to OpenRouter, and state management

/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fallbackHeaders, MAX_FILE_CHARS } from './constants/api'
import { MODELS, NOVA_FILE_MODEL_ID, VISION_MODEL_IDS } from './constants/models'
import ChatMessage from './components/ChatMessage'
import ErrorBanner from './components/ErrorBanner'
import Header from './components/Header'
import PromptForm from './components/PromptForm'
import QuickActions from './components/QuickActions'
import SettingsModal from './components/SettingsModal'
import ApiKeyRequirementModal from './components/ApiKeyRequirementModal'
import Sidebar from './components/Sidebar'
import ImageGalleryModal from './components/ImageGalleryModal';
import VoiceInteractionModal from './components/VoiceInteractionModal';
import MermaidWorkspace from './components/MermaidWorkspace';
import { useLanguage } from './contexts/LanguageContext';
import { useChat } from './hooks/useChat'
import { useChatHistory } from './hooks/useChatHistory'
import { extractTextFromPDF } from './utils/fileParser'
import { calculateSessionTokens } from './utils/tokenCounter'
import { performWebSearch } from './utils/webSearch'
import { generateImage } from './utils/huggingfaceUtils'
import { FaBars, FaSearch, FaPen, FaCog, FaProjectDiagram, FaImage } from 'react-icons/fa'
import { artifactInstructions } from './constants/instructions';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';

const AuthenticatedApp = () => {
    const { t } = useLanguage();
    // Model selection and configuration
    const [selectedModel, setSelectedModel] = useState(MODELS[0])

    const {
        sessions,
        folders,
        currentSessionId,
        setCurrentSessionId,
        createNewChat,
        saveMessageToCurrentSession,
        deleteChat,
        createFolder,
        deleteFolder,
        toggleFolderExpand,
        moveSessionToFolder,
        archiveAllChats,
        deleteAllSessions,
        exportData
    } = useChatHistory();

    const [messages, setMessages] = useState([])
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [prompt, setPrompt] = useState('')
    const [imageData, setImageData] = useState(null)
    const [attachedFiles, setAttachedFiles] = useState([])
    const [userApiKey, setUserApiKey] = useState(localStorage.getItem('openrouter_user_api_key') || '')
    const [validationError, setValidationError] = useState('')
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsInitialTab, setSettingsInitialTab] = useState('general');
    const [isApiKeyPopupOpen, setIsApiKeyPopupOpen] = useState(false);
    const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
    const [isArtifactOpen, setIsArtifactOpen] = useState(false);
    const [artifactCode, setArtifactCode] = useState('');
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);

    const imageInputRef = useRef(null)
    const fileInputRef = useRef(null)
    const messagesEndRef = useRef(null)
    const searchInputRef = useRef(null)

    const [systemPrompt, setSystemPrompt] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('systemPrompt') || '';
        }
        return '';
    });

    useEffect(() => {
        if (currentSessionId && sessions) {
            const session = sessions.find(s => s.id === currentSessionId);
            if (session) {
                const sessionMessages = session.messages || [];
                // Efficient check: only update if lengths differ or it's a new session
                // This avoids expensive JSON.stringify on every re-render
                if (messages.length !== sessionMessages.length) {
                    setMessages(sessionMessages);
                }
            }
        } else if (!currentSessionId) {
            if (messages.length > 0) setMessages([]);
        }
    }, [currentSessionId, sessions, messages.length]);

    const handleApiKeyChange = (newKey) => {
        setUserApiKey(newKey)
        localStorage.setItem('openrouter_user_api_key', newKey)
    }

    const scrollToBottom = React.useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, []);

    useEffect(() => {
        scrollToBottom()
    }, [messages, prompt, scrollToBottom])

    const apiHeaders = useMemo(() => {
        const key = userApiKey
        const referer = typeof window !== 'undefined' ? window.location.origin : ''
        return {
            ...fallbackHeaders,
            ...(referer ? { 'HTTP-Referer': referer } : {}),
            ...(key ? { Authorization: `Bearer ${key}` } : {}),
        }
    }, [userApiKey])

    const { answer, loading, error: apiError, sendMessage, resetChat, stopGeneration } = useChat(apiHeaders)

    useEffect(() => {
        if (loading) scrollToBottom()
    }, [answer, loading, scrollToBottom])

    useEffect(() => {
        if (messages.length > 0 && currentSessionId) {
            const currentSession = sessions.find(s => s.id === currentSessionId);
            // Save only if message count is different to avoid constant stringify
            if (currentSession && currentSession.messages?.length !== messages.length) {
                saveMessageToCurrentSession(messages);
            }
        }
    }, [messages, currentSessionId, sessions, saveMessageToCurrentSession]);

    const isVisionModel = useMemo(() => VISION_MODEL_IDS.has(selectedModel.id), [selectedModel.id])
    const isNovaFileModel = useMemo(() => selectedModel.id === NOVA_FILE_MODEL_ID, [selectedModel.id])

    const clearImage = () => {
        setImageData(null)
        if (imageInputRef.current) imageInputRef.current.value = ''
    }

    const clearFiles = () => {
        setAttachedFiles([])
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const resetAttachments = () => {
        clearImage()
        clearFiles()
    }

    const handleNewChat = () => {
        createNewChat();
        setMessages([]);
        setPrompt('');
        resetAttachments();
        resetChat();
        setValidationError('');
        setIsArtifactOpen(false);
        setArtifactCode('');
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    }

    const handleSelectSession = (id) => {
        setCurrentSessionId(id);
        const session = sessions.find(s => s.id === id);
        if (session) setMessages(session.messages);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    }

    const handleDeleteSession = (id) => {
        deleteChat(id);
        if (id === currentSessionId) handleNewChat();
    }

    const handleClearAll = () => {
        setPrompt('');
        resetAttachments();
        resetChat();
        setValidationError('');
    }

    const handleStop = () => stopGeneration();

    const handleOpenSettings = (tab) => {
        const initialTab = typeof tab === 'string' ? tab : 'general';
        setSettingsInitialTab(initialTab);
        setIsSettingsOpen(true);
    };

    const sessionTokens = useMemo(() => {
        // Debounce or simplify counting if the history is massive
        if (messages.length > 50) return calculateSessionTokens(messages.slice(-20), systemPrompt, prompt);
        return calculateSessionTokens(messages, systemPrompt, prompt);
    }, [messages, systemPrompt, prompt]);

    const handleRegenerate = async () => {
        if (loading || messages.length === 0) return;
        let newMessages = [...messages];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.role === 'assistant') newMessages.pop();
        const lastUserMsg = newMessages[newMessages.length - 1];
        if (!lastUserMsg || lastUserMsg.role !== 'user') return;

        setMessages(newMessages);
        const activeSessionId = currentSessionId;

        // Support for image generation regeneration
        if (typeof lastUserMsg.content === 'string' && lastUserMsg.content.toLowerCase().startsWith('/imagine ')) {
            await processImageGeneration(lastUserMsg.content, activeSessionId);
            return;
        }

        try {
            const finalResponse = await sendMessage(selectedModel.id, newMessages);
            if (finalResponse) {
                const botMessage = { role: 'assistant', content: finalResponse };
                setMessages(prev => [...prev, botMessage]);
                saveMessageToCurrentSession(botMessage, activeSessionId);
                resetChat();
            }
        } catch (err) {
            setValidationError(err?.message || 'Failed to regenerate.');
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => setImageData(reader.result)
        reader.readAsDataURL(file)
    }

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
            setValidationError('File too large. Please attach a file under 2MB.')
            return
        }
        if (attachedFiles.some(f => f.name === file.name)) {
            setValidationError('File already attached.');
            return;
        }
        const reader = new FileReader()
        reader.onload = async () => {
            let content = '';
            try {
                if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                    content = await extractTextFromPDF(file);
                } else {
                    content = typeof reader.result === 'string' ? reader.result : '';
                }
                const truncated = content.slice(0, MAX_FILE_CHARS)
                const notice = content.length > MAX_FILE_CHARS ? '\n\n[Content truncated to avoid exceeding model limits.]' : ''
                const newFile = { id: Date.now(), name: file.name, content: `${truncated}${notice}`, type: file.type };
                setAttachedFiles(prev => [...prev, newFile]);
                setValidationError('')
            } catch (error) {
                setValidationError(error.message || 'Failed to parse file.');
            }
        }
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            reader.onload({ target: { result: '' } });
        } else {
            reader.readAsText(file);
        }
    }

    const removeFile = (fileId) => setAttachedFiles(prev => prev.filter(f => f.id !== fileId));

    const saveToGallery = (prompt, url) => {
        try {
            const gallery = JSON.parse(localStorage.getItem('image_gallery') || '[]');
            const newItem = {
                id: Date.now(),
                prompt,
                url,
                date: new Date().toISOString(),
                model: 'FLUX.1 [HuggingFace]'
            };
            localStorage.setItem('image_gallery', JSON.stringify([newItem, ...gallery]));
        } catch (err) {
            console.error('Failed to save to gallery:', err);
        }
    };

    const processImageGeneration = async (fullPrompt, activeSessionId) => {
        const imagePrompt = fullPrompt.trim().substring(9).trim();
        const displayUserMessage = { role: 'user', content: fullPrompt.trim() };
        setMessages(prev => [...prev, displayUserMessage]);
        setPrompt('');
        saveMessageToCurrentSession(displayUserMessage, activeSessionId);
        try {
            setValidationError('Generating image with HuggingFace FLUX.1...');
            const base64Image = await generateImage(imagePrompt);
            setValidationError('');
            saveToGallery(imagePrompt, base64Image); // Save to shared gallery
            const botMessage = { role: 'assistant', content: `Here is the image generated for: **"${imagePrompt}"**\n\n![Generated Image](${base64Image})` };
            setMessages(prev => [...prev, botMessage]);
            saveMessageToCurrentSession(botMessage, activeSessionId);
        } catch (imgError) {
            setValidationError(imgError.message || 'Image generation failed.');
        }
    };

    const handleSubmit = async (event, textOverride = null) => {
        if (event) event.preventDefault()
        const activePrompt = textOverride !== null ? textOverride : prompt;
        if (activePrompt === 'Try "draw a Flowchart, Sequence , class... diagram"') {
            setPrompt('');
            return;
        }
        const handlePromptSubmit = async (e, submittedPrompt = prompt) => {
            if (e) e.preventDefault();

            const finalPrompt = submittedPrompt || prompt;
            if (!finalPrompt.trim() && !(selectedModel?.id.includes('vision') && imageData) && attachedFiles.length === 0) return;
            if (loading) return;

            if (finalPrompt === 'Try "draw a Flowchart, Sequence , class... diagram"') {
                setPrompt('');
                return;
            }

            setValidationError('');
            if (!userApiKey) {
                setValidationError(t('error.missingApiKey'));
                setIsApiKeyPopupOpen(true);
                return;
            }

            try {
                const activeSessionId = currentSessionId || await createNewChat();

                if (finalPrompt.trim().toLowerCase().startsWith('/imagine ')) {
                    await processImageGeneration(finalPrompt, activeSessionId);
                    return;
                }

                const parts = [];
                const hasText = !!finalPrompt.trim();
                const hasImage = !!imageData;
                const hasFiles = attachedFiles.length > 0;
                const hasAttachment = isVisionModel && hasImage;
                const fallbackText = !hasText && (hasAttachment || hasFiles) ? 'Please analyze the attached item(s).' : '';

                if (hasText || fallbackText) parts.push({ type: 'text', text: hasText ? finalPrompt.trim() : fallbackText });
                if (isVisionModel && hasImage) parts.push({ type: 'image_url', image_url: { url: imageData } });
                if (hasFiles) {
                    attachedFiles.forEach(file => {
                        parts.push({ type: 'text', text: `[Attached File: ${file.name}]\n\n${file.content}` });
                    });
                }

                const displayUserMessage = { role: 'user', content: hasText ? finalPrompt.trim() : (fallbackText || (hasFiles ? "Sent attachments" : "Sent an attachment")) };
                const updatedMessages = [...messages, displayUserMessage];
                setMessages(updatedMessages);
                setPrompt('');
                resetAttachments();
                saveMessageToCurrentSession(displayUserMessage, activeSessionId);

                const historyForApi = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
                const newMessageForApi = { role: 'user', content: parts.length > 0 ? parts : finalPrompt.trim() };
                let fullApiHistory = [...historyForApi, newMessageForApi];

                const currentDate = new Date().toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short'
                });
                const basePersonaPrompt = "You are Hammad AI Assistant, a powerful, helpful, and creative AI. You provide accurate, concise, and professional answers to any query.";
                let finalSystemPrompt = `[System Context: Current exactly local time is ${currentDate}]\n\n${basePersonaPrompt}${systemPrompt ? '\n\n' + systemPrompt : ''}${artifactInstructions ? '\n\n' + artifactInstructions : ''}`;
                if (isWebSearchEnabled) {
                    setValidationError('Searching the web...');
                    const searchContext = await performWebSearch(finalPrompt);
                    setValidationError('');
                    if (searchContext && !searchContext.includes('failed')) {
                        finalSystemPrompt += `\n\n=== RECENT WEB SEARCH RESULTS ===\n${searchContext}\n\nPlease formulate your answer using the real-time search context provided above. Prioritize it for factual queries.`;
                    }
                }
                if (finalSystemPrompt.trim()) fullApiHistory = [{ role: 'system', content: finalSystemPrompt }, ...fullApiHistory];
                const finalResponse = await sendMessage(selectedModel.id, fullApiHistory);
                if (finalResponse) {
                    const botMessage = { role: 'assistant', content: finalResponse };
                    setMessages(prev => [...prev, botMessage]);
                    saveMessageToCurrentSession(botMessage, activeSessionId);
                }
            } catch (err) {
                setValidationError(err?.message || 'Something went wrong.');
            }
        };

        const handleModelChange = (modelId) => {
            const nextModel = MODELS.find((model) => model.id === modelId)
            if (nextModel) setSelectedModel(nextModel)
        }

        const handleVoiceSubmit = async (voiceText) => await handlePromptSubmit(null, voiceText);

        const handleQuickActionSelect = (text) => setPrompt(text);

        return (
            <div className="flex bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden h-screen transition-colors duration-300">
                <Sidebar
                    sessions={sessions}
                    folders={folders}
                    currentSessionId={currentSessionId}
                    onNewChat={handleNewChat}
                    onSelectSession={handleSelectSession}
                    onDeleteSession={handleDeleteSession}
                    onCreateFolder={createFolder}
                    onDeleteFolder={deleteFolder}
                    onToggleFolder={toggleFolderExpand}
                    onMoveSession={moveSessionToFolder}
                    isOpen={isSidebarOpen}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    searchInputRef={searchInputRef}
                    onOpenSettings={handleOpenSettings}
                    onOpenGallery={() => setIsGalleryOpen(true)}
                    onOpenVoice={() => setIsVoiceOpen(true)}
                    attachedFiles={attachedFiles}
                    onRemoveFile={removeFile}
                />

                <div className={`flex-1 flex flex-row h-full relative overflow-hidden transition-all duration-300 ease-in-out ${!isSidebarOpen ? 'md:pl-14' : 'md:pl-0'}`}>
                    <div className="flex-1 flex flex-col h-full min-w-0">
                        {!isSidebarOpen && (
                            <div className="md:hidden absolute top-4 left-4 z-[60]">
                                <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/80 dark:bg-zinc-800/80 rounded-lg text-zinc-600 dark:text-zinc-300 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700/50"><FaBars /></button>
                            </div>
                        )}

                        {!isSidebarOpen && (
                            <div className="hidden md:flex flex-col items-center gap-6 fixed top-0 bottom-0 left-0 w-14 z-[60] bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl border-r border-zinc-200/50 dark:border-zinc-800/50 py-8">
                                <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-xl transition-all group" title="Open Sidebar">
                                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 group-hover:scale-110 transition-transform" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                                </button>
                                <div className="w-8 h-[1px] bg-zinc-300/30 dark:bg-zinc-700/30" />
                                <button onClick={handleNewChat} className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-xl transition-all group" title="New Chat">
                                    <FaPen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </button>
                                <button onClick={() => { setIsSidebarOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }} className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-xl transition-all group" title="Search Chats">
                                    <FaSearch className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </button>

                                {/* Conditional Action Buttons (Visible only when chat is active) */}
                                {messages.length > 0 && (
                                    <>
                                        {/* Generate Image Button (Mini Sidebar) */}
                                        <button
                                            onClick={() => setPrompt(t('quick.generateImagePrompt'))}
                                            className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all group"
                                            title={t('quick.generateImage')}
                                        >
                                            <FaImage className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        </button>

                                        {/* Aether Workspace Button (Mini Sidebar) */}
                                        <button
                                            onClick={() => setPrompt('Try "draw a Flowchart, Sequence , class... diagram"')}
                                            className="p-2.5 text-accent hover:text-accent-light hover:bg-accent/10 rounded-xl transition-all group"
                                            title="Aether Workspace"
                                        >
                                            <div className={`p-1 rounded-full flex items-center justify-center transition-all ${(!prompt || prompt.trim() === '') ? 'animate-logo-nebula' : ''}`}>
                                                <FaProjectDiagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            </div>
                                        </button>
                                    </>
                                )}

                                <button onClick={() => handleOpenSettings('general')} className="p-2.5 mt-auto text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-xl transition-all group" title={t('settings.title')}>
                                    <FaCog className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>
                        )}

                        <Header selectedModel={selectedModel} isSidebarOpen={isSidebarOpen} sessionTokens={sessionTokens} />

                        <main className='flex-1 flex flex-col p-4 sm:p-6 overflow-hidden relative'>
                            <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto h-full">
                                {messages.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 w-full animate-in fade-in duration-500">
                                        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 dark:text-zinc-200 text-center">{t('app.emptyState')}</h2>
                                        <div className="w-full max-w-3xl flex flex-col gap-6">
                                            <PromptForm prompt={prompt} onPromptChange={setPrompt} onSubmit={handleSubmit} onStop={handleStop} onRegenerate={handleRegenerate} messages={messages} models={MODELS} selectedModel={selectedModel} onModelChange={handleModelChange} isVisionModel={isVisionModel} isNovaFileModel={isNovaFileModel} onImageChange={handleImageChange} onFileChange={handleFileChange} imageData={imageData} attachedFiles={attachedFiles} onRemoveFile={removeFile} clearImage={clearImage} clearFiles={clearFiles} loading={loading} imageInputRef={imageInputRef} fileInputRef={fileInputRef} isWebSearchEnabled={isWebSearchEnabled} setIsWebSearchEnabled={setIsWebSearchEnabled} userApiKey={userApiKey} />
                                            <QuickActions onSelect={handleQuickActionSelect} onOpenEditor={() => setPrompt('Try "draw a Flowchart, Sequence , class... diagram"')} prompt={prompt} />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-1 overflow-y-auto mb-4 scroll-smooth pr-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent main-chat-container">
                                            {messages.map((msg, index) => (
                                                <ChatMessage key={index} role={msg.role} content={msg.content} onOpenArtifact={(code) => { setArtifactCode(code); setIsArtifactOpen(true); }} />
                                            ))}
                                            {loading && <ChatMessage role="assistant" content={answer || "Thinking..."} model={selectedModel} />}
                                            {(validationError || apiError) && <ErrorBanner message={apiError || validationError} />}
                                            <div ref={messagesEndRef} />
                                        </div>
                                        <div className="mt-auto">
                                            <PromptForm prompt={prompt} onPromptChange={setPrompt} onSubmit={handleSubmit} onStop={handleStop} onRegenerate={handleRegenerate} messages={messages} models={MODELS} selectedModel={selectedModel} onModelChange={handleModelChange} isVisionModel={isVisionModel} isNovaFileModel={isNovaFileModel} onImageChange={handleImageChange} onFileChange={handleFileChange} imageData={imageData} attachedFiles={attachedFiles} onRemoveFile={removeFile} clearImage={clearImage} clearFiles={clearFiles} loading={loading} imageInputRef={imageInputRef} fileInputRef={fileInputRef} isWebSearchEnabled={isWebSearchEnabled} setIsWebSearchEnabled={setIsWebSearchEnabled} userApiKey={userApiKey} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </main>
                    </div>
                </div>

                <MermaidWorkspace isOpen={isArtifactOpen} onClose={() => setIsArtifactOpen(false)} initialCode={artifactCode} />
                <ApiKeyRequirementModal isOpen={isApiKeyPopupOpen} onClose={() => setIsApiKeyPopupOpen(false)} onOpenSettings={() => { setIsApiKeyPopupOpen(false); handleOpenSettings('security'); }} />
                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} initialPrompt={systemPrompt} onSave={setSystemPrompt} onArchiveAll={archiveAllChats} onDeleteAll={deleteAllSessions} onExport={exportData} initialTab={settingsInitialTab} apiKey={userApiKey} onApiKeyChange={handleApiKeyChange} />
                <ImageGalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} onReusePrompt={(p) => setPrompt(`/imagine ${p}`)} />
                <VoiceInteractionModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} onSubmit={handleVoiceSubmit} lastResponse={answer} isGenerating={loading} t={t} />
            </div>
        );
    };

    const AppContent = () => {
        const { isAuthenticated, loading: authLoading } = useAuth();
        if (authLoading) return (
            <div className="h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
        if (!isAuthenticated) return <LoginPage />;
        return <AuthenticatedApp />;
    };

    const App = () => (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );

    export default App;
