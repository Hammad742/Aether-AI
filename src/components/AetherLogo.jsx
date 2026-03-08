import React from 'react';

const AetherLogo = ({ size = "lg", className = "" }) => {
    const sizes = {
        sm: "w-8 h-8",
        md: "w-16 h-16",
        lg: "w-24 h-24 sm:w-32 sm:h-32"
    };

    return (
        <div className={`relative flex items-center justify-center ${sizes[size]} ${className}`}>
            {/* Core Glow Layer (Hardware Accelerated) */}
            <div className="absolute inset-0 bg-blue-500/20 blur-[30px] rounded-full animate-pulse-gentle"></div>
            
            <svg 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            >
                {/* Outer Orbital Ring */}
                <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    stroke="currentColor" 
                    strokeWidth="0.5" 
                    strokeDasharray="10 20" 
                    className="text-blue-400/30 animate-spin-slow" 
                />
                
                {/* Middle Orbital Ring */}
                <circle 
                    cx="50" 
                    cy="50" 
                    r="35" 
                    stroke="currentColor" 
                    strokeWidth="1" 
                    strokeDasharray="40 10" 
                    className="text-purple-400/40 animate-spin-reverse-medium" 
                />
                
                {/* Inner Static Ring */}
                <circle 
                    cx="50" 
                    cy="50" 
                    r="25" 
                    stroke="url(#logo-grad)" 
                    strokeWidth="2" 
                    className="opacity-80"
                />

                {/* The Central Aether Orb */}
                <circle 
                    cx="50" 
                    cy="50" 
                    r="12" 
                    fill="url(#logo-grad)" 
                    className="animate-pulse-core"
                />

                {/* Orbital Nodes (Small dots representing AI nodes) */}
                <g className="animate-spin-medium origin-center">
                    <circle cx="50" cy="15" r="2.5" fill="#60A5FA" />
                </g>
                <g className="animate-spin-slow origin-center">
                    <circle cx="85" cy="50" r="1.5" fill="#A78BFA" />
                </g>

                <defs>
                    <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default AetherLogo;
