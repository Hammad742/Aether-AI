// Main form component for user input, model selection, and file/image uploads
/* eslint-disable no-unused-vars */

import { useState, useRef, useEffect, useCallback } from 'react'
import { FaBrain, FaFileAlt, FaTrash, FaPaperPlane, FaRobot, FaTimes, FaGlobe, FaMicrophone,    FaStop,
    FaRedo,
    FaPlus,
    FaCheck,
    FaImage
} from 'react-icons/fa';
import { TbPhotoPlus } from "react-icons/tb";
import { useTranslation } from '../hooks/useTranslation'

// Reusable remove/clear button component
const RemoveButton = ({ onClick }) => (
    <button className="p-2 bg-custom-tertiary hover:bg-custom-tertiary border border-custom rounded-lg text-custom-primary" type='button' onClick={onClick}>
        <FaTimes className='w-3 h-3' />
    </button>
)

// Main prompt form component with text input, file uploads, and model selection
const PromptForm = ({
    prompt,
    onPromptChange,
    onSubmit,
    onClearAll,
    models,
    selectedModel,
    onModelChange,
    isVisionModel,
    isNovaFileModel,
    onImageChange,
    onFileChange,
    imageData,
    fileAttachment,
    clearImage,
    clearFile,
    loading,
    imageInputRef,
    fileInputRef,
    stopGeneration,
    onRegenerate,
    showRegenerate,
    onGenerateImage
}) => {
    const { t } = useTranslation();

    // Ultimate Performance: True Native 'Uncontrolled' Input Strategy
    const textareaRef = useRef(null);
    const [hasText, setHasText] = useState(!!(prompt && prompt.trim()));
    const debounceTimer = useRef(null);
    
    // Shield the native input from older React state echoes rewriting the user's active keystrokes
    const lastPushedPrompt = useRef(prompt || '');

    // Sync external Quick Actions or History Loading completely bypassing typing cycle
    useEffect(() => {
        const incoming = prompt || '';
        // If the incoming prompt is NOT what we just explicitly pushed upstream, it's an external action (like Quick Reply)
        if (incoming !== lastPushedPrompt.current) {
            if (textareaRef.current && textareaRef.current.value !== incoming) {
                textareaRef.current.value = incoming;
                setHasText(!!incoming.trim());
                lastPushedPrompt.current = incoming;
            }
        }
    }, [prompt]);

    const pushPromptUpstream = useCallback((val) => {
        lastPushedPrompt.current = val;
        onPromptChange(val);
    }, [onPromptChange]);

    const handleTextChange = (e) => {
        const val = e.target.value;
        const currentlyHasText = !!val.trim();
        
        // ONLY trigger a React component render if we need to enable/disable the Submit button!
        // This guarantees 0ms native text rendering in the browser hardware!
        if (currentlyHasText !== hasText) {
            setHasText(currentlyHasText);
        }

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            pushPromptUpstream(val);
        }, 500); 
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const val = textareaRef.current ? textareaRef.current.value : '';
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        pushPromptUpstream(val);
        setTimeout(() => {
            onSubmit(e, isWebSearchActive);
        }, 0);
    };

    // Disable submit button efficiently
    const disableSubmit = (!hasText && !(isVisionModel && imageData) && !fileAttachment) || loading;

    // State for custom dropdown
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const modelMenuRef = useRef(null);

    // State for plus menu
    const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
    const plusMenuRef = useRef(null);

    // State for new features
    const [isWebSearchActive, setIsWebSearchActive] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Voice Input functionality using Web Speech API
    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const newPrompt = prompt ? `${prompt} ${transcript}` : transcript;
            onPromptChange(newPrompt);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
                setIsModelMenuOpen(false);
            }
            if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
                setIsPlusMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleFormSubmit} className="relative group">
                {/* Main Input Container */}
                {/* 
                  * CRITICAL PERFORMANCE ARCHITECTURE
                  * By placing the incredibly expensive backdrop-blur AND shadow inside an absolute pointer-events-none layer,
                  * the browser perfectly seals the blur computation into static VRAM. If the blur was on the parent, 
                  * every blinking cursor inside the textarea would force a full viewport GPU recalculation!
                  */}
                <div className="relative w-full rounded-3xl group-focus-within:ring-1 group-focus-within:ring-zinc-600 transition-colors duration-200">
                    
                    {/* The Background Blur Layer (Sealed behind text) */}
                    <div className="absolute inset-0 bg-custom-tertiary backdrop-blur-xl border border-custom rounded-3xl shadow-2xl pointer-events-none transform-gpu will-change-transform z-0"></div>

                    {/* The Interactive Content (Text, Buttons) sitting securely on top */}
                    <div className="relative z-10 flex flex-col w-full">
                        
                        {/* Active Tools Previews (Top of input box) */}
                        {(isWebSearchActive || imageData || fileAttachment) && (
                            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar px-4 pt-4 pb-1 w-full shrink-0">
                                
                                {/* Web Search Active Indicator */}
                                {isWebSearchActive && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-medium text-blue-400 shrink-0 shadow-sm animate-in fade-in zoom-in-95 duration-200 cursor-pointer hover:bg-blue-500/20 transition-colors" onClick={() => setIsWebSearchActive(false)} title="Disable Web Search">
                                        <FaGlobe className="w-3.5 h-3.5" />
                                        <span>Search</span>
                                    </div>
                                )}

                                {/* Image Preview Indicator */}
                                {imageData && (
                                    <div className="relative group/preview shrink-0 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-custom">
                                            <img src={imageData} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                        <button type="button" onClick={clearImage} className="absolute -top-1.5 -right-1.5 bg-custom-secondary border border-custom text-red-500 rounded-full p-0.5 opacity-0 group-hover/preview:opacity-100 transition-opacity z-10 shadow-lg hover:bg-red-500/10">
                                            <FaTimes className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                )}

                                {/* File Attachment Indicator */}
                                {fileAttachment && (
                                    <div className="relative group/preview shrink-0 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-400/10 border border-orange-400/20 rounded-lg text-xs font-medium text-orange-400 max-w-[140px] shadow-sm cursor-pointer hover:bg-orange-400/20 transition-colors" onClick={clearFile} title="Remove File">
                                            <FaFileAlt className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{fileAttachment.name}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <textarea
                            ref={textareaRef}
                            defaultValue={prompt || ''}
                            onChange={handleTextChange}
                            onBlur={() => pushPromptUpstream(textareaRef.current ? textareaRef.current.value : '')}
                            disabled={loading}
                            placeholder={t('ask_anything')}
                            className={`w-full bg-transparent border-none outline-none text-custom-primary placeholder-zinc-500 resize-none text-base leading-relaxed px-4 pb-4 overflow-y-auto custom-scrollbar ${(isWebSearchActive || imageData || fileAttachment) ? 'pt-2 min-h-[44px]' : 'pt-4 min-h-[60px]'} max-h-[200px]`}
                            style={{ height: 'auto' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleFormSubmit(e);
                                }
                            }}
                        ></textarea>
                    </div>

                    {/* Bottom Section: Controls & Attachments inside the bar */}
                    <div className="flex items-center justify-between gap-1 px-3 pb-3 pt-1">

                        {/* Left: + Menu, Model, Previews */}
                        <div className="flex items-center justify-start flex-1 gap-2 min-w-0">
                            
                            {/* + Menu Button */}
                            <div className="relative shrink-0" ref={plusMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-custom-secondary border border-custom transition-all duration-300 hover:bg-custom-tertiary shadow-sm"
                                    title="More Options"
                                >
                                    <FaPlus className={`w-3.5 h-3.5 text-custom-primary transition-transform duration-300 ${isPlusMenuOpen ? 'rotate-45' : ''}`} />
                                </button>

                                {/* Custom Dropdown Menu */}
                                {isPlusMenuOpen && (
                                    <div className="absolute bottom-full left-0 mb-3 w-52 bg-[rgb(var(--bg-tertiary)/0.95)] backdrop-blur-xl border border-custom rounded-2xl shadow-xl overflow-hidden z-[100] flex flex-col p-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                        
                                        {/* Web Search */}
                                        <button type="button" onClick={() => { setIsWebSearchActive(!isWebSearchActive); setIsPlusMenuOpen(false); }} className={`flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-xl transition-all duration-200 hover-item ${isWebSearchActive ? 'bg-blue-500/10 text-blue-400 group' : 'text-custom-primary'}`}>
                                            <div className={`p-1.5 rounded-lg transition-colors ${isWebSearchActive ? 'bg-blue-500/20' : 'bg-custom-secondary'}`}>
                                                <FaGlobe className={`w-4 h-4 ${isWebSearchActive ? 'text-blue-400' : 'text-custom-secondary'}`} />
                                            </div>
                                            <span className="font-medium flex-1">Web Search</span>
                                            {isWebSearchActive && <FaCheck className="w-3.5 h-3.5 text-blue-400" />}
                                        </button>
                                        
                                        {/* Attach File */}
                                        <button type="button" onClick={() => { fileInputRef.current?.click(); setIsPlusMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-xl text-custom-primary hover-item transition-all duration-200 mt-1">
                                            <div className="p-1.5 rounded-lg bg-orange-400/10">
                                                <FaFileAlt className="w-4 h-4 text-orange-400" />
                                            </div>
                                            <span className="font-medium flex-1">Upload Document</span>
                                        </button>
                                        
                                        {/* Attach Image (vision only) */}
                                        {isVisionModel && (
                                            <button type="button" onClick={() => { imageInputRef.current?.click(); setIsPlusMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-xl text-custom-primary hover-item transition-all duration-200 mt-1">
                                                <div className="p-1.5 rounded-lg bg-emerald-500/10">
                                                    <TbPhotoPlus className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <span className="font-medium flex-1">Upload Image</span>
                                            </button>
                                        )}
                                        
                                        <div className="h-px bg-white/5 mx-2 my-1"></div>

                                        {/* Generate Image */}
                                        <button type="button" onClick={() => { 
                                            if (onGenerateImage) {
                                                onGenerateImage(t('generate_image_prompt') || 'Generate an image of a ', { isImage: true });
                                            }
                                            setIsPlusMenuOpen(false); 
                                        }} className="flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-xl text-custom-primary hover-item transition-all duration-200 mt-1">
                                            <div className="p-1.5 rounded-lg bg-purple-500/10">
                                                <FaImage className="w-4 h-4 text-purple-400" />
                                            </div>
                                            <span className="font-medium flex-1">{t('generate_image') || 'Generate Image'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Model Pill */}
                            <div className="relative shrink min-w-[60px] max-w-[140px] sm:max-w-none" ref={modelMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                                    className={`flex items-center justify-between w-full gap-2 px-3 py-1.5 bg-custom-tertiary rounded-2xl border border-custom transition-all duration-300 cursor-pointer shadow-sm hover:bg-custom-secondary hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/20 hover:backdrop-blur-md group-hover/model:border-blue-400 ${isModelMenuOpen ? 'bg-custom-secondary border-blue-500/30 shadow-lg shadow-blue-500/20' : ''}`}
                                >
                                    <span className="flex-1 min-w-0 text-left text-xs font-medium text-custom-primary group-hover:text-custom-primary transition-colors truncate">{selectedModel.shortLabel}</span>
                                    <svg className={`w-3 h-3 text-custom-secondary group-hover:text-blue-300 transition-transform duration-300 shrink-0 ${isModelMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Custom Dropdown Menu */}
                                {isModelMenuOpen && (
                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-[rgb(var(--bg-tertiary)/0.95)] backdrop-blur-xl border border-custom rounded-2xl shadow-xl overflow-y-auto max-h-64 z-[100] flex flex-col p-1.5 animate-in fade-in zoom-in-95 duration-200">
                                        {models.map((model) => (
                                            <button
                                                key={model.id}
                                                type="button"
                                                onClick={() => {
                                                    onModelChange(model.id);
                                                    setIsModelMenuOpen(false);
                                                }}
                                                className={`flex items-center w-full px-3 py-2 text-xs text-left rounded-lg transition-all duration-200 group
                                                    ${selectedModel.id === model.id ? 'bg-blue-500/10 text-custom-primary font-medium' : 'text-custom-secondary hover:text-custom-primary'}
                                                    hover-item hover:shadow-lg hover:shadow-blue-500/10 hover:backdrop-blur-md border border-transparent hover:border-blue-500/20`}
                                            >
                                                <span className="flex-1">{model.shortLabel}</span>
                                                {selectedModel.id === model.id && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Previews migrated to top section */}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center justify-end gap-1 shrink-0 bg-transparent relative z-10 pl-1">

                            {/* Voice Input Button */}
                            <button
                                type="button"
                                onClick={handleVoiceInput}
                                className={`flex items-center justify-center shrink-0 w-8 h-8 rounded-full transition-all duration-300 ${isListening ? 'text-red-400 bg-red-400/10 animate-pulse border border-red-400/30' : 'text-custom-secondary hover:text-custom-primary hover:bg-custom-tertiary hover:scale-105'}`}
                                title={isListening ? "Listening..." : "Voice Input"}
                            >
                                <FaMicrophone className="w-3.5 h-3.5" />
                            </button>

                            {/* Clear Text Button (Persistently beside Voice icon) */}
                            {prompt.trim().length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => onPromptChange('')}
                                    className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full text-red-500 hover:bg-red-500/10 hover:scale-105 transition-all duration-300 animate-in fade-in"
                                    title="Clear Text"
                                >
                                    <FaTrash className="w-3.5 h-3.5" />
                                </button>
                            )}

                            {/* Regenerate Button */}
                            {showRegenerate && !loading && !prompt.trim() && (
                                <button
                                    type="button"
                                    onClick={() => onRegenerate(isWebSearchActive)}
                                    className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full text-custom-secondary hover:text-custom-primary hover:bg-custom-tertiary hover:scale-105 transition-all duration-300 animate-in fade-in"
                                    title="Regenerate Response"
                                >
                                    <FaRedo className="w-3.5 h-3.5" />
                                </button>
                            )}

                            {/* Stop or Send Button */}
                            {loading ? (
                                <button
                                    type='button'
                                    onClick={stopGeneration}
                                    className="flex items-center justify-center shrink-0 w-8 h-8 ml-1 rounded-full bg-red-500 hover:bg-red-600 border border-red-400/50 text-white shadow-lg shadow-red-500/20 transition-all duration-300 cursor-pointer hover:scale-105"
                                    title="Stop Generation"
                                >
                                    <FaStop className='w-3.5 h-3.5' />
                                </button>
                            ) : (
                                <button
                                    type='submit'
                                    disabled={disableSubmit}
                                    className={`flex items-center justify-center shrink-0 w-8 h-8 ml-1 rounded-full transition-all duration-300 ${!disableSubmit
                                        ? 'bg-custom-accent text-custom-accent-inverse border border-custom-accent/50 shadow-lg hover:scale-105'
                                        : 'bg-custom-tertiary border border-custom text-custom-secondary opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    <FaPaperPlane className='w-3.5 h-3.5' style={{transform: "translate(-0.5px, 0.5px)"}} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Hidden Inputs */}
                    <input type="file" ref={imageInputRef} accept="image/*" onChange={onImageChange} className='hidden' />
                    <input type="file" ref={fileInputRef} accept=".txt,.md,.markdown,.json,.csv,.log,.yaml,.yml,.xml" onChange={onFileChange} className='hidden' />
                </div>
            </form>
        </div>
    )
}

export default PromptForm;