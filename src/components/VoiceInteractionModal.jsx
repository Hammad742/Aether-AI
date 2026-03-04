/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaTimes, FaVolumeUp, FaVolumeMute, FaPaperPlane, FaCircleNotch } from 'react-icons/fa';

// FORMAL STATUS ENUMS
const STATUS = {
    IDLE: 'idle',
    LISTENING: 'listening',
    THINKING: 'thinking',
    SPEAKING: 'speaking'
};

const VoiceInteractionModal = ({ isOpen, onClose, onSubmit, lastResponse, isGenerating, t }) => {
    const [status, setStatus] = useState(STATUS.IDLE);
    const [transcript, setTranscript] = useState('');
    const [isMuted, setIsMuted] = useState(false);

    // Refs for persistence
    const recognitionRef = useRef(null);
    const synthesisRef = useRef(window.speechSynthesis);
    const speechQueue = useRef([]);
    const lastSpokenIndex = useRef(0);
    const isModalClosing = useRef(false);

    // HELPERS
    const resetAll = React.useCallback(() => {
        lastSpokenIndex.current = 0;
        speechQueue.current = [];
        setTranscript('');
        if (synthesisRef.current) synthesisRef.current.cancel();
    }, []);

    const stopListening = React.useCallback(() => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { /* ignore */ }
        }
    }, []);

    const stopAll = React.useCallback(() => {
        stopListening();
        if (synthesisRef.current) synthesisRef.current.cancel();
        speechQueue.current = [];
    }, [stopListening]);

    const startListening = React.useCallback(() => {
        if (!recognitionRef.current || isGenerating || status === STATUS.SPEAKING) return;
        setTranscript('');
        try { recognitionRef.current.start(); } catch { /* ignore */ }
    }, [isGenerating, status]);

    const setIdleOrListen = React.useCallback(() => {
        if (isMuted) {
            setStatus(STATUS.IDLE);
            stopListening();
        } else {
            setStatus(STATUS.LISTENING);
            startListening();
        }
    }, [isMuted, stopListening, startListening]);

    // Use a ref for the recursive call to satisfy the linter
    const processNextSpeechRef = useRef();

    const processNextSpeech = React.useCallback(() => {
        if (isMuted || !isOpen || speechQueue.current.length === 0) {
            if (status === STATUS.SPEAKING) setIdleOrListen();
            return;
        }

        setStatus(STATUS.SPEAKING);
        stopListening();

        const text = speechQueue.current.shift();
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onend = () => {
            if (speechQueue.current.length > 0) {
                if (processNextSpeechRef.current) processNextSpeechRef.current();
            } else if (!isGenerating) {
                setIdleOrListen();
            }
        };

        utterance.onerror = () => {
            if (processNextSpeechRef.current) processNextSpeechRef.current();
        };

        if (synthesisRef.current) synthesisRef.current.speak(utterance);
    }, [isGenerating, isMuted, isOpen, status, stopListening, setIdleOrListen]);

    useEffect(() => {
        processNextSpeechRef.current = processNextSpeech;
    }, [processNextSpeech]);

    const addToSpeechQueue = React.useCallback((text) => {
        const clean = text.replace(/[*#`_]/g, '').trim();
        if (!clean) return;
        speechQueue.current.push(clean);
        if (status !== STATUS.SPEAKING) {
            processNextSpeech();
        }
    }, [status, processNextSpeech]);

    // 1. INITIALIZATION
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let current = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    current += event.results[i][0].transcript;
                }
                setTranscript(current);
            };

            recognitionRef.current.onend = () => {
                // Only restart if we are still supposed to be listening
                if (isOpen && status === STATUS.LISTENING && !isModalClosing.current) {
                    try { recognitionRef.current.start(); } catch { /* ignore */ }
                }
            };

            recognitionRef.current.onerror = (event) => {
                if (event.error !== 'no-speech') {
                    console.error('Recognition error:', event.error);
                }
            };
        }

        const recognition = recognitionRef.current;
        const synthesis = synthesisRef.current;

        return () => {
            if (recognition) recognition.stop();
            if (synthesis) synthesis.cancel();
        };
    }, [isOpen, status]);

    // 2. MODAL STATE SYNC
    useEffect(() => {
        if (isOpen) {
            isModalClosing.current = false;
            resetAll();
            setIdleOrListen();
        } else {
            isModalClosing.current = true;
            stopAll();
        }
    }, [isOpen, resetAll, setIdleOrListen, stopAll]);

    // 3. MUTE SYNC
    useEffect(() => {
        if (isMuted) {
            setStatus(STATUS.IDLE);
            stopListening();
            if (synthesisRef.current) synthesisRef.current.cancel();
            speechQueue.current = [];
        } else if (isOpen && status === STATUS.IDLE) {
            setIdleOrListen();
        }
    }, [isMuted, isOpen, status, stopListening, setIdleOrListen]);

    // 4. GENERATION STATE SYNC
    useEffect(() => {
        if (isGenerating) {
            setStatus(STATUS.THINKING);
            lastSpokenIndex.current = 0;
            speechQueue.current = [];
            stopListening();
            if (synthesisRef.current) synthesisRef.current.cancel();
        } else if (status === STATUS.THINKING) {
            // If thinking finished, check if we have speech or return to idle
            if (speechQueue.current.length === 0) {
                setIdleOrListen();
            }
        }
    }, [isGenerating, status, stopListening, setIdleOrListen]);

    // 5. STREAMING RESPONSE LISTENER
    useEffect(() => {
        if (!isOpen || !lastResponse || isMuted || status === STATUS.LISTENING) return;

        const currentText = lastResponse.slice(lastSpokenIndex.current);
        const sentenceMatch = currentText.match(/.*[.!?\n]/);

        if (sentenceMatch) {
            const part = sentenceMatch[0];
            lastSpokenIndex.current += part.length;
            addToSpeechQueue(part);
        } else if (!isGenerating && currentText.trim()) {
            // Final chunk
            lastSpokenIndex.current = lastResponse.length;
            addToSpeechQueue(currentText);
        }
    }, [lastResponse, isGenerating, isMuted, isOpen, status, addToSpeechQueue]);

    const handleDone = () => {
        stopListening();
        setStatus(STATUS.IDLE);
    };

    const handleSend = () => {
        if (!transcript.trim()) return;
        const text = transcript;
        stopAll();
        setStatus(STATUS.THINKING);
        onSubmit(text);
        setTranscript('');
    };

    if (!isOpen) return null;



    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative w-full max-w-xl glass-apple rounded-[3rem] shadow-2xl overflow-hidden flex flex-col transition-all aspect-square sm:aspect-auto sm:h-[600px]">

                {/* Header Actions */}
                <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex items-center gap-2 sm:gap-3 z-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                        className={`p-3 sm:p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/10 text-red-500 scale-110' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
                        title={isMuted ? 'Unmute' : 'Mute AI Voice'}
                    >
                        {isMuted ? <FaVolumeMute className="w-5 h-5" /> : <FaVolumeUp className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-3 sm:p-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Visualizer Body */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 gap-8 sm:gap-16">
                    <div className="relative flex items-center justify-center">

                        {/* Status-Based Animation */}
                        <div className={`
                            relative z-10 w-32 h-32 sm:w-44 sm:h-44 rounded-full flex items-center justify-center transition-all duration-700
                            ${status === STATUS.SPEAKING
                                ? 'bg-accent-DEFAULT shadow-[0_0_80px_rgba(var(--accent-rgb),0.6)] scale-110'
                                : status === STATUS.THINKING
                                    ? 'bg-zinc-100 dark:bg-zinc-800 scale-100'
                                    : status === STATUS.LISTENING
                                        ? 'bg-zinc-900 dark:bg-zinc-50 shadow-[0_0_40px_rgba(var(--accent-rgb),0.2)] scale-105'
                                        : 'bg-zinc-200 dark:bg-zinc-800 scale-90 opacity-40'
                            }
                        `}>
                            {status === STATUS.SPEAKING ? (
                                <div className="flex gap-2 items-center h-12">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div
                                            key={i}
                                            className="w-1.5 bg-accent-contrast rounded-full animate-voice-bar"
                                            style={{ animationDelay: `${i * 0.1}s`, height: '20px' }}
                                        />
                                    ))}
                                </div>
                            ) : status === STATUS.THINKING ? (
                                <FaCircleNotch className="w-12 h-12 text-accent-DEFAULT animate-spin" />
                            ) : (
                                <FaMicrophone className={`w-14 h-14 transition-colors ${status === STATUS.LISTENING ? 'text-white dark:text-zinc-900' : 'text-zinc-400'}`} />
                            )}
                        </div>

                        {/* Ambient Effects */}
                        {status === STATUS.LISTENING && (
                            <div className="absolute inset-[-40px] border-2 border-accent-DEFAULT/20 rounded-full animate-ping-slow scale-150 opacity-0" />
                        )}
                        {status === STATUS.SPEAKING && (
                            <div className="absolute inset-[-20px] bg-accent-DEFAULT/10 rounded-full animate-pulse-slow" />
                        )}
                    </div>

                    <div className="w-full text-center space-y-4 sm:space-y-6">
                        <div className="space-y-2">
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-accent-DEFAULT bg-accent-DEFAULT/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                                {status === STATUS.LISTENING ? t('status.listening') || 'LISTENING' : status === STATUS.SPEAKING ? t('status.speaking') || 'SPEAKING' : status === STATUS.THINKING ? t('status.thinking') || 'THINKING' : 'IDLE'}
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 h-8 sm:h-10">
                                {status === STATUS.LISTENING ? (transcript ? '' : 'Say something...') : status === STATUS.SPEAKING ? 'AI is replying...' : status === STATUS.THINKING ? 'AI is thinking...' : 'Wait a moment...'}
                            </h2>
                        </div>

                        <div className="h-20 flex items-center justify-center px-4 overflow-hidden">
                            <p className="text-xl text-zinc-500 dark:text-zinc-400 italic max-w-md w-full line-clamp-3">
                                {transcript || (status === STATUS.SPEAKING ? 'Reading response to you...' : status === STATUS.THINKING ? 'Formulating expert answer...' : 'Transcribing your voice...')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Interactive Bar */}
                <div className="p-6 sm:p-10 flex flex-wrap justify-center gap-4 bg-zinc-400/10 dark:bg-zinc-800/30 border-t border-zinc-200/20 dark:border-zinc-700/20">
                    {status === STATUS.LISTENING && (
                        <button
                            onClick={handleDone}
                            className="flex items-center gap-3 px-10 py-4 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-[2rem] font-bold transition-all active:scale-95 animate-in slide-in-from-bottom-4"
                        >
                            <FaTimes className="w-4 h-4" /> Done
                        </button>
                    )}
                    {transcript && status !== STATUS.THINKING && (
                        <button
                            onClick={handleSend}
                            className="flex items-center gap-3 px-10 py-4 bg-accent-DEFAULT hover:bg-accent-hover text-accent-contrast rounded-[2rem] font-bold transition-all shadow-xl shadow-accent-DEFAULT/20 active:scale-95 animate-in slide-in-from-bottom-4"
                        >
                            <FaPaperPlane className="w-4 h-4" /> Send Command
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes ping-slow {
                    0% { transform: scale(1); opacity: 0.5; }
                    100% { transform: scale(1.8); opacity: 0; }
                }
                .animate-ping-slow {
                    animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 0.1; }
                    50% { transform: scale(1.1); opacity: 0.2; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
                @keyframes voice-bar {
                    0%, 100% { height: 15px; }
                    50% { height: 45px; }
                }
                .animate-voice-bar {
                    animation: voice-bar 0.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default VoiceInteractionModal;
