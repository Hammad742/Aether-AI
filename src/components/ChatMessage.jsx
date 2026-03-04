
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaUser, FaRobot, FaVolumeUp, FaStop, FaProjectDiagram } from 'react-icons/fa';
import markdownComponents from './markdown/markdownComponents';
import useTextToSpeech from '../hooks/useTextToSpeech';

const ChatMessage = ({ role, content, model, onOpenArtifact }) => {
    const isUser = role === 'user';
    const { speak, stop, isSpeaking, supported } = useTextToSpeech();

    const handleSpeechClick = () => {
        if (isSpeaking) {
            stop();
        } else {
            speak(content);
        }
    };

    return (
        <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[90%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3 sm:gap-4`}>

                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg ${isUser
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 border border-zinc-300/50 dark:border-zinc-700/50 rounded-tr-sm shadow-sm'
                    : 'bg-accent-light/10 dark:bg-accent-light/30 backdrop-blur-md border border-accent-light/40 text-accent dark:text-zinc-100 shadow-lg shadow-accent-light/20'
                    }`}>
                    {isUser ? <FaUser className="w-4 h-4 sm:w-5 sm:h-5" /> : <FaRobot className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 group`}>

                    {/* Header Name & Actions */}
                    <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-xs text-zinc-500">
                            {isUser ? 'You' : model?.shortLabel || 'Assistant'}
                        </span>
                        {!isUser && supported && (
                            <button
                                onClick={handleSpeechClick}
                                className={`sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1 rounded-full ${isSpeaking ? 'text-accent dark:text-accent-light bg-accent-light/10' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                                title={isSpeaking ? "Stop speaking" : "Read aloud"}
                            >
                                {isSpeaking ? <FaStop className="w-3 h-3" /> : <FaVolumeUp className="w-3 h-3" />}
                            </button>
                        )}
                        {!isUser && content.includes('```mermaid') && (
                            <button
                                onClick={() => {
                                    const match = content.match(/```mermaid([\s\S]*?)```/);
                                    if (match && match[1]) {
                                        onOpenArtifact(match[1].trim());
                                    }
                                }}
                                className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-tight"
                                title="Open in Aether Workspace"
                            >
                                <FaProjectDiagram className="w-3 h-3" />
                                <span>Workspace</span>
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className={`rounded-2xl px-4 py-3 shadow-md overflow-hidden ${isUser
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-300/50 dark:border-zinc-700/50 rounded-tr-sm'
                        : 'glass-apple rounded-tl-sm shadow-lg shadow-black/5'
                        }`}>
                        {isUser ? (
                            <div className="whitespace-pre-wrap text-sm sm:text-base">{content}</div>
                        ) : (
                            <div className="prose text-zinc-800 dark:prose-invert prose-sm max-w-none dark:text-zinc-200 leading-relaxed wrap-break-word">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={markdownComponents}
                                    urlTransform={(value) => value}
                                >
                                    {content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ChatMessage);
