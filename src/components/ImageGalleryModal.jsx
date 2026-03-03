import React, { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaTrash, FaTerminal, FaImage } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

const ImageGalleryModal = ({ isOpen, onClose, onReusePrompt }) => {
    const { t } = useLanguage();
    const [images, setImages] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const stored = JSON.parse(localStorage.getItem('image_gallery') || '[]');
            setImages(stored);
        }
    }, [isOpen]);

    const handleDelete = (id) => {
        const updated = images.filter(img => img.id !== id);
        setImages(updated);
        localStorage.setItem('image_gallery', JSON.stringify(updated));
    };

    const handleDownload = (url, prompt) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `HammadAI-${prompt.slice(0, 20)}.png`;
        link.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-6xl h-[90vh] glass-apple rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-400/10 dark:bg-zinc-800/20 backdrop-blur-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-accent-DEFAULT/10 rounded-xl text-accent-DEFAULT">
                            <FaImage className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                {t('gallery.title') || 'Image Gallery'}
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {images.length} {t('gallery.items') || 'creations saved'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors text-zinc-500"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700">
                    {images.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300">
                                <FaImage className="w-10 h-10" />
                            </div>
                            <p className="text-lg">{t('gallery.empty') || 'No images generated yet'}</p>
                            <p className="text-sm opacity-60">Try "/imagine futuristic city" in the chat</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {images.map((img) => (
                                <div
                                    key={img.id}
                                    className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-accent-DEFAULT/50 transition-all shadow-md hover:shadow-xl"
                                >
                                    <img
                                        src={img.url}
                                        alt={img.prompt}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                        <p className="text-white text-sm font-medium line-clamp-2 mb-4 leading-relaxed">
                                            {img.prompt}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDownload(img.url, img.prompt)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white text-xs font-semibold transition-all"
                                                title="Download"
                                            >
                                                <FaDownload />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onReusePrompt(img.prompt);
                                                    onClose();
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-accent-DEFAULT hover:bg-accent-hover text-accent-contrast rounded-xl text-xs font-semibold transition-all shadow-lg"
                                                title="Reuse Prompt"
                                            >
                                                <FaTerminal />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(img.id)}
                                                className="w-10 flex items-center justify-center py-2 bg-red-500/20 hover:bg-red-500/80 backdrop-blur-md rounded-xl text-red-100 hover:text-white text-xs transition-all border border-red-500/30"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageGalleryModal;
