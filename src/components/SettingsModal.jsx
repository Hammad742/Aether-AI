/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import {
    FaTimes, FaCog, FaBell, FaPaintBrush, FaRocket,
    FaDatabase, FaShieldAlt, FaUserShield, FaUser,
    FaChevronDown, FaPlay, FaCircle, FaChevronLeft, FaCheck, FaArrowRight, FaSpinner
} from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageDropdown from './LanguageDropdown';
import { useAuth } from '../contexts/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

const TABS = [
    { id: 'general', label: 'General', icon: FaCog },
    { id: 'data', label: 'Data controls', icon: FaDatabase },
    { id: 'security', label: 'Security', icon: FaShieldAlt },
    { id: 'account', label: 'Account', icon: FaUser },
];

// Main settings modal component
const SettingsModal = ({ isOpen, onClose, initialPrompt, onDeleteAll, onExportData, apiKey, onApiKeyChange, initialTab }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [, setPrompt] = useState(initialPrompt || '');
    const [showMobileMenu, setShowMobileMenu] = useState(true);
    const { theme, setTheme, accentColor, setAccentColor, designPreset, setDesignPreset } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { user, logout } = useAuth();

    // API Validation State
    const [isValidating, setIsValidating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        setPrompt(initialPrompt || '');
        if (isOpen) {
            setShowMobileMenu(true);
            if (initialTab) setActiveTab(initialTab);
            // Reset validation state when opening
            setIsSuccess(false);
            setValidationError('');
        }
    }, [initialPrompt, isOpen, initialTab]);

    const handleValidateKey = async (e) => {
        e?.stopPropagation();
        if (!apiKey || isValidating) return;

        setIsValidating(true);
        setValidationError('');
        setIsSuccess(false);

        try {
            const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.origin,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    setIsSuccess(true);
                    // Automatic hide success message after 3 seconds
                    setTimeout(() => setIsSuccess(false), 3000);
                } else {
                    throw new Error('Invalid response from server');
                }
            } else {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || 'Invalid API key');
            }
        } catch (err) {
            setValidationError(err.message);
        } finally {
            setIsValidating(false);
        }
    };

    if (!isOpen) return null;


    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-[1px] animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="w-full sm:max-w-4xl h-full sm:h-[80vh] sm:max-h-[650px] glass-apple sm:rounded-2xl shadow-2xl flex flex-col sm:flex-row overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Left Sidebar Menu */}
                <div className={`w-full sm:w-64 bg-zinc-50 dark:bg-[#171717] sm:border-r border-zinc-200 dark:border-zinc-800/80 flex-col shrink-0 ${!showMobileMenu ? 'hidden sm:flex' : 'flex'}`}>
                    <div className="p-3 sm:p-4 flex items-center shrink-0">
                        <h2 className="sm:hidden flex-1 text-center font-semibold text-zinc-900 dark:text-zinc-100 ml-8">{t('settings.title')}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors bg-zinc-200/50 dark:bg-zinc-800/50 sm:bg-transparent"
                        >
                            <FaTimes className="w-5 h-5 sm:w-5 sm:h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 sm:px-3 pb-4 scrollbar-thin scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600">
                        <div className="flex flex-col gap-1 pt-1 px-1 sm:px-0">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setShowMobileMenu(false);
                                            setShowLogoutConfirm(false);
                                        }}
                                        className={`
                                            flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0
                                            ${isActive
                                                ? 'bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100'
                                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                                            }
                                        `}
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        <span>{t(`settings.${tab.id}`)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className={`flex-1 flex-col bg-white dark:bg-[#171717] overflow-hidden ${showMobileMenu ? 'hidden sm:flex' : 'flex'}`}>
                    <div className="p-4 sm:p-10 pb-2 sm:pb-4 shrink-0 flex items-center gap-2 sm:block border-b border-zinc-200 dark:border-zinc-800/80 sm:border-0 min-h-[60px]">
                        <button
                            className="sm:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                            onClick={() => setShowMobileMenu(true)}
                        >
                            <FaChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:border-b sm:border-zinc-200 sm:dark:border-zinc-800/80 sm:pb-6">
                            {t(`settings.${TABS.find(t => t.id === activeTab)?.id}`)}
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 sm:px-10 pb-10 scrollbar-thin scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600 pt-2 sm:pt-0">

                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="flex flex-col">
                                <SettingRow label={t('settings.appearance')}>
                                    <Dropdown
                                        value={theme.charAt(0).toUpperCase() + theme.slice(1)}
                                        options={[t('theme.system'), t('theme.dark'), t('theme.light')]}
                                        onChange={(val) => {
                                            const v = val.toLowerCase();
                                            // Handle translated values matching internal logic
                                            if (v === t('theme.system').toLowerCase()) setTheme('system');
                                            else if (v === t('theme.dark').toLowerCase()) setTheme('dark');
                                            else if (v === t('theme.light').toLowerCase()) setTheme('light');
                                        }}
                                    />
                                </SettingRow>

                                <SettingRow label={t('settings.accentColor')}>
                                    <AccentDropdown
                                        value={accentColor}
                                        onChange={setAccentColor}
                                        t={t}
                                    />
                                </SettingRow>

                                <SettingRow label={t('settings.designStyle') || 'Design Style'}>
                                    <Dropdown
                                        value={designPreset.charAt(0).toUpperCase() + designPreset.slice(1)}
                                        options={['Default', 'Midnight', 'Cyberpunk', 'Glass']}
                                        onChange={(val) => setDesignPreset(val.toLowerCase())}
                                    />
                                </SettingRow>

                                <SettingRow label={t('settings.language')}>
                                    <LanguageDropdown value={language} onChange={setLanguage} />
                                </SettingRow>

                            </div>
                        )}


                        {/* DATA TAB */}
                        {activeTab === 'data' && (
                            <div className="flex flex-col">
                                <SettingRow label={t('settings.deleteAllChats')}>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete all chats? This cannot be undone.')) {
                                                onDeleteAll();
                                            }
                                        }}
                                        className="px-4 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-full transition-colors border border-red-200 dark:border-red-500/20"
                                    >
                                        {t('settings.deleteAll')}
                                    </button>
                                </SettingRow>

                                <SettingRow label={t('settings.exportData')}>
                                    <button
                                        onClick={onExportData}
                                        className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-medium rounded-full transition-colors border border-zinc-200 dark:border-zinc-700"
                                    >
                                        {t('settings.export')}
                                    </button>
                                </SettingRow>
                            </div>
                        )}

                        {/* SECURITY TAB */}
                        {activeTab === 'security' && (
                            <div className="flex flex-col">
                                <SettingRow
                                    label={t('settings.apiKey')}
                                    subtext={t('settings.apiKeySubtext')}
                                >
                                    <div className="flex flex-col gap-2 w-full sm:w-72">
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={apiKey}
                                                onChange={(e) => {
                                                    onApiKeyChange(e.target.value);
                                                    if (isSuccess) setIsSuccess(false);
                                                    if (validationError) setValidationError('');
                                                }}
                                                placeholder={t('settings.apiKeyPlaceholder')}
                                                className={`w-full px-4 py-2 pr-10 text-sm bg-zinc-100 dark:bg-zinc-800/50 border ${validationError ? 'border-red-500/50' : 'border-zinc-200 dark:border-zinc-700'} rounded-xl focus:outline-none focus:ring-2 ${validationError ? 'focus:ring-red-500/30' : 'focus:ring-accent/50'} transition-all`}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleValidateKey();
                                                }}
                                            />
                                            {apiKey && (
                                                <button
                                                    onClick={handleValidateKey}
                                                    disabled={isValidating}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-accent dark:text-zinc-500 dark:hover:text-accent-light transition-colors disabled:opacity-50"
                                                    title="Validate API Key"
                                                >
                                                    {isValidating ? (
                                                        <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <FaArrowRight className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Validation Messages */}
                                        <div className="h-4 flex items-center px-1">
                                            {isValidating && (
                                                <span className="text-[10px] text-zinc-400 animate-pulse">Checking key...</span>
                                            )}
                                            {isSuccess && (
                                                <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                                    <span className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">Key Found</span>
                                                </div>
                                            )}
                                            {validationError && (
                                                <span className="text-[10px] text-red-500 dark:text-red-400 truncate">{validationError}</span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => window.open('https://openrouter.ai/keys', '_blank')}
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors w-fit group"
                                        >
                                            <FaRocket className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            {t('settings.getApiKey')}
                                        </button>
                                    </div>
                                </SettingRow>
                            </div>
                        )}

                        {/* ACCOUNT TAB */}
                        {activeTab === 'account' && (
                            <div className="flex flex-col items-center py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Profile Header Card */}
                                <div className="w-full max-w-sm glass-apple-blue dark:bg-zinc-800/20 border border-white/20 dark:border-white/10 p-8 rounded-3xl shadow-xl flex flex-col items-center">
                                    <div className="relative mb-6">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent/30 shadow-2xl p-0.5">
                                            {user?.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-accent/10 flex items-center justify-center text-accent">
                                                    <FaUser className="w-10 h-10" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-[#171717] rounded-full shadow-lg"></div>
                                    </div>

                                    <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">
                                        {user?.name || 'Guest User'}
                                    </h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 lowercase font-medium">
                                        {user?.email || 'guest@aether.ai'}
                                    </p>

                                    <div className="w-full pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
                                        {!showLogoutConfirm ? (
                                            <button
                                                onClick={() => setShowLogoutConfirm(true)}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold rounded-2xl transition-all duration-300 border border-red-200 dark:border-red-500/20 group hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                <FaSignOutAlt className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                                <span>Logout from Aether</span>
                                            </button>
                                        ) : (
                                            <div className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                                                <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">
                                                    Are you sure you want to logout?
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setShowLogoutConfirm(false)}
                                                        className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-semibold rounded-xl transition-colors border border-zinc-200 dark:border-zinc-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            logout();
                                                            onClose();
                                                        }}
                                                        className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-red-500/20"
                                                    >
                                                        Logout
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="mt-8 text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">
                                    Secured by Aether Identity
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

// UI Placeholder Components to match the styling
const SettingRow = ({ label, subtext, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-zinc-200 dark:border-zinc-800/80 gap-4 sm:gap-8">
        <div className="flex-1 max-w-md">
            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{label}</h4>
            {subtext && <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">{subtext}</p>}
        </div>
        <div className="flex items-center shrink-0">
            {children}
        </div>
    </div>
);

const Dropdown = ({ value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-sm"
            >
                {value} <FaChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-44 glass-apple-blue rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-left sm:origin-top-right">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                            className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 transition-colors"
                        >
                            {option}
                            {value.toLowerCase() === option.toLowerCase() && <FaCheck className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const ACCENT_COLORS = [
    { id: 'default', label: 'Default', hex: 'bg-zinc-500 dark:bg-zinc-400' },
    { id: 'blue', label: 'Blue', hex: 'bg-blue-500' },
    { id: 'green', label: 'Green', hex: 'bg-emerald-500' },
    { id: 'yellow', label: 'Yellow', hex: 'bg-amber-500' },
    { id: 'pink', label: 'Pink', hex: 'bg-pink-500' },
    { id: 'orange', label: 'Orange', hex: 'bg-orange-500' },
];

const AccentDropdown = ({ value, onChange, t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedColor = ACCENT_COLORS.find(c => c.id === value) || ACCENT_COLORS[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-sm"
            >
                <div className={`w-3 h-3 rounded-full ${selectedColor.hex}`}></div>
                {t ? t(`accent.${selectedColor.label.toLowerCase()}`) || selectedColor.label : selectedColor.label} <FaChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-52 glass-apple-blue rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-left sm:origin-top-right">
                    {ACCENT_COLORS.map((color) => (
                        <button
                            key={color.id}
                            onClick={() => {
                                onChange(color.id);
                                setIsOpen(false);
                            }}
                            className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${color.hex}`}></div>
                                <span>{t ? t(`accent.${color.label.toLowerCase()}`) || color.label : color.label}</span>
                            </div>
                            {value === color.id && <FaCheck className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const ToggleSwitch = ({ isOn, onToggle }) => (
    <button
        className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${isOn ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-600'
            }`}
        onClick={onToggle}
    >
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${isOn ? 'translate-x-4' : 'translate-x-0'
            }`} />
    </button>
);

export default SettingsModal;
