import React from 'react';
import { FaKey, FaArrowRight, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

const ApiKeyRequirementModal = ({ isOpen, onClose, onOpenSettings }) => {
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-sm glass-apple-blue rounded-[32px] shadow-2xl overflow-hidden scale-in-center border border-white/30 dark:border-white/10">
                <div className="p-8 flex flex-col items-center text-center">
                    {/* Icon Circle */}
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-accent/5">
                        <FaKey className="text-accent w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                        {t('error.missingApiKey')}
                    </h3>

                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-8">
                        {t('settings.apiKeySubtext')}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={onOpenSettings}
                            style={{
                                backgroundColor: 'var(--accent-main)',
                                color: 'var(--accent-contrast)'
                            }}
                            className="w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group shadow-xl shadow-black/10 active:scale-95 border border-black/5"
                        >
                            {t('app.settings')}
                            <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl font-medium transition-all active:scale-95"
                        >
                            {t('app.cancel')}
                        </button>
                    </div>
                </div>

                {/* Close Button Corner */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                    <FaTimes className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ApiKeyRequirementModal;
