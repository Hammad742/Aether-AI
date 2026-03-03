/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'hammad_ai_chat_history';
const STORAGE_KEY_FOLDERS = 'hammad_ai_chat_folders';

export const useChatHistory = () => {
    const [sessions, setSessions] = useState([]);
    const [folders, setFolders] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    // Load history and folders from local storage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem(STORAGE_KEY);
        const savedFolders = localStorage.getItem(STORAGE_KEY_FOLDERS);

        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                setSessions(parsed);
                if (parsed.length > 0) {
                    setCurrentSessionId(parsed[0].id);
                }
            } catch (e) {
                console.error('Failed to parse chat history', e);
            }
        }

        if (savedFolders) {
            try {
                setFolders(JSON.parse(savedFolders));
            } catch (e) {
                console.error('Failed to parse chat folders', e);
            }
        }
    }, []);

    // Save history whenever sessions change
    useEffect(() => {
        if (sessions.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        } else if (sessions.length === 0) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [sessions]);

    // Save folders whenever they change
    useEffect(() => {
        if (folders.length > 0) {
            localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
        } else if (folders.length === 0) {
            localStorage.removeItem(STORAGE_KEY_FOLDERS);
        }
    }, [folders]);

    const createNewChat = (folderId = null) => {
        const newSession = {
            id: Date.now().toString(),
            title: 'New Chat',
            date: new Date().toISOString(),
            messages: [],
            folderId: folderId
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        return newSession.id;
    };

    const saveMessageToCurrentSession = (updatedMessages, sessionIdOverride = null) => {
        const targetId = sessionIdOverride || currentSessionId;
        if (!targetId) {
            createNewChat(null);
            return;
        }

        setSessions(prev => prev.map(session => {
            if (session.id === targetId) {
                // Generate a title based on the first user message if it's currently a default one
                let title = session.title;
                const isDefaultTitle = !title || title === 'New Chat' || title === 'Untitled Chat';

                if (isDefaultTitle) {
                    const messagesForTitle = Array.isArray(updatedMessages) ? updatedMessages : [updatedMessages];
                    const firstUserMsg = messagesForTitle.find(m => m.role === 'user');

                    if (firstUserMsg) {
                        const content = typeof firstUserMsg.content === 'string'
                            ? firstUserMsg.content
                            : (Array.isArray(firstUserMsg.content) ? 'Multimedia Prompt' : '');

                        if (content) {
                            title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
                        }
                    }
                }

                return {
                    ...session,
                    messages: Array.isArray(updatedMessages) ? updatedMessages : [...session.messages, updatedMessages],
                    date: new Date().toISOString(), // Update timestamp
                    title: title
                };
            }
            return session;
        }));
    };

    const deleteChat = (id) => {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (id === currentSessionId) {
            setCurrentSessionId(null); // Or select next available?
        }
    };



    // --- Folder Operations ---
    const createFolder = (name) => {
        const newFolder = {
            id: 'folder_' + Date.now().toString(),
            name: name,
            isExpanded: true,
            createdAt: new Date().toISOString()
        };
        setFolders(prev => [...prev, newFolder]);
        return newFolder.id;
    };

    const deleteFolder = (id) => {
        setFolders(prev => prev.filter(f => f.id !== id));
        // Move all sessions inside to root
        setSessions(prev => prev.map(s => s.folderId === id ? { ...s, folderId: null } : s));
    };

    const toggleFolderExpand = (id) => {
        setFolders(prev => prev.map(f =>
            f.id === id ? { ...f, isExpanded: !f.isExpanded } : f
        ));
    };

    const moveSessionToFolder = (sessionId, folderId) => {
        setSessions(prev => prev.map(s =>
            s.id === sessionId ? { ...s, folderId: folderId } : s
        ));
    };

    const archiveAllChats = () => {
        setSessions(prev => prev.map(s => ({ ...s, isArchived: true })));
    };

    const deleteAllSessions = () => {
        setSessions([]);
        if (currentSessionId) setCurrentSessionId(null);
    };

    const toggleArchiveChat = (id) => {
        setSessions(prev => prev.map(s =>
            s.id === id ? { ...s, isArchived: !s.isArchived } : s
        ));
    };

    const exportData = () => {
        const data = {
            sessions,
            folders,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hammad_ai_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // key helper to get current messages
    const currentMessages = sessions.find(s => s.id === currentSessionId)?.messages || [];

    return {
        sessions,
        folders,
        currentSessionId,
        setCurrentSessionId,
        createNewChat,
        saveMessageToCurrentSession,
        deleteChat,
        archiveAllChats,
        deleteAllSessions,
        toggleArchiveChat,
        exportData,
        currentMessages,
        createFolder,
        deleteFolder,
        toggleFolderExpand,
        moveSessionToFolder
    };
};
