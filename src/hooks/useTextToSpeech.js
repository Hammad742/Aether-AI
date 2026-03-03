/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from 'react';

const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(false);
    const synth = useRef(null);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            setSupported(true);
            synth.current = window.speechSynthesis;
        }
    }, []);

    const speak = useCallback((text) => {
        if (!supported || !synth.current) return;

        // Basic markdown stripping for readable speech
        let readableText = text
            .replace(/```[\s\S]*?```/g, ' Code snippet. ') // Replace code block contents
            .replace(/`.*?`/g, '') // remove inline code
            .replace(/[#*>-]/g, ' ') // remove basic markdown chars
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // extract link text
            .replace(/\n+/g, ' ')
            .trim();

        if (!readableText) return;

        synth.current.cancel();

        const utterance = new SpeechSynthesisUtterance(readableText);

        utterance.onstart = () => setIsSpeaking(true);

        // Handle end and cancel gracefully to reset state
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error('TTS error:', e);
            setIsSpeaking(false);
        };

        synth.current.speak(utterance);
    }, [supported]);

    const stop = useCallback(() => {
        if (!supported || !synth.current) return;
        synth.current.cancel();
        setIsSpeaking(false);
    }, [supported]);

    return { speak, stop, isSpeaking, supported };
};

export default useTextToSpeech;
