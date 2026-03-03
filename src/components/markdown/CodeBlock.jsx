// Custom code block component with syntax highlighting and copy-to-clipboard functionality

import { useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';

const CodeBlock = ({ inline, className, children, ...props }) => {
    // State for copy button feedback
    const [copied, setCopied] = useState(false);

    // Extract language from className (e.g., "language-javascript")
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';

    // Ensure code content is a string
    const codeText = Array.isArray(children) ? children.join('') : String(children).replace(/\n$/, '');

    // Copy code to clipboard with visual feedback
    const handleCopy = () => {
        if (typeof navigator != 'undefined') {
            navigator.clipboard.writeText(codeText || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    // Render block code with syntax highlighting and copy button
    if (!inline && match) {
        return (
            <div className="relative group mb-4 rounded-lg overflow-hidden border border-zinc-700/50 bg-[#1e1e1e]">
                {/* Header with language and copy button */}
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-b border-zinc-700/50">
                    <span className="text-xs text-zinc-400 font-mono uppercase">{language}</span>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                        {copied ? (
                            <>
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-green-400" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span className="text-green-400">Copied!</span>
                            </>
                        ) : (
                            <>
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                <span>Copy code</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Syntax Highlighter */}
                <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={language}
                    PreTag="div"
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        background: 'transparent',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                    }}
                    {...props}
                >
                    {codeText}
                </SyntaxHighlighter>
            </div>
        )
    }

    // Render inline code (fallback for single backticks)
    return (
        <code className="bg-zinc-800/50 px-1.5 py-0.5 rounded text-zinc-200 font-mono text-sm border border-zinc-700/50" {...props}>
            {children}
        </code>
    )
}

export default CodeBlock;