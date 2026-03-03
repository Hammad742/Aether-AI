import React, { useState } from 'react';
import { FaTimes, FaCode, FaEye, FaExternalLinkAlt, FaDownload, FaCopy, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ArtifactPanel = ({ isOpen, onClose, artifacts = [], currentIndex = -1, onNavigate }) => {
    const [activeTab, setActiveTab] = useState('preview'); // 'preview' or 'code'

    // Get current artifact data
    const currentArtifact = currentIndex >= 0 ? artifacts[currentIndex] : null;
    const content = currentArtifact?.content || '';
    const type = currentArtifact?.type || 'html';
    const title = currentArtifact?.title || 'Artifact';

    // Pre-process Mermaid to fix common syntax errors like unquoted special characters in labels
    const preprocessMermaid = (code) => {
        if (!code) return '';

        // Normalize line endings to avoid regex failures
        let processed = code.replace(/\r\n/g, '\n');

        // Case normalization for diagram types (very common AI error)
        processed = processed.replace(/^\s*sequencediagram\b/i, 'sequenceDiagram');
        processed = processed.replace(/^\s*flowchart\b/i, 'flowchart');
        processed = processed.replace(/^\s*graph\b/i, 'graph');
        processed = processed.replace(/^\s*gantt\b/i, 'gantt');
        processed = processed.replace(/^\s*classdiagram\b/i, 'classDiagram');

        // 0. Structural fix: Fix incorrectly closed alt/else blocks in sequence diagrams
        // AI often writes: alt ... end \n else ... end
        processed = processed.replace(/(\balt\b[\s\S]*?)\bend\b\s*(\belse\b)/g, '$1$2');

        // 1. Double quote cleanup: Remove accidental double-nested quotes globally
        processed = processed.replace(/""([^" \n]+)""/g, '"$1"');

        return processed;
    };

    const displayContent = type === 'mermaid' ? preprocessMermaid(content) : content;

    const handleExport = () => {
        const extensions = {
            html: 'html',
            mermaid: 'mmd',
            react: 'jsx',
            svg: 'svg'
        };
        const ext = extensions[type] || 'txt';
        const blob = new Blob([displayContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_').toLowerCase()}-${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!isOpen || !currentArtifact) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full lg:static lg:w-[500px] xl:w-[600px] h-full flex flex-col bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300 z-[100] lg:z-40 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-0.5">
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]">
                            {title}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-accent-DEFAULT/10 text-accent-DEFAULT text-[10px] font-bold rounded uppercase tracking-wider">
                                {type}
                            </span>
                        </div>
                    </div>

                    {/* Version History Navigation */}
                    {artifacts.length > 1 && (
                        <div className="flex items-center gap-1.5 ml-2 pl-4 border-l border-zinc-200 dark:border-zinc-700">
                            <button
                                onClick={() => onNavigate(currentIndex - 1)}
                                disabled={currentIndex === 0}
                                className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                                title="Previous Version"
                            >
                                <FaChevronLeft className="w-3 h-3" />
                            </button>

                            <span className="text-[10px] font-bold text-zinc-400 tabular-nums">
                                {currentIndex + 1} <span className="text-zinc-300 font-medium">/</span> {artifacts.length}
                            </span>

                            <button
                                onClick={() => onNavigate(currentIndex + 1)}
                                disabled={currentIndex === artifacts.length - 1}
                                className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                                title="Next Version"
                            >
                                <FaChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Mode Tabs */}
                    <div className="flex items-center bg-zinc-200/50 dark:bg-zinc-800/50 p-1 rounded-xl mr-2">
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === 'preview'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            <FaEye className="w-3 h-3" />
                            Preview
                        </button>
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === 'code'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            <FaCode className="w-3 h-3" />
                            Code
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                        title="Close Preview"
                    >
                        <FaTimes className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-zinc-50 dark:bg-[#0c0c0e]">
                {activeTab === 'preview' ? (
                    <div className="w-full h-full flex flex-col h-full bg-white">
                        {/* Sandboxed Iframe Preview */}
                        <iframe
                            className="w-full h-full border-none"
                            title="Artifact Preview"
                            sandbox="allow-scripts"
                            srcDoc={`
                                <!DOCTYPE html>
                                <html>
                                    <head>
                                        <meta charset="utf-8">
                                        <meta name="viewport" content="width=device-width, initial-scale=1">
                                        <style>
                                            body { 
                                                margin: 0; 
                                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
                                                background: white; 
                                                color: #333; 
                                                display: flex;
                                                justify-content: center;
                                                padding: 24px;
                                                min-height: 100vh;
                                                box-sizing: border-box;
                                            }
                                            #root { width: 100%; max-width: 1000px; }
                                            .error-container {
                                                padding: 20px;
                                                border-radius: 12px;
                                                background: #fff5f5;
                                                border: 1px solid #feb2b2;
                                                color: #c53030;
                                                font-family: sans-serif;
                                                text-align: center;
                                            }
                                            .error-title { font-weight: bold; margin-bottom: 8px; }
                                            .error-code { 
                                                font-family: monospace; 
                                                background: #fff; 
                                                padding: 10px; 
                                                border-radius: 6px; 
                                                font-size: 12px;
                                                text-align: left;
                                                white-space: pre-wrap;
                                                margin-top: 10px;
                                                border: 1px solid #fed7d7;
                                            }
                                        </style>
                                        ${type === 'mermaid' ? '<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>' : ''}
                                        ${type === 'react' ? '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>' : ''}
                                        ${type === 'react' ? '<script src="https://unpkg.com/react@18/umd/react.development.js"></script>' : ''}
                                        ${type === 'react' ? '<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>' : ''}
                                    </head>
                                    <body>
                                        <div id="root"></div>
                                        <script type="${type === 'react' ? 'text/babel' : 'text/javascript'}" data-presets="react">
                                            const content = ${JSON.stringify(displayContent)};
                                            const rawContent = ${JSON.stringify(content)};
                                            const type = "${type}";

                                            async function init() {
                                                const root = document.getElementById('root');
                                                
                                                if (type === 'mermaid' && window.mermaid) {
                                                    try {
                                                        mermaid.initialize({ 
                                                            startOnLoad: false,
                                                            theme: 'default',
                                                            securityLevel: 'loose'
                                                        });
                                                        
                                                        // Use manual render to catch errors
                                                        const { svg } = await mermaid.render('mermaid-svg', content);
                                                        root.innerHTML = svg;
                                                    } catch (e) {
                                                        console.error('Mermaid Render Error:', e);
                                                        root.innerHTML = \`
                                                            <div class="error-container">
                                                                <div class="error-title">Diagram Syntax Error</div>
                                                                <div>Mermaid couldn't render this chart. This is usually due to a formatting error in the AI's output.</div>
                                                                <div class="error-code">\${content}</div>
                                                            </div>
                                                        \`;
                                                    }
                                                } else if (type === 'react') {
                                                    try {
                                                        // Strip imports
                                                        const strippedCode = rawContent.replace(/import.*?from.*?;/g, '');
                                                        eval(strippedCode);
                                                        
                                                        const Component = typeof App !== 'undefined' ? App : (typeof Artifact !== 'undefined' ? Artifact : null);
                                                        if (Component) {
                                                            const reactRoot = ReactDOM.createRoot(root);
                                                            reactRoot.render(React.createElement(Component));
                                                        }
                                                    } catch (e) {
                                                        root.innerHTML = '<div style="color: red; padding: 20px;">Render Error: ' + e.message + '</div>';
                                                    }
                                                } else {
                                                    root.innerHTML = content;
                                                }
                                            }

                                            init();
                                        </script>
                                    </body>
                                </html>
                            `}
                        />
                    </div>
                ) : (
                    <div className="w-full h-full overflow-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700">
                        <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                            <code>{displayContent}</code>
                        </pre>

                        {/* Floating Actions */}
                        <div className="absolute top-4 right-6 flex gap-2">
                            <button
                                className="p-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
                                onClick={() => navigator.clipboard.writeText(displayContent)}
                                title="Copy Code"
                            >
                                <FaCopy className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Info */}
            <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 flex items-center justify-between">
                <p className="text-[10px] text-zinc-400 font-medium tracking-tight">
                    Hammad AI Artifact v1.0 • Sandboxed Environment
                </p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="text-[10px] font-bold text-accent-DEFAULT hover:underline flex items-center gap-1"
                    >
                        <FaDownload className="w-2.5 h-2.5" /> Export
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArtifactPanel;
