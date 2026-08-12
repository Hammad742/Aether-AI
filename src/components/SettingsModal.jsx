import { useState, useEffect, memo } from 'react';
import { FaTimes, FaCog, FaDatabase, FaUser, FaCheck, FaChevronLeft, FaPen } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from '../hooks/useTranslation';

const NAV_ITEMS = [
    { id: 'general', label: 'General', icon: FaCog },
    { id: 'data_controls', label: 'Data controls', icon: FaDatabase },
    { id: 'account', label: 'Account', icon: FaUser },
];

const OPTIONS = {
    appearance: ['System', 'Dark', 'Light'],
    accentColor: [
        { label: 'Default', value: 'Default', colorClass: 'bg-zinc-400' },
        { label: 'Blue', value: 'Blue', colorClass: 'bg-blue-500' },
        { label: 'Green', value: 'Green', colorClass: 'bg-green-500' },
        { label: 'Yellow', value: 'Yellow', colorClass: 'bg-yellow-500' },
        { label: 'Pink', value: 'Pink', colorClass: 'bg-pink-500' },
        { label: 'Orange', value: 'Orange', colorClass: 'bg-orange-500' }
    ],
    designStyle: ['Default', 'Midnight', 'Cyberpunk', 'Glass'],
    language: [
        { label: 'English', value: 'English' },
        { label: 'Hindi (हिन्दी)', value: 'Hindi' },
        { label: 'Kannada (ಕನ್ನಡ)', value: 'Kannada' },
        { label: 'Chinese (中文)', value: 'Chinese' },
        { label: 'Spanish (Español)', value: 'Spanish' },
        { label: 'Turkish (Türkçe)', value: 'Turkish' }
    ]
};

// Reusable animated dropdown list
const Dropdown = ({ isOpen, onClose, direction = 'down', children }) => {
    if (!isOpen) return null;
    
    // Dynamic origin animations based on direction
    const positionClasses = direction === 'up' 
        ? "bottom-full mb-2 slide-in-from-bottom-2" 
        : "top-full mt-2 slide-in-from-top-2";

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div className={`absolute right-0 ${positionClasses} w-56 bg-custom-secondary border border-custom rounded-xl shadow-2xl p-2 z-50 overflow-hidden animate-in fade-in duration-200`}>
                {children}
            </div>
        </>
    );
};

