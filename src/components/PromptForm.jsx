// Main form component for user input, model selection, and file/image uploads
/* eslint-disable no-unused-vars */

import React, { useRef, useState, useEffect } from 'react'
import { FaPaperPlane, FaStop, FaImage, FaTimes, FaFileAlt, FaMicrophone, FaGlobe, FaRedo, FaTrash, FaRobot, FaBrain } from 'react-icons/fa'
import { TbPhotoPlus } from "react-icons/tb"
import useSpeechToText from '../hooks/useSpeechToText'
import { useLanguage } from '../contexts/LanguageContext'

// Reusable remove/clear button component
const RemoveButton = ({ onClick }) => (
    <button className="p-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300" type='button' onClick={onClick}>
        <FaTimes className='w-3 h-3' />
    </button>
)

// Main prompt form component with text input, file uploads, and model selection
const PromptForm = ({
    onOpenLibrary,
    userApiKey,
    initialPromptValue = ''
}) => {
    const { t } = useLanguage();
    const [localPrompt, setLocalPrompt] = useState(initialPromptValue);
    const debounceTimerRef = useRef(null);

    // Initial sync
    useEffect(() => {
        if (initialPromptValue !== undefined) {
            setLocalPrompt(initialPromptValue);
        }
    }, [initialPromptValue]);

    // Handle internal prompt changes with debounced parent sync
    const handleInputChange = (value) => {
        setLocalPrompt(value);

        // Sync to parent for token counter (debounced to avoid typing lag)
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            onPromptChange(value);
        }, 500);
    };

    // Immediate sync for submit
    const handleInternalSubmit = (e) => {
        if (e) e.preventDefault();
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        onPromptChange(localPrompt);

        // Use a small timeout to ensure App state is updated before onSubmit triggers its logic
        setTimeout(() => {
            onSubmit(e, localPrompt);
        }, 0);
    };
    // Voice Input Hooks
    const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechToText();
    const [initialPrompt, setInitialPrompt] = useState('');

    // Handle Voice Logic
    useEffect(() => {
        if (transcript) {
            const separator = localPrompt && !localPrompt.endsWith(' ') ? ' ' : '';
            handleInputChange(localPrompt + separator + transcript);
        }
    }, [transcript]); // localPrompt removed from deps to avoid infinite loops

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Disable submit button if no valid content or currently loading
    const disableSubmit = (!localPrompt.trim() && !(isVisionModel && imageData) && attachedFiles.length === 0) || loading;

    // Disable clear button if nothing to clear
    const disableClear = !localPrompt.trim() && !imageData && attachedFiles.length === 0;

    // State for custom dropdown
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const modelMenuRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
                setIsModelMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleInternalSubmit} className="relative group">
                {/* Main Input Container */}
                <div className="relative flex flex-col glass-apple-blue rounded-3xl shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-accent/40 focus-within:shadow-accent/10">

                    {/* Top Section: Text Input */}
                    <div className="flex-1 relative">
                        <textarea
                            value={localPrompt}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onFocus={(e) => {
                                if (localPrompt === 'Try "draw a Flowchart, Sequence , class... diagram"') {
                                    handleInputChange('');
                                }
                            }}
                            disabled={loading}
                            placeholder={!userApiKey ? t('error.missingApiKey') : (loading ? 'Waiting for response...' : t('input.placeholder'))}
                            className={`w-full bg-transparent border-none outline-none ${localPrompt === 'Try "draw a Flowchart, Sequence , class... diagram"'
                                ? 'text-zinc-400 dark:text-zinc-500 italic'
                                : 'text-zinc-900 dark:text-zinc-100'
                                } placeholder-zinc-400 dark:placeholder-zinc-500 resize-none text-base leading-relaxed p-4 min-h-[60px] max-h-[200px]`}
                            style={{ height: 'auto', minHeight: '60px' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleInternalSubmit(e);
                                }
                            }}
                        ></textarea>
                    </div>

                    {/* Bottom Section: Controls & Attachments inside the bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 pb-3 pt-1">

                        {/* Mobile Top Row / Desktop Left: Model Selector */}
                        <div className="flex items-center">
                            <div className="relative" ref={modelMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                                    className={`flex items-center gap-2 px-3 py-1.5 glass-apple-blue rounded-2xl border-blue-400/30 transition-all duration-300 cursor-pointer shadow-sm hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20 group-hover/model:border-accent ${isModelMenuOpen ? 'border-accent/50 shadow-lg shadow-accent/20' : ''}`}
                                >
                                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">{selectedModel.shortLabel}</span>
                                    <svg className={`w-3 h-3 text-zinc-400 dark:text-zinc-500 group-hover:text-accent transition-transform duration-300 ${isModelMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Custom Dropdown Menu */}
                                {isModelMenuOpen && (
                                    <div className="absolute bottom-full left-0 mb-4 w-52 glass-apple-blue rounded-2xl shadow-2xl overflow-hidden z-[100] flex flex-col p-2 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-200 border border-blue-400/20">
                                        {models.map((model) => (
                                            <button
                                                key={model.id}
                                                type="button"
                                                onClick={() => {
                                                    onModelChange(model.id);
                                                    setIsModelMenuOpen(false);
                                                }}
                                                className={`flex items-center w-full px-3 py-2 text-sm text-left rounded-lg transition-all duration-200 group mb-1 last:mb-0
                                                    ${selectedModel.id === model.id
                                                        ? 'bg-accent/10 text-accent font-bold'
                                                        : 'text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white'}
                                                    hover:bg-zinc-100/80 dark:hover:bg-zinc-600/30 hover:shadow-lg hover:shadow-accent/10 hover:backdrop-blur-md hover:border hover:border-accent/20`}
                                            >
                                                <span className="flex-1 truncate font-semibold transition-colors group-hover:text-zinc-900 dark:group-hover:text-zinc-100">{model.shortLabel}</span>
                                                {selectedModel.id === model.id && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] ring-2 ring-blue-500/30"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Bottom Row / Desktop Right: Icons & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto overflow-x-auto sm:overflow-x-visible no-scrollbar">

                            {/* Input Icons Group */}
                            <div className="flex items-center gap-1 sm:gap-1.5">
                                {/* Web Search */}
                                <button
                                    type="button"
                                    onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                                    className={`group flex items-center justify-center p-1.5 rounded-full transition-all duration-200 hover:bg-zinc-700/50 ${isWebSearchEnabled ? 'bg-zinc-700/50' : ''}`}
                                    title={isWebSearchEnabled ? t('input.webSearchOn') : t('input.webSearchOff')}
                                >
                                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${isWebSearchEnabled
                                        ? 'bg-emerald-500/20 backdrop-blur-md border border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                                        : 'bg-zinc-500/10 border border-zinc-500/30 group-hover:bg-emerald-500/10'
                                        }`}>
                                        <FaGlobe className={`w-3 h-3 ${isWebSearchEnabled ? 'text-emerald-400' : 'text-zinc-500'}`} />
                                    </div>
                                </button>

                                {/* File Attachment */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group flex items-center justify-center p-1.5 rounded-full transition-all duration-200 hover:bg-zinc-700/50"
                                    title={t('input.attachDocument')}
                                >
                                    <div className="w-5 h-5 rounded-lg bg-orange-500/20 backdrop-blur-md border border-orange-500/30 flex items-center justify-center shadow-lg shadow-orange-500/10 group-hover:bg-orange-500/30 transition-all">
                                        <FaFileAlt className="w-3 h-3 text-orange-400" />
                                    </div>
                                </button>

                                {/* Image Upload */}
                                {isVisionModel && (
                                    <button
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className="group flex items-center justify-center p-1.5 rounded-full transition-all duration-200 hover:bg-zinc-700/50"
                                        title={t('input.attachImage')}
                                    >
                                        <div className="w-5 h-5 rounded-lg bg-blue-500/20 backdrop-blur-md border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10 group-hover:bg-blue-500/30 transition-all">
                                            <TbPhotoPlus className="w-3 h-3 text-blue-400" />
                                        </div>
                                    </button>
                                )}

                                {/* Mic */}
                                {hasRecognitionSupport && (
                                    <button
                                        type="button"
                                        onClick={handleMicClick}
                                        className={`p-1.5 rounded-full transition-all duration-200 ${isListening
                                            ? 'text-red-500 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 animate-pulse'
                                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
                                            }`}
                                        title={isListening ? t('input.stopListening') : t('input.voiceInput')}
                                    >
                                        <FaMicrophone className="w-4 h-4" />
                                    </button>
                                )}

                            </div>

                            {/* Actions Group (Trash, Regenerate, Send) */}
                            <div className="flex items-center gap-1.5 ml-auto">
                                {/* Attachments Preview */}
                                {(imageData || attachedFiles.length > 0) && (
                                    <div className="flex items-center gap-1.5 mr-1 hidden sm:flex">
                                        {imageData && (
                                            <div className="relative group/preview">
                                                <div className="w-6 h-6 rounded overflow-hidden border border-zinc-600">
                                                    <img src={imageData} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                                <button onClick={clearImage} className="absolute -top-1 -right-1 bg-zinc-900 text-red-400 rounded-full p-0.5 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                                                    <FaTimes className="w-2 h-2" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Clear Button */}
                                {!loading && !disableClear && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleInputChange('');
                                            if (clearImage) clearImage();
                                            if (clearFiles) clearFiles();
                                        }}
                                        className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        title={t('app.clear')}
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                )}

                                {/* Regenerate Button */}
                                {!loading && messages?.length > 0 && onRegenerate && (
                                    <button
                                        type="button"
                                        onClick={onRegenerate}
                                        className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                        title="Regenerate Last Response"
                                    >
                                        <FaRedo className="w-4 h-4" />
                                    </button>
                                )}

                                {/* Send / Stop Button */}
                                <button
                                    type='submit'
                                    onClick={(e) => {
                                        if (loading && onStop) {
                                            e.preventDefault();
                                            onStop();
                                        }
                                    }}
                                    disabled={disableSubmit && !loading}
                                    className={`p-2.5 rounded-full transition-all duration-200 ${loading
                                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30'
                                        : !disableSubmit
                                            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 active:scale-95'
                                            : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 cursor-not-allowed opacity-50'
                                        }`}
                                    title={loading ? 'Stop Generating' : 'Send Message'}
                                >
                                    {loading ? (
                                        <FaStop className='w-4 h-4' />
                                    ) : (
                                        <FaPaperPlane className='w-4 h-4' />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Hidden Inputs */}
                    <input type="file" ref={imageInputRef} accept="image/*" onChange={onImageChange} className='hidden' />
                    <input type="file" ref={fileInputRef} accept=".txt,.md,.markdown,.json,.csv,.log,.yaml,.yml,.xml,.pdf" onChange={onFileChange} className='hidden' />
                </div>
            </form>
        </div>
    )
}

export default PromptForm;