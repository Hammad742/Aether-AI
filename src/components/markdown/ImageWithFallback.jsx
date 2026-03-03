import React, { useState } from 'react';
import { FaImage, FaExclamationTriangle } from 'react-icons/fa';

const ImageWithFallback = (props) => {
    const [status, setStatus] = useState('loading');
    const [currentSrc] = useState(props.src);

    const handleLoad = () => setStatus('loaded');

    const handleError = () => {
        setStatus('error');
    };

    return (
        <div className="my-4 relative min-h-[200px] flex flex-col items-center justify-center bg-zinc-900/50 rounded-lg border border-zinc-700/50 overflow-hidden">
            {status === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400 animate-pulse">
                    <FaImage className="w-8 h-8 opacity-50" />
                    <span className="text-sm">Generating image...</span>
                </div>
            )}

            {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-red-400 p-4 text-center">
                    <FaExclamationTriangle className="w-8 h-8 opacity-50" />
                    <span className="text-sm font-medium">Failed to load image</span>
                    <span className="text-xs text-zinc-500 break-all px-4">{currentSrc}</span>
                    <a href={currentSrc} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-light hover:underline mt-2">
                        Open direct link
                    </a>
                </div>
            )}

            <img
                {...props}
                src={currentSrc}
                className={`rounded-lg shadow-lg max-w-full h-auto transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                onLoad={handleLoad}
                onError={handleError}
                loading="lazy"
                referrerPolicy="no-referrer"
            />
        </div>
    );
};

export default ImageWithFallback;