const SettingsModal = ({ isOpen, onClose, onDeleteAllChats, onExportAllData }) => {
    const { settings, updateSetting } = useSettings();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('general');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    
    // Custom Instructions State
    const [showCustomInstructions, setShowCustomInstructions] = useState(false);
    const [tempInstructions, setTempInstructions] = useState({ aboutUser: '', respondHow: '' });

    // Profile & Danger Zone States
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [tempProfile, setTempProfile] = useState({ name: '', avatar: '' });
    const [showDangerConfirm, setShowDangerConfirm] = useState(false);
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

    const handleAvatarUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Ensure it's an image and reasonable size (e.g. 2MB max)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be smaller than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setTempProfile(prev => ({ ...prev, avatar: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Reset tab and dropdowns when closed
            setTimeout(() => {
                setActiveTab('general');
                setOpenDropdown(null);
                setShowConfirmDelete(false);
                setShowProfileEdit(false);
                setShowDangerConfirm(false);
                setShowSignOutConfirm(false);
            }, 300);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Blurred Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl bg-custom-primary border border-custom rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] max-h-[700px] animate-in fade-in zoom-in-95 duration-200">

                {/* Mobile Header */}
                <div className={`md:hidden flex items-center justify-between p-4 border-b border-custom bg-custom-secondary ${(showCustomInstructions || showProfileEdit) ? 'hidden' : 'flex'}`}>
                    <h2 className="text-lg font-semibold text-custom-primary">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-custom-secondary hover:text-custom-primary bg-black/10 hover:bg-black/20 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <FaTimes className="w-4 h-4" />
                    </button>
                </div>

                {/* Left Navigation Panel */}
                <div className={`w-full md:w-64 bg-custom-secondary border-b md:border-b-0 md:border-r border-custom flex-col pt-2 md:pt-4 ${(showCustomInstructions || showProfileEdit) ? 'hidden md:flex' : 'flex'}`}>
                    {/* Desktop Close Button */}
                    <div className="hidden md:flex items-center px-4 pb-4">
                        <button
                            onClick={onClose}
                            className="p-2 text-custom-secondary hover:text-custom-primary hover:bg-custom-tertiary rounded-xl transition-colors"
                        >
                            <FaTimes className="w-4 h-4" />
                        </button>
                    </div>

                    <nav className="flex-1 px-3 pb-2 md:pb-4 pt-2 md:py-2 overflow-x-auto md:overflow-y-auto custom-scrollbar mobile-tabs-scrollbar flex md:flex-col gap-1">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setOpenDropdown(null);
                                    }}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isActive
                                        ? 'bg-custom-tertiary text-custom-primary'
                                        : 'text-custom-secondary hover:text-custom-primary hover-item border-transparent border'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-custom-primary' : 'text-custom-secondary'}`} />
                                    {t(item.id)}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Right Content Panel */}
                <div className="flex-1 bg-custom-primary p-6 md:p-10 overflow-y-auto custom-scrollbar">
                    
                    {showProfileEdit ? (
                        <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Back Header */}
                            <div className="flex items-center gap-3 mb-8">
                                <button 
                                    onClick={() => setShowProfileEdit(false)}
                                    className="p-2 -ml-2 text-custom-secondary hover:text-custom-primary hover:bg-custom-tertiary rounded-xl transition-colors"
                                >
                                    <FaChevronLeft className="w-4 h-4" />
                                </button>
                                <h2 className="text-xl font-semibold text-custom-primary">Edit Profile</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-custom-primary">Display Name</label>
                                    <input
                                        type="text"
                                        value={tempProfile.name}
                                        onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                                        placeholder="Enter your name"
                                        className="w-full bg-custom-tertiary border border-custom focus:border-custom-primary text-custom-primary placeholder-custom-secondary rounded-xl px-4 py-3 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-custom-primary">Profile Avatar</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full border border-custom overflow-hidden bg-custom-tertiary flex items-center justify-center shrink-0">
                                            {tempProfile.avatar ? (
                                                <img src={tempProfile.avatar} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-2xl font-semibold text-custom-secondary">
                                                    {tempProfile.name ? tempProfile.name.charAt(0).toUpperCase() : 'A'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                                id="avatar-upload"
                                            />
                                            <div className="flex items-center gap-2">
                                                <label 
                                                    htmlFor="avatar-upload"
                                                    className="px-4 py-2 bg-custom-tertiary hover:bg-custom-secondary border border-custom text-custom-primary text-sm font-medium rounded-xl cursor-pointer transition-colors"
                                                >
                                                    Upload Image
                                                </label>
                                                {tempProfile.avatar && (
                                                    <button 
                                                        onClick={() => setTempProfile({ ...tempProfile, avatar: '' })}
                                                        className="px-4 py-2 text-red-500 hover:bg-red-500/10 text-sm font-medium border border-transparent hover:border-red-500/30 rounded-xl transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <span className="text-xs text-custom-secondary">Max size: 2MB. Format: JPG, PNG, GIF</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-custom">
                                <button
                                    onClick={() => setShowProfileEdit(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-custom-secondary hover:text-custom-primary border border-custom hover:border-custom-primary hover:bg-custom-tertiary rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        updateSetting('profile', tempProfile);
                                        setShowProfileEdit(false);
                                    }}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : showCustomInstructions ? (
                        <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Back Header */}
                            <div className="flex items-center gap-3 mb-8">
                                <button 
                                    onClick={() => setShowCustomInstructions(false)}
                                    className="p-2 -ml-2 text-custom-secondary hover:text-custom-primary hover:bg-custom-tertiary rounded-xl transition-colors"
                                >
                                    <FaChevronLeft className="w-4 h-4" />
                                </button>
                                <h2 className="text-xl font-semibold text-custom-primary">Custom Instructions</h2>
                            </div>

                            <p className="text-sm text-custom-secondary mb-8">
                                What would you like Aether AI to know about you to provide better responses? How would you like Aether AI to respond?
                            </p>

                            <div className="space-y-6">
                                {/* About User Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-custom-primary">
                                        What would you like Aether AI to know about you?
                                    </label>
                                    <textarea
                                        value={tempInstructions.aboutUser}
                                        onChange={(e) => setTempInstructions({ ...tempInstructions, aboutUser: e.target.value })}
                                        placeholder="E.g., I'm a software developer based in New York. I mainly write Python and Javascript."
                                        className="w-full h-32 p-4 bg-custom-tertiary border border-custom focus:border-custom-primary text-custom-primary placeholder-custom-secondary rounded-xl resize-none outline-none custom-scrollbar text-sm transition-colors"
                                    />
                                </div>

                                {/* Respond How Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-custom-primary">
                                        How would you like Aether AI to respond?
                                    </label>
                                    <textarea
                                        value={tempInstructions.respondHow}
                                        onChange={(e) => setTempInstructions({ ...tempInstructions, respondHow: e.target.value })}
                                        placeholder="E.g., Keep responses short and concise. Never use emojis. Give me direct code snippets without explanations."
                                        className="w-full h-32 p-4 bg-custom-tertiary border border-custom focus:border-custom-primary text-custom-primary placeholder-custom-secondary rounded-xl resize-none outline-none custom-scrollbar text-sm transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-custom">
                                <button
                                    onClick={() => setShowCustomInstructions(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-custom-secondary hover:text-custom-primary border border-custom hover:border-custom-primary hover:bg-custom-tertiary rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        updateSetting('customInstructions', tempInstructions);
                                        setShowCustomInstructions(false);
                                    }}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                    <div className="max-w-2xl">

                        {/* Tab Content Header */}
                        <h2 className="text-xl font-semibold text-custom-primary mb-8">
                            {activeTab ? t(activeTab) : ''}
                        </h2>

                        {/* General Tab Content */}
                        {activeTab === 'general' && (
                            <div className="flex flex-col gap-0 border-t border-custom">

                                {/* Appearance */}
                                <div className="flex items-center justify-between py-5 border-b border-custom group relative">
                                    <span className="text-sm text-custom-primary font-medium tracking-wide">{t('appearance')}</span>
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === 'appearance' ? null : 'appearance')}
                                        className="flex items-center gap-2 text-sm text-custom-secondary hover:text-custom-primary transition-colors capitalize"
                                    >
                                        {t(settings.appearance.toLowerCase())}
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </button>
                                    <Dropdown isOpen={openDropdown === 'appearance'} onClose={() => setOpenDropdown(null)}>
                                        {OPTIONS.appearance.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { updateSetting('appearance', opt); setOpenDropdown(null); }}
                                                className="w-full flex items-center justify-between px-4 py-2 text-sm text-custom-primary hover-item rounded-md"
                                            >
                                                {t(opt.toLowerCase())}
                                                {settings.appearance === opt && <FaCheck className="w-3.5 h-3.5 text-custom-primary" />}
                                            </button>
                                        ))}
                                    </Dropdown>
                                </div>

                                {/* Accent Color */}
                                <div className="flex items-center justify-between py-5 border-b border-custom group relative">
                                    <span className="text-sm text-custom-primary font-medium tracking-wide">{t('accent_color')}</span>
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === 'accent' ? null : 'accent')}
                                        className="flex items-center gap-2.5 text-sm text-custom-secondary hover:text-custom-primary transition-colors"
                                    >
                                        <div className={`w-3 h-3 rounded-full ${OPTIONS.accentColor.find(c => c.value === settings.accentColor)?.colorClass || 'bg-zinc-400'}`}></div>
                                        {settings.accentColor}
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </button>
                                    <Dropdown isOpen={openDropdown === 'accent'} onClose={() => setOpenDropdown(null)}>
                                        {OPTIONS.accentColor.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => { updateSetting('accentColor', opt.value); setOpenDropdown(null); }}
                                                className="w-full flex items-center justify-between px-4 py-2 text-sm text-custom-primary hover-item rounded-md"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${opt.colorClass}`}></div>
                                                    {opt.label === 'Default' ? t('default') : opt.label}
                                                </div>
                                                {settings.accentColor === opt.value && <FaCheck className="w-3.5 h-3.5 text-custom-primary" />}
                                            </button>
                                        ))}
                                    </Dropdown>
                                </div>

                                {/* Design Style */}
                                <div className="flex items-center justify-between py-5 border-b border-custom group relative">
                                    <span className="text-sm text-custom-primary font-medium tracking-wide">{t('design_style')}</span>
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === 'design' ? null : 'design')}
                                        className="flex items-center gap-2 text-sm text-custom-secondary hover:text-custom-primary transition-colors"
                                    >
                                        {settings.designStyle === 'Default' ? t('default') : settings.designStyle}
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </button>
                                    <Dropdown isOpen={openDropdown === 'design'} onClose={() => setOpenDropdown(null)}>
                                        {OPTIONS.designStyle.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { updateSetting('designStyle', opt); setOpenDropdown(null); }}
                                                className="w-full flex items-center justify-between px-4 py-2 text-sm text-custom-primary hover-item rounded-md"
                                            >
                                                {opt === 'Default' ? t('default') : opt}
                                                {settings.designStyle === opt && <FaCheck className="w-3.5 h-3.5 text-custom-primary" />}
                                            </button>
                                        ))}
                                    </Dropdown>
                                </div>

                                {/* Language */}
                                <div className="flex items-center justify-between py-5 border-b border-custom group relative">
                                    <span className="text-sm text-custom-primary font-medium tracking-wide">{t('language')}</span>
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === 'language' ? null : 'language')}
                                        className="flex items-center gap-2 text-sm text-custom-secondary hover:text-custom-primary transition-colors"
                                    >
                                        {settings.language}
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </button>
                                    <Dropdown isOpen={openDropdown === 'language'} onClose={() => setOpenDropdown(null)} direction="up">
                                        {OPTIONS.language.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => { updateSetting('language', opt.value); setOpenDropdown(null); }}
                                                className="w-full flex items-center justify-between px-4 py-2 text-sm text-custom-primary hover-item rounded-md"
                                            >
                                                {opt.label}
                                                {settings.language === opt.value && <FaCheck className="w-3.5 h-3.5 text-custom-primary" />}
                                            </button>
                                        ))}
                                    </Dropdown>
                                </div>

                            </div>
                        )}

                        {/* Data Controls Tab Content */}
                        {activeTab === 'data_controls' && (
                            <div className="flex flex-col gap-0 border-t border-custom">

                                {/* Delete all chats */}
                                <div className="flex items-center justify-between py-5 border-b border-custom">
                                    <span className="text-sm text-custom-primary font-medium tracking-wide">{t('delete_all_chats') || 'Delete all chats'}</span>
                                    <button
                                        onClick={() => setShowConfirmDelete(true)}
                                        className="px-4 py-2 border border-red-500/50 hover:bg-red-500/10 text-red-500 text-sm font-medium rounded-xl transition-colors"
                                    >
                                        {t('delete_all') || 'Delete all'}
                                    </button>
                                </div>

                                {/* Export data */}
                                <div className="flex items-center justify-between py-5 border-b border-custom">
                                    <span className="text-sm text-custom-primary font-medium tracking-wide">{t('export_data') || 'Export data'}</span>
                                    <button
                                        onClick={onExportAllData}
                                        className="px-4 py-2 border border-custom hover:bg-custom-tertiary text-custom-primary text-sm font-medium rounded-xl transition-colors"
                                    >
                                        {t('export') || 'Export'}
                                    </button>
                                </div>

                            </div>
                        )}

                        {/* Placeholder for other tabs */}
                        {/* Account Tab Content */}
                        {activeTab === 'account' && (
                            <div className="flex flex-col gap-0 border-t border-custom pt-6 px-2">
                                {/* Premium Profile Info Card */}
                                <div className="relative overflow-hidden rounded-2xl border border-custom bg-custom-tertiary/20 p-3.5 sm:p-6 mb-8 transition-all hover:bg-custom-tertiary/40 group">
                                    {/* Abstract glow */}
                                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-[#2B0128]/30 blur-3xl pointer-events-none transition-all duration-500 group-hover:scale-125 group-hover:bg-[#6D0122]/30"></div>
                                    
                                    <div className="relative flex items-center gap-3 sm:gap-6">
                                        {/* Avatar with subtle glowing gradient ring */}
                                        <div className="relative shrink-0">
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#2B0128]/80 to-[#6D0122]/80 blur-[6px] scale-110 transition-all duration-300 group-hover:scale-[1.20] opacity-70 group-hover:opacity-100"></div>
                                            {settings?.profile?.avatar ? (
                                                <img src={settings.profile.avatar} alt="Avatar" className="relative w-12 h-12 sm:w-20 sm:h-20 shrink-0 rounded-full border border-custom object-cover shadow-lg" />
                                            ) : (
                                                <div className="relative w-12 h-12 sm:w-20 sm:h-20 shrink-0 rounded-full bg-custom-primary text-[#AB0120] flex items-center justify-center text-2xl sm:text-4xl font-semibold border-2 border-custom shadow-lg">
                                                    {settings?.profile?.name ? settings.profile.name.charAt(0).toUpperCase() : 'H'}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* User Details */}
                                        <div className="flex flex-col flex-1 min-w-0 pr-1 sm:pr-2">
                                            <span className="text-lg sm:text-2xl font-bold text-custom-primary truncate tracking-tight transition-colors duration-300 group-hover:text-[#AB0120]">
                                                {settings?.profile?.name || 'Hammad'}
                                            </span>
                                            <span className="text-[13px] sm:text-[15px] font-medium text-custom-secondary truncate mt-0.5 sm:mt-1">
                                                {settings?.profile?.email || 'ha***@gmail.com'}
                                            </span>
                                        </div>
                                        
                                        {/* Edit Action */}
                                        <button 
                                            onClick={() => {
                                                setTempProfile(settings?.profile || { name: 'Hammad', avatar: '' });
                                                setShowProfileEdit(true);
                                            }}
                                            className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 bg-custom-primary border border-custom hover:border-custom-primary hover:text-[#AB0120] text-custom-primary text-xs sm:text-sm font-semibold rounded-full shadow-sm transition-all hover:shadow-md active:scale-95"
                                        >
                                            <FaPen className="w-3 h-3 hidden sm:inline-block" />
                                            <span className="hidden sm:inline">Edit Profile</span>
                                            <span className="inline sm:hidden">Edit</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Account Feature: Custom Instructions */}
                                <div className="flex items-center justify-between py-5 border-b border-custom">
                                    <div className="flex flex-col pr-4">
                                        <span className="text-sm font-medium text-custom-primary">Custom Instructions</span>
                                        <span className="text-[13px] text-custom-secondary mt-0.5">Tell the AI how to uniquely respond to you</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setTempInstructions(settings.customInstructions || { aboutUser: '', respondHow: '' });
                                            setShowCustomInstructions(true);
                                        }}
                                        className="shrink-0 px-3 py-1.5 border border-custom hover:border-custom-primary hover:bg-black/5 dark:hover:bg-white/10 text-custom-primary text-xs font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-95"
                                    >
                                        Configure
                                    </button>
                                </div>

                                {/* Personal API Key */}
                                <div className="flex flex-col py-5 border-b border-custom space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-custom-primary">OpenRouter API Key</span>
                                            <span className="text-[13px] text-custom-secondary mt-0.5">Use your own key to bypass application rate limits</span>
                                        </div>
                                        <a 
                                            href="https://openrouter.ai/settings/keys" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 border border-custom hover:border-custom-primary hover:bg-black/5 dark:hover:bg-white/10 text-custom-primary text-xs font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                                        >
                                            Get Key
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="password"
                                            value={settings?.personalApiKey || ''}
                                            onChange={(e) => updateSetting('personalApiKey', e.target.value)}
                                            placeholder="sk-or-v1-..."
                                            className="flex-1 bg-custom-tertiary border border-custom focus:border-custom-primary text-custom-primary placeholder-custom-secondary rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                        />
                                        {settings?.personalApiKey && (
                                            <button 
                                                onClick={() => updateSetting('personalApiKey', '')}
                                                className="px-4 py-2.5 text-sm font-medium text-custom-secondary hover:text-red-500 border border-custom hover:border-red-500/30 hover:bg-red-500/10 rounded-xl transition-colors"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div className="flex items-center justify-between py-5 border-b border-custom">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-custom-primary">Notifications</span>
                                        <span className="text-[13px] text-custom-secondary mt-0.5">Get notified when background tasks complete</span>
                                    </div>
                                    <button 
                                        onClick={() => updateSetting('desktopNotifications', !settings?.desktopNotifications)}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none transition-colors duration-200 ease-in-out ${settings?.desktopNotifications ? 'bg-blue-500' : 'bg-custom-tertiary border border-custom'}`}
                                        role="switch"
                                        aria-checked={settings?.desktopNotifications}
                                    >
                                        <span className="sr-only">Toggle notifications</span>
                                        <span aria-hidden="true" className={`pointer-events-none absolute left-0 inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-translate duration-200 py-0.5 ${settings?.desktopNotifications ? 'translate-x-4' : 'translate-x-0'}`}></span>
                                    </button>
                                </div>

                                {/* Sign Out */}
                                <div className="flex items-center justify-between py-5 border-b border-custom">
                                    <span className="text-sm text-custom-primary font-medium tracking-wide">Sign out of your account</span>
                                    <button
                                        onClick={() => setShowSignOutConfirm(true)}
                                        className="px-4 py-2 border border-custom hover:border-custom-primary hover:bg-black/5 dark:hover:bg-white/10 text-custom-primary text-sm font-medium rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
                                    >
                                        Sign out
                                    </button>
                                </div>

                                {/* Danger Zone */}
                                <div className="flex items-center justify-between py-5 border-b border-custom mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-red-500 block">Danger Zone</span>
                                        <span className="text-[13px] text-custom-secondary mt-0.5">Irreversibly wipe all data</span>
                                    </div>
                                    <button
                                        onClick={() => setShowDangerConfirm(true)}
                                        className="px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-500 text-sm font-medium rounded-xl transition-colors"
                                    >
                                        Delete Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Placeholder for other tabs */}
                        {activeTab !== 'general' && activeTab !== 'data_controls' && activeTab !== 'account' && (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-custom-secondary flex items-center justify-center mb-4 border border-custom">
                                    <FaCog className="w-6 h-6 text-custom-secondary" />
                                </div>
                                <h3 className="text-lg font-medium text-custom-primary mb-2">{t('settings_coming_soon')}</h3>
                                <p className="text-sm text-custom-secondary max-w-xs">
                                    {t('settings_not_available', { tab: t(activeTab).toLowerCase() })}
                                </p>
                            </div>
                        )}

                    </div>
                    )}
                </div>
            </div>

            {/* Sign Out Confirm Modal */}
            {showSignOutConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowSignOutConfirm(false)}></div>
                    <div className="relative w-full max-w-xs sm:max-w-sm bg-custom-primary border border-custom rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-semibold text-custom-primary mb-4">Are you sure you<br/>want to log out?</h3>
                        <p className="text-sm text-custom-secondary mb-8">
                            Log out of Aether AI as<br/>
                            <span className="text-custom-primary font-medium mt-1 block">{settings?.profile?.name || 'Hammad'}</span>
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('aetherai_isAuthenticated');
                                    window.location.reload();
                                }}
                                className="w-full py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm block"
                            >
                                Log out
                            </button>
                            <button
                                onClick={() => setShowSignOutConfirm(false)}
                                className="w-full py-3 border border-custom hover:bg-custom-tertiary text-sm font-medium text-custom-primary rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Danger Zone Profile Wipe Confirm Modal */}
            {showDangerConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowDangerConfirm(false)}></div>
                    <div className="relative w-full max-w-sm bg-custom-primary border border-custom rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-semibold text-red-500 mb-2">Delete Profile Data?</h3>
                        <p className="text-sm text-custom-secondary mb-6">This will irreversibly erase your profile, API keys, custom instructions, analytics, and sign you out.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDangerConfirm(false)}
                                className="px-4 py-2 border border-custom text-sm font-medium text-custom-secondary hover:text-custom-primary hover:bg-custom-tertiary rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('aetherai_settings');
                                    localStorage.removeItem('aetherai_chatHistory');
                                    localStorage.removeItem('aetherai_currentChatId');
                                    window.location.reload();
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
                            >
                                Delete Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirm Delete Modal */}
            {showConfirmDelete && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowConfirmDelete(false)}></div>
                    <div className="relative w-full max-w-sm bg-custom-primary border border-custom rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-semibold text-custom-primary mb-2">{t('delete_all_chats') || 'Delete all chats'}?</h3>
                        <p className="text-sm text-custom-secondary mb-6">Are you sure you want to delete all chats? This cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="px-4 py-2 border border-custom text-sm font-medium text-custom-secondary hover:text-custom-primary hover:bg-custom-tertiary rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onDeleteAllChats();
                                    setShowConfirmDelete(false);
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
                            >
                                {t('delete_all') || 'Delete all'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(SettingsModal);
