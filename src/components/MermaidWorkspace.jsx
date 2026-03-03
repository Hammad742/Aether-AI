/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaTimes, FaCode, FaDownload, FaCopy, FaTrash, FaPlus, FaSearchPlus, FaSearchMinus, FaSyncAlt, FaSun, FaMoon, FaCog, FaBook, FaChevronUp, FaChevronDown, FaProjectDiagram, FaPencilAlt, FaTh, FaExpand, FaCompress } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const TEMPLATES = [
    {
        id: 'flowchart',
        name: 'Flowchart',
        code: `flowchart TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Enjoy]
    B -- No --> D[Debug]`
    },
    {
        id: 'sequence',
        name: 'Sequence',
        code: `sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!`
    },
    {
        id: 'class',
        name: 'Class',
        code: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()`
    },
    {
        id: 'state',
        name: 'State',
        code: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`
    },
    {
        id: 'er',
        name: 'ER Diagram',
        code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`
    },
    {
        id: 'mindmap',
        name: 'Mindmap',
        code: `mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
    Development
      Strategic Planning
    Research
      Market Trends`
    },
    {
        id: 'architecture',
        name: 'Architecture',
        code: `architecture-beta
    group api(cloud)[API]

    service db(database)[Database] in api
    service disk1(disk)[Storage] in api
    service disk2(disk)[Storage] in api
    service server(server)[Server] in api

    db:L -- R:server
    disk1:T -- B:server
    disk2:T -- B:db`
    },
    {
        id: 'block',
        name: 'Block',
        code: `block-beta
columns 1
  db(("DB"))
  blockArrowId6<["&nbsp;&nbsp;&nbsp;"]>(down)
  block:ID
    A
    B["A wide one in the middle"]
    C
  end
  space
  D
  ID --> D
  C --> D
  style B fill:#969,stroke:#333,stroke-width:4px`
    },
    {
        id: 'c4',
        name: 'C4 Context',
        code: `C4Context
    title System Context diagram
    Person(customer, "Customer")
    System(system, "Software System")
    Rel(customer, system, "Uses")`
    },
    {
        id: 'gantt',
        name: 'Gantt',
        code: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Tasks
    Task 1 :a1, 2024-01-01, 30d
    Task 2 :after a1, 2024-02-01, 20d`
    },
    {
        id: 'git',
        name: 'Git Graph',
        code: `gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    checkout main
    merge develop
    commit`
    },
    {
        id: 'kanban',
        name: 'Kanban',
        code: `kanban
  Todo
    [Task 1]
    [Task 2]
  In Progress
    [Task 3]
  Done
    [Task 4]`
    },
    {
        id: 'packet',
        name: 'Packet',
        code: `packet-beta
0-15: "Source Port"
16-31: "Destination Port"
32-63: "Sequence Number"
64-95: "Acknowledgment Number"`
    },
    {
        id: 'pie',
        name: 'Pie Chart',
        code: `pie title Data Distribution
    "Alpha" : 45
    "Beta" : 25
    "Gamma" : 30`
    },
    {
        id: 'quadrant',
        name: 'Quadrant',
        code: `quadrantChart
    title Reach vs Engagement
    quadrant-1 High Reach
    quadrant-2 Low Reach
    Campaign A: [0.3, 0.6]`
    },
    {
        id: 'requirement',
        name: 'Requirement',
        code: `requirementDiagram

    requirement test_req {
    id: 1
    text: the test text.
    risk: high
    verifymethod: test
    }

    element test_entity {
    type: simulation
    }

    test_entity - satisfies -> test_req`
    },
    {
        id: 'sankey',
        name: 'Sankey',
        code: `sankey-beta
Source,Target,100
Target,Destination,60`
    },
    {
        id: 'timeline',
        name: 'Timeline',
        code: `timeline
    title Journey
    2022 : Start
    2023 : Pivot
    2024 : Launch`
    },
    {
        id: 'journey',
        name: 'User Journey',
        code: `journey
    title Daily Grind
    section Morning
      Wake up: 5: Me
      Coffee: 3: Me`
    },
    {
        id: 'xy',
        name: 'XY Chart',
        code: `xychart-beta
    x-axis [jan, feb, mar]
    bar [5000, 6000, 7500]`
    },
];

const MermaidWorkspace = ({ isOpen, onClose, initialCode }) => {
    const { language: _ } = useLanguage();
    const [code, setCode] = useState(initialCode || TEMPLATES[0].code);
    const { theme: globalTheme } = useTheme();
    const [workspaceTheme, setWorkspaceTheme] = useState('dark');

    // Sync workspace theme with global theme on initial load
    useEffect(() => {
        const resolvedTheme = globalTheme === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : globalTheme;
        setWorkspaceTheme(resolvedTheme);
    }, [globalTheme]);

    const [leftWidth] = useState(32); // percent (Fixed)
    const [templatesHeight, setTemplatesHeight] = useState(35); // percent
    const [isResizingVertical, setIsResizingVertical] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 768);
    const [showPanels, setShowPanels] = useState(window.innerWidth >= 768);

    // Performance refs to bypass React re-renders during interaction
    const panRef = useRef({ x: 0, y: 0 });
    const zoomRef = useRef(1);

    const iframeRef = useRef(null);
    const containerRef = useRef(null);
    const resizableRef = useRef(null);
    const leftPanelRef = useRef(null);
    const renderAreaRef = useRef(null);

    // Keep refs in sync with state for UI consistency (e.g. initial load, reset)
    useEffect(() => {
        panRef.current = pan;
        zoomRef.current = zoom;
    }, [pan, zoom]);

    // Sync with initialCode when it changes (e.g., when opening from chat)
    useEffect(() => {
        if (initialCode) {
            setCode(initialCode);
        }
    }, [initialCode]);

    // Resizing logic (Horizontal & Vertical)
    useEffect(() => {
        const handleMouseMove = (e) => {

            if (isResizingVertical && leftPanelRef.current) {
                const rect = leftPanelRef.current.getBoundingClientRect();
                const relativeY = e.clientY - rect.top;
                const percentage = 100 - (relativeY / rect.height) * 100;
                // Clamp between 10% and 85%
                setTemplatesHeight(Math.max(10, Math.min(85, percentage)));
            }
            if (isPanning) {
                const newPan = {
                    x: panRef.current.x + e.movementX,
                    y: panRef.current.y + e.movementY
                };
                panRef.current = newPan;

                // Direct message to iframe (bypasses state updates for zero-lag)
                iframeRef.current?.contentWindow?.postMessage({
                    type: 'updateTransform',
                    pan: newPan,
                    zoom: zoomRef.current
                }, '*');
            }
        };

        const handleMouseUp = () => {
            if (isPanning) {
                // Sync ref back to state when interaction ends
                setPan(panRef.current);
            }
            setIsResizingVertical(false);
            setIsPanning(false);
        };

        if (isResizingVertical || isPanning) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            if (isResizingVertical) document.body.style.cursor = 'row-resize';
            else if (isPanning) document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizingVertical, isPanning]);

    const toggleTheme = () => {
        setWorkspaceTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleFullscreen = () => {
        if (!renderAreaRef.current) return;
        if (!document.fullscreenElement) {
            renderAreaRef.current.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobileScreen(mobile);
            if (!mobile) setShowPanels(true);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('resize', handleResize);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleZoomIn = () => {
        setIsAnimating(true);
        const zoomFactor = 1.2;
        const newZoom = Math.min(zoom * zoomFactor, 7);
        if (newZoom !== zoom && renderAreaRef.current) {
            const rect = renderAreaRef.current.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const worldX = (centerX - pan.x) / zoom;
            const worldY = (centerY - pan.y) / zoom;
            const newPan = { x: centerX - worldX * newZoom, y: centerY - worldY * newZoom };

            iframeRef.current?.contentWindow?.postMessage({
                type: 'updateTransform',
                pan: newPan,
                zoom: newZoom,
                isAnimating: true
            }, '*');

            setPan(newPan);
            setZoom(newZoom);
            setTimeout(() => setIsAnimating(false), 450);
        }
    };

    const handleZoomOut = () => {
        setIsAnimating(true);
        const zoomFactor = 1 / 1.2;
        const newZoom = Math.max(zoom * zoomFactor, 0.05);
        if (newZoom !== zoom && renderAreaRef.current) {
            const rect = renderAreaRef.current.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const worldX = (centerX - pan.x) / zoom;
            const worldY = (centerY - pan.y) / zoom;
            const newPan = { x: centerX - worldX * newZoom, y: centerY - worldY * newZoom };

            iframeRef.current?.contentWindow?.postMessage({
                type: 'updateTransform',
                pan: newPan,
                zoom: newZoom,
                isAnimating: true
            }, '*');

            setPan(newPan);
            setZoom(newZoom);
            setTimeout(() => setIsAnimating(false), 450);
        }
    };

    const handleResetAll = () => {
        setIsAnimating(true);
        const newZoom = 1;
        const newPan = { x: 0, y: 0 };

        iframeRef.current?.contentWindow?.postMessage({
            type: 'updateTransform',
            pan: newPan,
            zoom: newZoom,
            isAnimating: true
        }, '*');

        setZoom(newZoom);
        setPan(newPan);
        setTimeout(() => setIsAnimating(false), 450); // Matches refined glide duration
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const zoomSpeed = 0.002;
        const zoomDelta = Math.exp(-e.deltaY * zoomSpeed);
        const newZoom = Math.max(0.05, Math.min(7, zoomRef.current * zoomDelta));

        if (newZoom !== zoomRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const worldX = (mouseX - panRef.current.x) / zoomRef.current;
            const worldY = (mouseY - panRef.current.y) / zoomRef.current;
            const newPan = {
                x: mouseX - worldX * newZoom,
                y: mouseY - worldY * newZoom
            };

            panRef.current = newPan;
            zoomRef.current = newZoom;

            // Instant direct message (no state overhead)
            iframeRef.current?.contentWindow?.postMessage({
                type: 'updateTransform',
                pan: newPan,
                zoom: newZoom
            }, '*');

            // Throttled state update for UI only (zoom %)
            if (!window.zoomSyncPending) {
                window.zoomSyncPending = true;
                requestAnimationFrame(() => {
                    setZoom(zoomRef.current);
                    setPan(panRef.current);
                    window.zoomSyncPending = false;
                });
            }
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
    };

    const handleClear = () => {
        if (window.confirm('Clear all code?')) {
            setCode('');
        }
    };

    const handleSaveDiagram = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'diagram.mmd';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleTemplateInject = (templateCode) => {
        setCode(templateCode);
    };


    const srcDoc = useMemo(() => `
        <!DOCTYPE html>
        <html>
            <head>
                <script src="https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"></script>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
                <style>
                    body { 
                        margin: 0; padding: 20px; display: flex; justify-content: center; 
                        background: transparent;
                        color: inherit;
                        transition: background 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        font-family: 'Inter', sans-serif; overflow: hidden;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                    }
                    #diagram-container { 
                        width: 100%; height: 100%; transform-origin: 0 0;
                        will-change: transform;
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                        transform: translateZ(0);
                    }
                    #diagram-container.animating {
                        transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    .mermaid { 
                        font-family: 'Inter', sans-serif !important;
                        background: transparent !important; 
                    }
                    /* Ensure HTML labels aren't truncated or clipped */
                    .node label, .label, .edgeLabel { 
                        white-space: nowrap !important;
                        overflow: visible !important;
                        font-family: 'Inter', sans-serif !important;
                    }
                    ::-webkit-scrollbar { width: 8px; height: 8px; }
                    ::-webkit-scrollbar-track { background: transparent; }
                    ::-webkit-scrollbar-thumb { border-radius: 10px; transition: background 0.3s ease; }
                </style>
                <style id="scrollbar-dynamic"></style>
            </head>
            <body>
                <div id="diagram-container">
                    <div id="mermaid-root"></div>
                </div>
                <script>
                    let currentCode = '';
                    let currentTheme = '';
                    let isInitialized = false;
                    
                    // Cache DOM references for zero-lag transformation
                    let containerCache = null;

                    function getContainer() {
                        if (!containerCache) containerCache = document.getElementById('diagram-container');
                        return containerCache;
                    }

                    function updateStyles(theme) {
                        const isDark = theme === 'dark';
                        document.body.style.backgroundColor = isDark ? '#09090b' : '#ffffff';
                        document.body.style.color = isDark ? '#ffffff' : '#000000';
                        const scrollbarStyle = document.getElementById('scrollbar-dynamic');
                        scrollbarStyle.innerHTML = '::-webkit-scrollbar-thumb { background: ' + (isDark ? '#27272a' : '#d4d4d8') + '; }';
                    }

                    let isRendering = false;
                    let pendingUpdate = null;

                    async function renderDiagram(code, theme) {
                        if (isRendering) {
                            pendingUpdate = { code, theme };
                            return;
                        }
                        isRendering = true;

                        if (!code) {
                            isRendering = false;
                            return;
                        }

                        try {
                            const root = document.getElementById('mermaid-root');
                            
                            // Initialize with latest configurations
                            mermaid.initialize({ 
                                startOnLoad: false,
                                theme: theme === 'dark' ? 'dark' : 'default',
                                securityLevel: 'loose',
                                architecture: { useMaxWidth: false },
                                block: { useMaxWidth: false },
                                requirement: { useMaxWidth: false },
                                flowchart: { 
                                    useMaxWidth: false, 
                                    htmlLabels: true,
                                    curve: 'linear',
                                    padding: 24,
                                    nodePadding: 24,
                                    rankSpacing: 60
                                },
                                themeVariables: {
                                    darkMode: theme === 'dark',
                                    background: 'transparent',
                                    mainBkg: theme === 'dark' ? '#18181b' : '#ffffff',
                                    nodeBorder: theme === 'dark' ? '#3f3f46' : '#cbd5e1',
                                    primaryColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
                                    primaryTextColor: theme === 'dark' ? '#ffffff' : '#0f172a',
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '16px',
                                    lineColor: theme === 'dark' ? '#94a3b8' : '#64748b'
                                }
                            });

                            // Wait for fonts
                            await document.fonts.ready;
                            
                            // Generate unique but safe ID
                            const id = 'mermaid-svg-' + Math.random().toString(36).substring(7);
                            const { svg } = await mermaid.render(id, code);
                            
                            root.innerHTML = svg;
                            
                            const svgElement = root.querySelector('svg');
                            if (svgElement) {
                                svgElement.style.overflow = 'visible';
                                svgElement.style.width = '100%';
                                svgElement.style.height = 'auto';
                            }
                        } catch (e) {
                            console.error('Mermaid render error:', e);
                            // Only clear if it's a real error, to avoid flickering
                            if (e.message && e.message.includes('Parse error')) {
                                document.getElementById('mermaid-root').innerHTML = '<div style="color: #ef4444; padding: 20px;">Syntax Error: Check your diagram code.</div>';
                            }
                        } finally {
                            isRendering = false;
                            if (pendingUpdate) {
                                const next = pendingUpdate;
                                pendingUpdate = null;
                                renderDiagram(next.code, next.theme);
                            }
                        }
                    }

                    window.addEventListener('message', (event) => {
                        const { type, pan, zoom, code, theme, showGrid, isAnimating } = event.data;
                        if (type === 'updateTransform') {
                            const container = getContainer();
                            if (container) {
                                if (isAnimating) container.classList.add('animating');
                                else container.classList.remove('animating');
                                container.style.transform = 'translate(' + pan.x + 'px, ' + pan.y + 'px) scale(' + zoom + ')';
                            }
                        }
                        if (type === 'updateContent') {
                            if (theme) updateStyles(theme);
                            
                            // Apply background grid
                            if (showGrid !== undefined) {
                                const isDark = (theme || currentTheme) === 'dark';
                                document.body.style.backgroundImage = showGrid 
                                    ? 'radial-gradient(' + (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') + ' 1px, transparent 1px)'
                                    : 'none';
                                document.body.style.backgroundSize = showGrid ? '30px 30px' : 'auto';
                            }

                            renderDiagram(code || currentCode, theme || currentTheme);
                            if (code) currentCode = code;
                            if (theme) currentTheme = theme;
                            isInitialized = true;
                        }
                    });

                    window.parent.postMessage({ type: 'iframeReady' }, '*');
                </script>
            </body>
        </html>
    `, []);

    // EFFECT 1: Sync CONTENT (Code, Theme, Grid) - Expensive Rendering
    useEffect(() => {
        const syncContent = () => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage({
                    type: 'updateContent',
                    code,
                    theme: workspaceTheme,
                    showGrid
                }, '*');
            }
        };
        syncContent();

        // Listen for iframe ready to do initial content sync
        const handleIframeReady = (e) => {
            if (e.data.type === 'iframeReady') {
                syncContent();
                // Also do one initial transform sync
                if (iframeRef.current && iframeRef.current.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({
                        type: 'updateTransform',
                        pan,
                        zoom
                    }, '*');
                }
            }
        };
        window.addEventListener('message', handleIframeReady);
        return () => window.removeEventListener('message', handleIframeReady);
    }, [code, workspaceTheme, showGrid]); // NO pan/zoom dependency here!

    // EFFECT 2: Sync TRANSFORM (Pan, Zoom) - High Speed Movement
    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow && !isPanning && !isAnimating) {
            iframeRef.current.contentWindow.postMessage({
                type: 'updateTransform',
                pan,
                zoom
            }, '*');
        }
    }, [pan, zoom]); // Only sync when transform state updates (end of drag/zoom)


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 lg:p-6 animate-in fade-in duration-300" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                ref={containerRef}
                className={`relative w-full max-w-[98%] h-[95vh] glass-apple rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 transition-all duration-500 z-[100] ${workspaceTheme === 'dark' ? 'text-white' : 'text-zinc-900'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className={`px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/10 transition-all duration-300 z-[100] ${workspaceTheme === 'dark' ? 'bg-zinc-900 border-b-white/5' : 'bg-white border-b-zinc-200 shadow-sm'}`}>
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/30">
                            <FaCode className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-sm md:text-lg font-bold tracking-tight leading-tight">Aether AI Workspace</h1>
                            {!isMobileScreen && <p className={`text-[10px] font-bold uppercase tracking-widest ${workspaceTheme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>IDE Mode</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${workspaceTheme === 'dark' ? 'bg-zinc-800 border-white/10 text-zinc-400 hover:text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200'}`}
                            title="Toggle Theme"
                        >
                            {workspaceTheme === 'dark' ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={onClose}
                            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${workspaceTheme === 'dark' ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-500 hover:text-white'}`}
                            title="Close Workspace"
                        >
                            <FaTimes className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 relative overflow-hidden" ref={resizableRef}>
                    {/* FULL SCREEN BACKGROUND RENDERING */}
                    <div className={`absolute inset-0 z-0 flex flex-col overflow-hidden transition-all duration-300 ${workspaceTheme === 'dark' ? 'bg-[#09090b]' : 'bg-white'}`}>
                        <div className={`flex items-center justify-between px-4 md:px-6 h-12 border-b text-[10px] font-bold uppercase tracking-[0.2em] shrink-0 z-10 ${workspaceTheme === 'dark' ? 'bg-zinc-900/40 border-white/5 text-zinc-500' : 'bg-zinc-50/50 border-zinc-100 text-zinc-500'}`}>
                            <div className="flex items-center gap-3 md:gap-6 w-full justify-between md:justify-start">
                                {!isMobileScreen && <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />Interactive Render</span>}
                                <div className="flex items-center gap-2 flex-1 justify-center md:justify-start">
                                    <div className={`flex items-center gap-2 md:gap-2.5 normal-case font-mono text-[10px] md:text-[11px] px-2 md:px-3 py-1 rounded-xl border transition-all ${workspaceTheme === 'dark' ? 'text-zinc-300 bg-zinc-800/50 border-white/10' : 'text-zinc-600 bg-white/80 border-zinc-200 shadow-sm'}`}>
                                        <button onClick={handleZoomOut} className="hover:text-blue-400 transition-colors p-0.5" title="Out"><FaSearchMinus className="w-3.5 h-3.5" /></button>
                                        <span className="min-w-[40px] md:min-w-[45px] text-center border-x border-white/10 px-1 md:px-2 font-bold font-mono text-blue-500">{Math.round(zoom * 100)}%</span>
                                        <button onClick={handleZoomIn} className="hover:text-blue-400 transition-colors p-0.5" title="In"><FaSearchPlus className="w-3.5 h-3.5" /></button>
                                        <button onClick={handleResetAll} className="hover:text-amber-400 transition-colors ml-1 md:ml-1.5 p-0.5" title="Reset"><FaSyncAlt className="w-2.5 h-2.5" /></button>
                                    </div>
                                    <div className={`flex items-center gap-1 md:gap-1.5 px-1 md:px-1.5 py-1 rounded-xl border transition-all ${workspaceTheme === 'dark' ? 'bg-zinc-800/50 border-white/10' : 'bg-white/80 border-zinc-200 shadow-sm'}`}>
                                        <button
                                            onClick={() => setShowGrid(!showGrid)}
                                            className={`p-1 md:p-1.5 rounded-lg transition-all flex items-center justify-center ${showGrid ? 'bg-blue-500/20 text-blue-500 shadow-inner' : (workspaceTheme === 'dark' ? 'text-zinc-500 hover:bg-zinc-700/50 hover:text-blue-400' : 'text-zinc-500 hover:bg-zinc-100/80 hover:text-blue-500')}`}
                                            title="Toggle Grid"
                                        >
                                            <FaTh className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={handleFullscreen}
                                            className={`p-1 md:p-1.5 rounded-lg transition-all flex items-center justify-center ${workspaceTheme === 'dark' ? 'text-zinc-500 hover:bg-zinc-700/50 hover:text-blue-400' : 'text-zinc-500 hover:bg-zinc-100/80 hover:text-blue-500'}`}
                                            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                        >
                                            {isFullscreen ? <FaCompress className="w-3.5 h-3.5" /> : <FaExpand className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {!isMobileScreen && (
                                <div className="flex items-center gap-4">
                                    {isPanning && <span className="text-blue-500 text-[9px] animate-pulse">Exploring...</span>}
                                    <span className={`lowercase font-mono text-[10px] opacity-40 ${workspaceTheme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>pixel-perfect sync</span>
                                </div>
                            )}
                        </div>

                        <div
                            ref={renderAreaRef}
                            className={`flex-1 flex items-center justify-center relative overflow-hidden ${isFullscreen ? (workspaceTheme === 'dark' ? 'bg-[#09090b]' : 'bg-white') : ''}`}
                            onMouseDown={() => setIsPanning(true)}
                            onWheel={handleWheel}
                            style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
                        >
                            <div className="absolute inset-0 z-10" />
                            {isFullscreen && (
                                <div className="absolute top-4 md:top-8 right-4 md:right-8 z-[60] flex items-center gap-2 md:gap-3">
                                    <button
                                        onClick={toggleTheme}
                                        className={`p-2 md:p-2.5 rounded-xl border transition-all flex items-center justify-center hover:scale-105 active:scale-95 shadow-2xl backdrop-blur-md ${workspaceTheme === 'dark' ? 'bg-zinc-900/80 border-white/10 text-zinc-400 hover:text-white' : 'bg-white/90 border-zinc-200 text-zinc-500 hover:bg-zinc-200'}`}
                                        title="Toggle Theme"
                                    >
                                        {workspaceTheme === 'dark' ? <FaSun className="w-4.5 h-4.5 text-amber-300" /> : <FaMoon className="w-4.5 h-4.5 text-zinc-600" />}
                                    </button>
                                    <button
                                        onClick={handleFullscreen}
                                        className={`p-2 md:p-2.5 rounded-xl border transition-all flex items-center justify-center hover:scale-105 active:scale-95 shadow-2xl backdrop-blur-md ${workspaceTheme === 'dark' ? 'bg-zinc-900/80 border-white/10 text-white hover:bg-zinc-800' : 'bg-white/90 border-zinc-200 text-zinc-900 hover:bg-zinc-50'}`}
                                        title="Exit Fullscreen"
                                    >
                                        <FaCompress className="w-5 h-5 text-blue-500" />
                                    </button>
                                </div>
                            )}

                            {/* Floating Panel Toggle (Only on Mobile) */}
                            {isMobileScreen && !showPanels && (
                                <button
                                    onClick={() => setShowPanels(true)}
                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[50] px-6 py-3 bg-blue-600 text-white rounded-full flex items-center gap-3 shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all animate-in slide-in-from-bottom-5 duration-300"
                                >
                                    <FaCode className="w-4 h-4" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Quick Edit</span>
                                </button>
                            )}
                            <iframe ref={iframeRef} srcDoc={srcDoc} className="w-full h-full border-none pointer-events-none" title="Mermaid Preview" />
                        </div>

                        <div className={`px-6 py-3 border-t flex justify-end gap-3 shrink-0 z-10 ${workspaceTheme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50/50 border-zinc-100'}`}>
                            <button onClick={handleSaveDiagram} className={`px-5 py-2 border rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${workspaceTheme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 shadow-sm'}`}><FaDownload className="w-3.5 h-3.5" />Export</button>
                            <button onClick={onClose} className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95">Complete</button>
                        </div>
                    </div>

                    {showPanels && (
                        <div
                            ref={leftPanelRef}
                            className={`z-[155] pointer-events-none transition-all duration-500 animate-in ${isMobileScreen ? 'fixed inset-0 p-4 slide-in-from-bottom-full' : 'absolute left-6 top-16 bottom-6 flex flex-col gap-4'}`}
                            style={isMobileScreen ? { background: workspaceTheme === 'dark' ? 'rgba(9,9,11,0.6)' : 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)' } : { width: `${leftWidth}%`, maxWidth: '600px', minWidth: '320px' }}
                            onClick={() => isMobileScreen && setShowPanels(false)}
                        >
                            <div
                                className={`flex flex-col overflow-hidden rounded-[2.5rem] border shadow-2xl transition-all pointer-events-auto h-full ${!isMobileScreen && isResizingVertical ? 'duration-0 transition-none' : 'duration-300'} ${workspaceTheme === 'dark' ? 'bg-zinc-900/90 border-white/10 backdrop-blur-xl' : 'bg-white/95 border-zinc-200 backdrop-blur-xl'}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Mobile Panel Header with Close Button */}
                                {isMobileScreen && (
                                    <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${workspaceTheme === 'dark' ? 'border-white/5 bg-zinc-800/20' : 'border-zinc-100 bg-zinc-50/20'}`}>
                                        <div className="flex items-center gap-3 font-bold text-xs uppercase tracking-widest text-blue-500">
                                            <FaPencilAlt className="w-3 h-3" /> Editor Mode
                                        </div>
                                        <button onClick={() => setShowPanels(false)} className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all">
                                            <FaTimes className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-col gap-4 p-4 flex-1 overflow-hidden">
                                    <div className={`flex flex-col overflow-hidden rounded-3xl border transition-all ${workspaceTheme === 'dark' ? 'bg-zinc-950/40 border-white/5' : 'bg-zinc-50/50 border-zinc-100 shadow-sm'}`} style={{ flex: isMobileScreen ? '1 1 50%' : (templatesHeight > 80 ? '0 0 15%' : '1') }}>
                                        <div className={`px-4 flex items-center gap-1 border-b shrink-0 h-11 transition-colors duration-300 ${workspaceTheme === 'dark' ? 'bg-zinc-800/40 border-white/5' : 'bg-zinc-100/40 border-zinc-100'}`}>
                                            <button className="px-3 h-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 border-blue-500 text-blue-500">
                                                <FaCode className="w-3.5 h-3.5" /> Code
                                            </button>
                                            <div className="ml-auto flex items-center gap-2">
                                                <button onClick={handleCopy} className={`p-1.5 rounded-lg hover:bg-blue-500/10 hover:text-blue-500 transition-all ${workspaceTheme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`} title="Copy Code"><FaCopy className="w-3 h-3" /></button>
                                                <button onClick={handleClear} className={`p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all ${workspaceTheme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`} title="Clear"><FaTrash className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex overflow-hidden relative">
                                            <div className={`py-4 pl-4 pr-3 text-right font-mono text-[10px] select-none border-r shrink-0 flex flex-col items-end gap-[2px] transition-colors duration-300 ${workspaceTheme === 'dark' ? 'bg-zinc-950/20 border-white/5 text-zinc-700' : 'bg-zinc-100/30 border-zinc-100 text-zinc-400'}`}>
                                                {code.split('\n').map((_, i) => <div key={i} className="h-[20px]">{i + 1}</div>)}
                                            </div>
                                            <textarea
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                className={`flex-1 p-4 pl-3 bg-transparent font-mono text-[12px] md:text-[13px] leading-[20px] resize-none focus:outline-none scrollbar-thin transition-colors ${workspaceTheme === 'dark' ? 'text-zinc-300 scrollbar-thumb-zinc-800' : 'text-zinc-900 font-medium scrollbar-thumb-zinc-300'}`}
                                                placeholder="Paste your mermaid code here..."
                                                spellCheck="false"
                                            />
                                        </div>
                                    </div>

                                    {!isMobileScreen && (
                                        <div onMouseDown={() => setIsResizingVertical(true)} className="h-6 -my-3 flex items-center justify-center cursor-row-resize z-30 group pointer-events-auto">
                                            <div className={`h-[4px] w-12 rounded-full transition-all group-hover:w-20 ${isResizingVertical ? 'bg-blue-500 w-24' : (workspaceTheme === 'dark' ? 'bg-zinc-800 group-hover:bg-blue-500' : 'bg-zinc-200 group-hover:bg-blue-500')}`} />
                                        </div>
                                    )}

                                    <div
                                        className={`flex flex-col rounded-3xl border transition-all ${workspaceTheme === 'dark' ? 'bg-zinc-950/40 border-white/5' : 'bg-zinc-50/50 border-zinc-100 shadow-sm'}`}
                                        style={isMobileScreen ? { flex: '1 1 40%' } : { height: `${templatesHeight}%`, minHeight: '80px' }}
                                    >
                                        <div className={`px-5 py-3 border-b flex items-center justify-between shrink-0 ${workspaceTheme === 'dark' ? 'border-white/5' : 'border-zinc-100'}`}>
                                            <div className="flex items-center gap-2">
                                                <FaProjectDiagram className="w-3 h-3 text-blue-400" />
                                                <h3 className={`text-[11px] font-bold tracking-tight uppercase ${workspaceTheme === 'dark' ? 'text-zinc-500' : 'text-zinc-600'}`}>Samples</h3>
                                            </div>
                                        </div>
                                        <div className={`flex-1 p-3 flex flex-wrap gap-2 content-start overflow-y-auto custom-workspace-scrollbar ${workspaceTheme === 'dark' ? 'scrollbar-thumb-zinc-800' : 'scrollbar-thumb-zinc-300'}`}>
                                            {TEMPLATES.map(t => (
                                                <button
                                                    key={t.id} onClick={() => handleTemplateInject(t.code)}
                                                    className={`px-3 py-1.5 rounded-xl text-[10px] md:text-[11px] font-bold transition-all border shadow-sm ${workspaceTheme === 'dark' ? 'bg-zinc-800/60 border-white/5 hover:bg-zinc-700 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200/60 hover:bg-zinc-50 text-zinc-600 hover:text-blue-600'}`}
                                                >
                                                    {t.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {isMobileScreen && (
                                        <button onClick={() => setShowPanels(false)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] mt-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">
                                            Apply & Close
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {isResizingVertical && <div className="absolute inset-0 z-[200] select-none bg-transparent" style={{ pointerEvents: 'auto', cursor: 'row-resize' }} />}
        </div>
    );
};

export default MermaidWorkspace;
