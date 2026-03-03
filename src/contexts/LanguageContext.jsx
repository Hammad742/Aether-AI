/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';
import { translations } from '../constants/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Check local storage or default to English
    const [language, setLanguage] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedLanguage = localStorage.getItem('app-language');
            return savedLanguage || 'en';
        }
        return 'en';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('app-language', language);
        }
    }, [language]);

    // Fast translation lookup function
    const t = (key) => {
        // Fallback to English if the translation key is missing in the current language
        return translations[language]?.[key] || translations['en']?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
