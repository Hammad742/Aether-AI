/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const savedSettings = localStorage.getItem('aetherai_settings');
        if (savedSettings) {
            try {
                return JSON.parse(savedSettings);
            } catch {
                // Return defaults on error
            }
        }
        return {
            appearance: 'System', // 'System', 'Dark', 'Light'
            accentColor: 'Default',
            designStyle: 'Default',
            language: 'English',
            customInstructions: { aboutUser: '', respondHow: '' },
            profile: { name: 'Hammad', avatar: '' },
            personalApiKey: '',
            analytics: { messagesSent: 0, imagesGenerated: 0 },
            desktopNotifications: false
        };
    });

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        // Save to localStorage
        localStorage.setItem('aetherai_settings', JSON.stringify(settings));

        // Inject DOM attributes for styling
        const root = document.documentElement;

        // Apply appearance (Dark/Light/System)
        if (settings.appearance === 'Light') {
            root.classList.add('light');
            root.classList.remove('dark');
        } else if (settings.appearance === 'Dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            // System preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
                root.classList.remove('light');
            } else {
                root.classList.add('light');
                root.classList.remove('dark');
            }
        }

        // Apply data attributes for Tailwind targeting
        root.setAttribute('data-accent', settings.accentColor.toLowerCase());
        root.setAttribute('data-style', settings.designStyle.toLowerCase());
        root.setAttribute('lang', settings.language === 'English' ? 'en' : 'other');

    }, [settings]);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};
