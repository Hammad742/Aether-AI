import { FaPlus, FaRegFolder, FaSearch, FaRegCommentDots, FaCog, FaTrash, FaDownload, FaPen, FaImage } from 'react-icons/fa';
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarRightCollapse } from 'react-icons/tb';
import { useState, useRef, memo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useSettings } from '../context/SettingsContext';

const Sidebar = ({ isOpen, toggleSidebar, onNewChat, chatHistory = [], onDeleteChat, currentChatId, onSelectChat, onOpenSettings, onGenerateImage }) => {
    const { t } = useTranslation();
    const { settings } = useSettings();
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const searchInputRef = useRef(null);
    const touchStartX = useRef(null);

    // Mobile Swipe Gesture Handlers
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;

        // If swiped left by at least 50px, close sidebar
        if (diff > 50 && isOpen) {
            toggleSidebar();
        }
        touchStartX.current = null;
    };

    // Handle exporting chat to txt file
    const handleExportChat = (e, chat) => {
        e.stopPropagation();
        if (!chat.messages || chat.messages.length === 0) return;

        const content = chat.messages.map(m => `${m.role === 'user' ? 'You' : 'Assistant'}:\n${m.content}\n`).join('\n----------------------------------------\n\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(chat.title || 'chat').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Filter history based on search query
    const filteredHistory = chatHistory.filter(chat =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`fixed md:relative z-50 flex flex-col h-full bg-custom-secondary border-r border-custom rounded-r-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0 md:w-[56px]'
                    }`}
            >
                {/* 1) Mini Sidebar (Visible when closed on Desktop) */}
                <div className={`absolute inset-0 flex flex-col items-center pt-4 pb-2 transition-opacity duration-300 ${!isOpen ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    {/* Top toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="p-2.5 text-custom-secondary hover:text-custom-primary hover:bg-custom-tertiary rounded-xl transition-all duration-200 hover:scale-110 mb-4"
                        title="Expand Sidebar"
                    >
                        <TbLayoutSidebarRightCollapse className="w-5 h-5" />
                    </button>

                    {/* New chat */}
                    <button
                        onClick={() => { if (onNewChat) onNewChat(); }}
                        className="p-2.5 text-custom-secondary hover:text-custom-primary hover:bg-custom-tertiary rounded-xl transition-all duration-200 hover:scale-110 mb-2"
                        title="New Chat"
                    >
                        <FaPen className="w-4 h-4" />
                    </button>

                    {/* Search */}
                    <button
                        onClick={() => {
                            toggleSidebar();
                            setTimeout(() => {
                                searchInputRef.current?.focus();
                            }, 300);
                        }}
                        className="p-2.5 text-custom-secondary hover:text-custom-primary hover:bg-custom-tertiary rounded-xl transition-all duration-200 hover:scale-110 mb-2"
                        title="Search Chats"
                    >
                        <FaSearch className="w-4 h-4" />
                    </button>

                    {/* Generate Image shortcut (only visible when in an active chat) */}
                    {currentChatId && (
                        <button
                            onClick={() => onGenerateImage(t('generate_image_prompt') || 'Generate Image of ', { isImage: true })}
                            className="group relative flex items-center justify-center p-2.5 bg-custom-secondary/50 hover:bg-custom-tertiary border border-custom hover:border-blue-500/30 rounded-xl text-custom-secondary transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-blue-500/10 backdrop-blur-md overflow-hidden mb-2"
                            title={t('generate_image')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300">
                                <FaImage className="w-4 h-4" />
                            </div>
                        </button>
                    )}

                    {/* Bottom settings */}
                    <div className="mt-auto mb-0 mx-auto w-[42px] py-1.5 flex flex-col items-center justify-center gap-1.5 bg-custom-tertiary/40 hover:bg-custom-tertiary/90 border border-custom/50 hover:border-custom/80 rounded-full backdrop-blur-md shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                        <button
                            onClick={onOpenSettings}
                            className="relative w-[30px] h-[30px] shrink-0 group hover:scale-110 transition-transform duration-300"
                            title="Account Settings"
                        >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#2B0128]/80 to-[#6D0122]/80 blur-[6px] scale-100 transition-all duration-300 group-hover:scale-[1.4] opacity-0 group-hover:opacity-100"></div>
                            
                            <div className="relative w-full h-full rounded-full border border-custom/50 overflow-hidden bg-custom-tertiary flex items-center justify-center shadow-sm z-10 transition-colors duration-300 group-hover:border-[#6D0122]/50">
                                {settings?.profile?.avatar ? (
                                    <img src={settings.profile.avatar} alt="Profile" className="relative w-full h-full object-cover z-20" />
                                ) : (
                                    <span className="relative text-xs font-semibold text-custom-secondary group-hover:text-white transition-colors z-20">
                                        {settings?.profile?.name ? settings.profile.name.charAt(0).toUpperCase() : 'A'}
                                    </span>
                                )}
                            </div>
                        </button>
                        <button
                            onClick={onOpenSettings}
                            className="p-1.5 text-custom-secondary hover:text-custom-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 hover:shadow-sm"
                            title="Settings"
                        >
                            <FaCog className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* 2) Full Sidebar Content (Visible when open) */}
                <div className={`flex flex-col h-full w-64 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} whitespace-nowrap overflow-hidden`}>
                    {/* Top Actions */}
                    <div className="flex items-center gap-2 p-4 pb-2">
                        <button
                            onClick={() => {
                                if (onNewChat) onNewChat();
                                if (window.innerWidth < 768) toggleSidebar(); // auto close on mobile
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-custom-accent text-custom-accent-inverse text-sm font-medium rounded-xl transition-all hover:opacity-90 shadow-sm"
                        >
                            <FaPlus className="w-3 h-3" />
                            {t('new_chat')}
                        </button>
                        <button
                            onClick={toggleSidebar}
                            className="p-2.5 bg-custom-tertiary hover:bg-custom-tertiary text-custom-secondary hover:text-custom-primary rounded-xl transition-colors border border-transparent"
                            title="Collapse Sidebar"
                        >
                            <TbLayoutSidebarLeftCollapse className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="px-4 py-2">
                        <div className="relative flex items-center">
                            <FaSearch className="absolute left-3 w-3 h-3 text-custom-secondary" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder={t('search_chats')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-custom-secondary border border-custom text-custom-primary text-xs rounded-lg pl-8 pr-3 py-2 outline-none focus:border-custom transition-colors"
                            />
                        </div>
                    </div>

                    {/* History Section (Scrollable) */}
                    <div className="flex-1 min-h-0 overflow-y-auto px-2 mt-2 custom-scrollbar">
                        {filteredHistory.length > 0 && (
                            <div className="px-2 py-2">
                                <span className="text-[10px] font-semibold text-custom-secondary tracking-wider">{t('history')}</span>
                            </div>
                        )}

                        <div className="flex flex-col gap-0.5">
                            {filteredHistory.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onSelectChat(item.id)}
                                    className={`group relative flex items-center w-full px-2 py-2.5 rounded-lg text-sm transition-all duration-300 ease-out hover:translate-x-1 ${currentChatId === item.id ? 'bg-custom-tertiary text-custom-accent font-medium shadow-sm border border-custom' : 'text-custom-secondary border border-transparent hover:bg-black/5 dark:hover:bg-white/10 hover:border-custom hover:shadow-sm hover:text-custom-primary'}`}
                                >
                                    <FaRegCommentDots className={`w-3.5 h-3.5 mr-3 shrink-0 ${currentChatId === item.id ? 'text-custom-accent' : 'text-custom-secondary'}`} />
                                    <span className="truncate flex-1 text-left text-xs mr-2">{item.title}</span>

                                    {deletingId === item.id ? (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div
                                                onClick={(e) => { e.stopPropagation(); onDeleteChat(item.id); setDeletingId(null); }}
                                                className="text-red-500 hover:text-red-400 text-xs font-medium cursor-pointer transition-colors"
                                            >
                                                Delete
                                            </div>
                                            <div
                                                onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                                                className="text-custom-secondary hover:text-custom-primary text-xs cursor-pointer transition-colors"
                                            >
                                                Cancel
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="hidden group-hover:flex items-center gap-1.5 shrink-0">
                                            <div
                                                onClick={(e) => handleExportChat(e, item)}
                                                className="p-1.5 bg-custom-tertiary border border-custom hover:bg-custom-secondary rounded cursor-pointer text-custom-primary transition-colors"
                                                title="Export Chat"
                                            >
                                                <FaDownload className="w-3 h-3" />
                                            </div>
                                            <div
                                                onClick={(e) => { e.stopPropagation(); setDeletingId(item.id); }}
                                                className="p-1.5 hover:bg-custom-tertiary rounded cursor-pointer text-custom-secondary hover:text-red-400 transition-colors"
                                                title="Delete Chat"
                                            >
                                                <FaTrash className="w-3 h-3" />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="p-3 mb-1.5 flex mt-auto">
                        <button
                            onClick={onOpenSettings}
                            className="flex items-center w-full gap-3 p-2 text-custom-primary bg-custom-tertiary/40 hover:bg-custom-tertiary/80 border border-custom/50 shadow-sm rounded-2xl transition-all duration-300 group backdrop-blur-md"
                        >
                            <div className="w-8 h-8 rounded-full border border-custom overflow-hidden bg-custom-primary flex items-center justify-center shrink-0">
                                {settings?.profile?.avatar ? (
                                    <img src={settings.profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-semibold text-custom-secondary">
                                        {settings?.profile?.name ? settings.profile.name.charAt(0).toUpperCase() : 'A'}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col flex-1 text-left overflow-hidden">
                                <span className="text-sm font-medium truncate">{settings?.profile?.name || 'Account'}</span>
                                <span className="text-[11px] text-custom-secondary group-hover:text-custom-primary truncate transition-colors">{t('settings')}</span>
                            </div>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default memo(Sidebar);
