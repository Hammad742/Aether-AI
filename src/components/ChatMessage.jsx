
import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaUser, FaRobot } from 'react-icons/fa';
import markdownComponents from './markdown/markdownComponents';

const ChatMessage = ({ role, content, model }) => {
    const isUser = role === 'user';

    return (
        <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[90%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3 sm:gap-4`}>

                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg ${isUser
                    ? 'bg-custom-tertiary text-custom-secondary border border-custom'
                    : 'bg-gradient-to-br from-blue-600 to-purple-600 text-custom-primary'
                    }`}>
                    {isUser ? <FaUser className="w-4 h-4 sm:w-5 sm:h-5" /> : <FaRobot className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 max-w-full`}>

                    {/* Header Name */}
                    <span className="text-xs text-custom-secondary mb-1 px-1">
                        {isUser ? 'You' : model?.shortLabel || 'Assistant'}
                    </span>

                    {/* Content */}
                    <div className={`rounded-2xl px-4 py-3 shadow-md overflow-hidden max-w-full ${isUser
                        ? 'bg-custom-tertiary text-custom-primary border border-custom rounded-tr-sm'
                        : 'bg-custom-secondary border border-custom rounded-tl-sm backdrop-blur-sm'
                        }`}>
                        {isUser ? (
                            <div className="whitespace-pre-wrap text-sm sm:text-base break-words w-full max-w-full">{content}</div>
                        ) : (
                            <div className="prose prose-invert prose-sm max-w-none text-custom-primary leading-relaxed break-words w-full max-w-full overflow-x-hidden">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={markdownComponents}
                                    urlTransform={(value) => value} // Allow all URLs including data: URIs for base64 images
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

export default memo(ChatMessage);
