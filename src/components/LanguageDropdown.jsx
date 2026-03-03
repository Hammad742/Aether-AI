import { useState } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa';

const LANGUAGES = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'Hindi (हिन्दी)' },
    { id: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
    { id: 'zh', label: 'Chinese (中文)' },
    { id: 'es', label: 'Spanish (Español)' },
    { id: 'tr', label: 'Turkish (Türkçe)' },
    { id: 'de', label: 'German (Deutsch)' }
];

const LanguageDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedLanguage = LANGUAGES.find(l => l.id === value) || LANGUAGES[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-sm"
            >
                {selectedLanguage.label} <FaChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-48 bg-zinc-50 dark:bg-[#2f2f2f] border border-zinc-200 dark:border-zinc-700/50 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left sm:origin-top-right max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600">
                    {LANGUAGES.map((language) => (
                        <button
                            key={language.id}
                            onClick={() => {
                                onChange(language.id);
                                setIsOpen(false);
                            }}
                            className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 transition-colors"
                        >
                            <span>{language.label}</span>
                            {value === language.id && <FaCheck className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 shrink-0" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageDropdown;
