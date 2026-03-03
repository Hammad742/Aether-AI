import React, { useState, useMemo } from 'react';
import { FaPlus, FaComments, FaTrash, FaFolderPlus, FaFolder, FaFolderOpen, FaCheck, FaTimes, FaCog, FaChevronLeft, FaSearch, FaDownload, FaImage, FaMicrophone, FaBrain, FaFileAlt } from 'react-icons/fa';
import { exportToJSON as exportChat } from '../utils/exportUtils';
import { useLanguage } from '../contexts/LanguageContext';

const Sidebar = ({
    sessions,
    folders = [],
    currentSessionId,
    onNewChat,
    onSelectSession,
    onDeleteSession,
    onCreateFolder,
    onDeleteFolder,
    onToggleFolder,
    onMoveSession,
    isOpen,
    toggleSidebar,
    searchInputRef,
    onOpenSettings,
    onOpenGallery,
    onOpenVoice,
    attachedFiles = [],
    onRemoveFile,
}) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingSessionId, setDeletingSessionId] = useState(null);
    const [deletingFolderId, setDeletingFolderId] = useState(null);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const filteredSessions = useMemo(() => {
        return sessions.filter(session =>
            (session.title || t('app.newChat')).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sessions, searchTerm, t]);

    const handleCreateFolder = () => {
        if (newFolderName.trim()) {
            onCreateFolder(newFolderName.trim());
            setNewFolderName('');
            setIsCreatingFolder(false);
        }
    };

    const renderSession = (session) => {
        const isCurrent = currentSessionId === session.id;
        const baseClasses = "group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200";
        const stateClasses = isCurrent
            ? "bg-accent/10 text-accent font-medium shadow-sm"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200";

        const iconClasses = `w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-accent' : 'text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-500'}`;

        return (
            <div
                key={session.id}
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.setData('sessionId', session.id);
                    e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => onSelectSession(session.id)}
                className={`${baseClasses} ${stateClasses}`}
            >
                <FaComments className={iconClasses} />

                <div className="flex-1 min-w-0 pr-14">
                    <p className="text-sm truncate w-full">
                        {session.title || t('app.newChat')}
                    </p>
                </div>

                {/* Action Buttons */}
                {deletingSessionId === session.id ? (
                    <div className="absolute right-2 flex items-center gap-1 bg-white dark:bg-zinc-900 shadow-lg rounded-md p-0.5 border border-zinc-200 dark:border-zinc-700 animate-in fade-in zoom-in duration-200 z-10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                                setDeletingSessionId(null);
                            }}
                            className="p-1 px-2 hover:bg-red-500/20 text-red-500 dark:text-red-400 rounded transition-colors text-xs font-medium"
                        >
                            {t('app.delete')}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeletingSessionId(null);
                            }}
                            className="p-1 px-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded transition-colors text-xs"
                        >
                            {t('app.cancel')}
                        </button>
                    </div>
                ) : (
                    <div className={`absolute right-2 flex items-center gap-1 transition-opacity duration-200 ${currentSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                exportChat(session);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 rounded-md transition-colors"
                            title={t('app.exportChat')}
                        >
                            <FaDownload className="w-3 h-3" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeletingSessionId(session.id);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 rounded-md transition-colors"
                            title={t('app.deleteChat')}
                        >
                            <FaTrash className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-2xl border-r border-zinc-200 dark:border-zinc-800/50 transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 md:ml-0' : '-translate-x-full md:-ml-72'} md:relative flex flex-col h-full`}>
                <div className="flex flex-col h-full p-4 overflow-hidden">
                    {/* Header: New Chat & Toggle */}
                    <div className="flex items-center gap-2 mb-2">
                        <button
                            onClick={() => onNewChat()}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 border border-zinc-300/50 dark:border-zinc-700/50 text-zinc-800 dark:text-zinc-200 transition-all transition-colors font-medium text-sm shadow-sm"
                            title={t('app.newChat')}
                        >
                            <FaPlus className="w-3.5 h-3.5 text-zinc-500" /> {t('app.newChat')}
                        </button>

                        <button
                            onClick={() => setIsCreatingFolder(true)}
                            className="p-3 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 border border-zinc-300/50 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors shadow-sm"
                            title={t('app.newFolder')}
                        >
                            <FaFolderPlus className="w-4 h-4" />
                        </button>

                        <button
                            onClick={toggleSidebar}
                            className="p-3 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 border border-zinc-300/50 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            title={t('app.closeSidebar')}
                        >
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4 relative group shrink-0">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors w-3.5 h-3.5" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('app.searchChats')}
                            className="w-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-300/50 dark:border-zinc-700/50 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-zinc-800/50 transition-all"
                        />
                    </div>

                    {/* History List */}
                    <div className="flex-1 overflow-y-auto -mx-2 px-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent flex flex-col gap-6 pb-4"
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                        onDrop={(e) => {
                            e.preventDefault();
                            const id = e.dataTransfer.getData('sessionId');
                            if (id) onMoveSession(id, null);
                        }}
                    >
                        {/* Shared Workspace (Brain) */}
                        {attachedFiles.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <h3 className="text-xs font-bold text-blue-500/80 dark:text-blue-400/80 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                                    <FaBrain className="w-3.5 h-3.5" />
                                    {t('brain.title') || 'Brain Workspace'}
                                    <span className="ml-auto bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded text-[10px] tabular-nums">{attachedFiles.length}</span>
                                </h3>
                                <div className="space-y-1 px-1">
                                    {attachedFiles.map(file => (
                                        <div key={file.id} className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-700/30 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-all duration-300">
                                            <FaFileAlt className="w-4 h-4 text-blue-500/70" />
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate flex-1">{file.name}</span>
                                            <button
                                                onClick={() => onRemoveFile(file.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                                                title="Remove from Workspace"
                                            >
                                                <FaTimes className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="h-[1px] bg-zinc-200/50 dark:bg-zinc-800/50 my-6 mx-2" />
                            </div>
                        )}

                        <div>
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">{t('app.history')}</h3>

                            <div className="space-y-1">
                                {isCreatingFolder && (
                                    <div className="flex items-center gap-2 px-2 py-2 mb-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
                                        <FaFolder className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                        <input
                                            autoFocus
                                            value={newFolderName}
                                            onChange={e => setNewFolderName(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleCreateFolder();
                                                if (e.key === 'Escape') setIsCreatingFolder(false);
                                            }}
                                            placeholder={t('app.folderName')}
                                            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-800 dark:text-zinc-200 min-w-0"
                                        />
                                        <button onClick={handleCreateFolder} className="text-green-500 hover:text-green-600"><FaCheck className="w-3 h-3" /></button>
                                        <button onClick={() => setIsCreatingFolder(false)} className="text-zinc-400 hover:text-zinc-500"><FaTimes className="w-3 h-3" /></button>
                                    </div>
                                )}

                                {filteredSessions.length === 0 && !isCreatingFolder && folders.length === 0 ? (
                                    <div className="text-center py-8 px-4">
                                        <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-3">
                                            <FaComments className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
                                        </div>
                                        <p className="text-zinc-500 text-sm">
                                            {searchTerm ? t('app.noMatchingChats') : t('app.noHistoryYet')}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {searchTerm ? (
                                            /* Flat list when searching */
                                            filteredSessions.map(renderSession)
                                        ) : (
                                            /* Folders and Root sessions */
                                            <>
                                                {folders.map(folder => (
                                                    <div key={folder.id} className="mb-1">
                                                        <div
                                                            onClick={() => onToggleFolder(folder.id)}
                                                            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                                                            onDrop={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                const id = e.dataTransfer.getData('sessionId');
                                                                if (id) onMoveSession(id, folder.id);
                                                            }}
                                                            className="group flex items-center gap-2 px-2 py-2 text-sm text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors"
                                                        >
                                                            {folder.isExpanded ? <FaFolderOpen className="text-accent-light/80 w-4 h-4" /> : <FaFolder className="text-accent-light/80 w-4 h-4" />}
                                                            <span className="flex-1 truncate select-none">{folder.name}</span>

                                                            {deletingFolderId === folder.id ? (
                                                                <div className="flex gap-1 items-center z-10">
                                                                    <button onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); setDeletingFolderId(null); }} className="text-xs text-red-500 px-1 font-medium hover:bg-red-500/10 rounded">{t('app.delete')}</button>
                                                                    <button onClick={(e) => { e.stopPropagation(); setDeletingFolderId(null); }} className="text-xs text-zinc-500 px-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded">{t('app.cancel')}</button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setDeletingFolderId(folder.id); }}
                                                                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 p-1 transition-opacity"
                                                                >
                                                                    <FaTrash className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        {folder.isExpanded && (
                                                            <div className="pl-4 space-y-1 mt-1 border-l border-zinc-200/50 dark:border-zinc-800/50 ml-4">
                                                                {sessions.filter(s => s.folderId === folder.id).map(renderSession)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Root sessions */}
                                                <div className="pt-2 border-t border-zinc-200/20 dark:border-zinc-800/20 mt-2">
                                                    {sessions.filter(s => !s.folderId).map(renderSession)}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 shrink-0 space-y-1">
                        <button
                            onClick={onOpenGallery}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors group"
                        >
                            <FaImage className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm">{t('gallery.title') || 'Image Gallery'}</span>
                        </button>

                        <button
                            onClick={onOpenVoice}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors group"
                        >
                            <FaMicrophone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm">{t('voice.title') || 'Voice Interaction'}</span>
                        </button>

                        <button
                            onClick={onOpenSettings}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors group"
                        >
                            <FaCog className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                            <span className="font-medium text-sm">{t('app.settings')}</span>
                        </button>
                    </div>
                </div>
            </aside >
        </>
    );
};

export default Sidebar;
