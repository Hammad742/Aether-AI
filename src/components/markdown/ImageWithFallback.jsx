import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaImage, FaExclamationTriangle, FaDownload, FaExpand, FaCompress, FaTimes } from 'react-icons/fa';

const ImageWithFallback = (props) => {
    const [status, setStatus] = useState('loading');
    const [currentSrc, setCurrentSrc] = useState(props.src);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        if (props.src !== currentSrc) {
            setCurrentSrc(props.src);
            setStatus('loading');
        }
    }, [props.src, currentSrc]);

    const handleFullscreen = () => {
        setIsFullscreen(true);
        // Lock body scroll when fullscreen is active
        document.body.style.overflow = 'hidden';
    };

    const closeFullscreen = () => {
        setIsFullscreen(false);
        // Restore body scroll
        document.body.style.overflow = 'unset';
    };

    // Auto-cleanup scroll lock on unmount
    useEffect(() => {
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleLoad = () => setStatus('loaded');
    const handleError = () => setStatus('error');

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = currentSrc;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="my-4 relative min-h-[200px] flex flex-col items-center justify-center bg-custom-secondary rounded-lg border border-custom overflow-hidden group/img w-full">
            {status === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-custom-secondary animate-pulse bg-custom-secondary z-10">
                    <FaImage className="w-8 h-8 opacity-50" />
                    <span className="text-sm">Generating image...</span>
                </div>
            )}

            {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-red-400 p-4 text-center bg-custom-secondary z-10">
                    <FaExclamationTriangle className="w-8 h-8 opacity-50" />
                    <span className="text-sm font-medium">Failed to load image</span>
                    <a href={currentSrc} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-2">
                        Open direct link
                    </a>
                </div>
            )}

            <img
                {...props}
                ref={imgRef}
                src={currentSrc}
                className={`rounded-lg shadow-lg max-w-full h-auto transition-all duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                onLoad={handleLoad}
                onError={handleError}
                loading="lazy"
                referrerPolicy="no-referrer"
            />

            {status === 'loaded' && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={handleFullscreen}
                        className="p-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-black/70 transition-all shadow-xl"
                        title="Full Screen"
                    >
                        <FaExpand className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-black/70 transition-all shadow-xl"
                        title="Download Image"
                    >
                        <FaDownload className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Custom Fullscreen Portal Overlay */}
            {isFullscreen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                        {/* Top Controls Bar */}
                        <div className="absolute top-4 right-4 flex gap-3 z-50">
                            <button
                                onClick={handleDownload}
                                className="p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-black/70 transition-all shadow-xl"
                                title="Download Image"
                            >
                                <FaDownload className="w-5 h-5" />
                            </button>
                            <button
                                onClick={closeFullscreen}
                                className="p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-red-500/80 transition-all shadow-xl"
                                title="Exit Full Screen"
                            >
                                <FaCompress className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Fullscreen Image Container */}
                        <div 
                            className="relative w-full h-full flex items-center justify-center"
                            onClick={closeFullscreen} // Click anywhere to close
                        >
                            <img
                                src={currentSrc}
                                alt={props.alt || "Fullscreen generated image"}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                                onClick={(e) => e.stopPropagation()} // Prevent bubbling to close overlay
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ImageWithFallback;
