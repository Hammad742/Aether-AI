// Custom code block component with syntax highlighting and copy-to-clipboard functionality

import { useState } from "react";

const CodeBlock = ({ inline, className, children, ...props }) => {
    // State for copy button feedback
    const [copied, setCopied] = useState(false);

    // Extract language from className (e.g., "language-javascript")
    const match = /language-(\w+)/.exec(className || '');

    // Ensure code content is a string
    const codeText = Array.isArray(children) ? children.join('') : children;

    // Copy code to clipboard with visual feedback
    const handleCopy = () => {
        if (typeof navigator != 'undefined') {
            navigator.clipboard.writeText(codeText || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
        }
    }

    // Render block code with syntax highlighting and copy button
    if (!inline && match){
        return (
            <div className="relative group mb-4">
                {/* Code block container with horizontal scrolling */}
                <pre className="bg-custom-secondary border border-custom rounded-lg p-4 overflow-x-auto custom-scrollbar">
                    <code className={className} {...props}>
                        {children}
                    </code>
                </pre>
                {/* Copy button - appear on hover */}
                <button type="button" onClick={handleCopy} className="absolute top-2 right-2 px-2 py-1 rounded-md bg-custom-tertiary border border-custom text-xs text-custom-primary hover:bg-custom-tertiary focus:outline-none shadow-sm transition-opacity opacity-0 group-hover:opacity-100">
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
        )
    }

    // Render inline code   (fallback for single backticks)
    return (
        <code className="bg-custom-tertiary px-1.5 py-0.5 rounded text-custom-primary" {...props}>
            {children}
        </code>
    )
}

export default CodeBlock;