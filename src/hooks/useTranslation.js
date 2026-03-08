import { useSettings } from '../context/SettingsContext';
import { translations } from '../utils/translations';

export const useTranslation = () => {
    const { settings } = useSettings();
    const currentLang = settings.language || 'English';

    const t = (key, params = {}) => {
        const langDict = translations[currentLang] || translations['English'];
        let text = langDict[key] || translations['English'][key] || key;

        // Replace parameters in the string (e.g., {tab})
        if (Object.keys(params).length > 0) {
            Object.keys(params).forEach(param => {
                text = text.replace(`{${param}}`, params[param]);
            });
        }

        return text;
    };

    return { t, currentLang };
};
