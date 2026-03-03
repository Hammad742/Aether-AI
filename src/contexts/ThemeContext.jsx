/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('app-theme');
        return saved || 'system'; // default to system
    });
    const [accentColor, setAccentColor] = useState(() => {
        const saved = localStorage.getItem('app-accent-color');
        return saved || 'default';
    });
    const [designPreset, setDesignPreset] = useState(() => {
        const saved = localStorage.getItem('app-design-preset');
        return saved || 'default';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = () => {
            const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
            if (isDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        applyTheme();
        localStorage.setItem('app-theme', theme);

        const listener = () => {
            if (theme === 'system') applyTheme();
        };

        mediaQuery.addEventListener('change', listener);
        return () => mediaQuery.removeEventListener('change', listener);
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;
        // remove old theme classes
        root.classList.forEach(className => {
            if (className.startsWith('theme-')) {
                root.classList.remove(className);
            }
        });

        if (accentColor !== 'default') {
            root.classList.add(`theme-${accentColor}`);
        }
        localStorage.setItem('app-accent-color', accentColor);
    }, [accentColor]);

    useEffect(() => {
        const root = window.document.documentElement;
        // remove old preset classes
        root.classList.forEach(className => {
            if (className.startsWith('preset-')) {
                root.classList.remove(className);
            }
        });

        if (designPreset !== 'default') {
            root.classList.add(`preset-${designPreset}`);
        }
        localStorage.setItem('app-design-preset', designPreset);
    }, [designPreset]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor, designPreset, setDesignPreset }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
