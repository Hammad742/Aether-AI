/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const PromptLibraryModal = ({ isOpen, onClose, onSelect }) => {
    const [prompts, setPrompts] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('prompt-library');
            if (saved) {
                try {
                    setPrompts(JSON.parse(saved));
                } catch {
                    setPrompts([]);
                }
            } else {
                // Default prompts
                const defaults = [
                    { id: '1', title: 'Summarize', content: 'Please provide a concise summary of the following text, highlighting the main points.' },
                    { id: '2', title: 'Translate to Spanish', content: 'Translate the following text into natural-sounding Spanish.' },
                    { id: '3', title: 'Fix Grammar', content: 'Please review the following text and fix any grammatical errors, improving the flow and clarity.' }
                ];
                setPrompts(defaults);
                localStorage.setItem('prompt-library', JSON.stringify(defaults));
            }
            setIsAdding(false);
            setNewTitle('');
            setNewContent('');
        }
    }, [isOpen]);

    const savePrompts = (newPrompts) => {
        setPrompts(newPrompts);
        localStorage.setItem('prompt-library', JSON.stringify(newPrompts));
    };

    const handleAdd = () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        const newPrompt = {
            id: Date.now().toString(),
            title: newTitle.trim(),
            content: newContent.trim()
        };
        savePrompts([...prompts, newPrompt]);
        setIsAdding(false);
        setNewTitle('');
        setNewContent('');
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        savePrompts(prompts.filter((p) => p.id !== id));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Prompt Library</h2>
                    <button onClick={onClose} className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 overflow-y-auto">
                    {isAdding ? (
                        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
                            <input
                                type="text"
                                placeholder="Template Title (e.g. Code Review)"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 mb-3 focus:outline-none focus:border-accent"
                            />
                            <textarea
                                placeholder="Template Content..."
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                className="w-full h-32 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 resize-none focus:outline-none focus:border-accent"
                            />
                            <div className="flex justify-end gap-2 mt-3">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    disabled={!newTitle.trim() || !newContent.trim()}
                                    className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                                >
                                    Save Template
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {prompts.length === 0 ? (
                                <p className="text-zinc-500 text-center py-8">No saved prompts yet.</p>
                            ) : (
                                prompts.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => {
                                            onSelect(p.content);
                                            onClose();
                                        }}
                                        className="group relative flex flex-col p-4 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800/80 rounded-xl cursor-pointer transition-all duration-200"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{p.title}</h3>
                                            <button
                                                onClick={(e) => handleDelete(p.id, e)}
                                                className="p-1.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50 dark:hover:bg-zinc-700 max-md:opacity-100"
                                                title="Delete Template"
                                            >
                                                <FaTrash className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                            {p.content}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isAdding && (
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-3 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-accent hover:bg-zinc-100 dark:hover:bg-accent/10 text-zinc-600 dark:text-zinc-400 hover:text-accent dark:hover:text-accent-light rounded-xl flex items-center justify-center gap-2 transition-colors font-medium"
                        >
                            <FaPlus className="w-4 h-4" />
                            Add New Template
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromptLibraryModal;
