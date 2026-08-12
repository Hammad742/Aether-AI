import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaEnvelope, FaLock, FaSpinner, FaEye, FaEyeSlash, FaBolt, FaShieldAlt } from 'react-icons/fa';

const Login = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [googleAuthStep, setGoogleAuthStep] = useState(0);
    const [googlePassword, setGooglePassword] = useState('');
    const [showGooglePassword, setShowGooglePassword] = useState(false);
    const [googleError, setGoogleError] = useState('');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        // Only run on desktop/hover-capable devices
        if (window.matchMedia('(hover: hover)').matches) {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const x = (clientX / innerWidth - 0.5) * 2; // -1 to 1
            const y = (clientY / innerHeight - 0.5) * 2; // -1 to 1
            setMousePos({ x, y });
        }
    };

    const handleMouseLeave = () => {
        setMousePos({ x: 0, y: 0 });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const savedPassword = localStorage.getItem('aetherai_main_password');
        if (savedPassword) {
            if (password !== savedPassword) {
                setError('Incorrect password. Please try again.');
                return;
            }
        } else {
            localStorage.setItem('aetherai_main_password', password);
        }

        setLoading(true);
        // Simulate authentication delay
        setTimeout(() => {
            setLoading(false);
            onLogin();
        }, 800);
    };

    const handleGoogleSignIn = () => {
        setGoogleAuthStep(1);
        setGoogleError('');
        setGooglePassword('');
    };

    const handleGooglePasswordSubmit = (e) => {
        e.preventDefault();
        setGoogleError('');

        const savedGooglePassword = localStorage.getItem('aetherai_google_password');
        if (savedGooglePassword) {
            if (googlePassword !== savedGooglePassword) {
                setGoogleError('Wrong password. Try again.');
                return;
            }
        } else {
            localStorage.setItem('aetherai_google_password', googlePassword);
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onLogin();
        }, 1200);
    };

    const hasPassword = !!localStorage.getItem('aetherai_main_password');

    return (
        <div
            className="min-h-[100dvh] flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#08080a] transition-all duration-700 select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                background: `radial-gradient(circle 800px at ${50 + mousePos.x * 6}% ${50 + mousePos.y * 6}%, rgba(59, 130, 246, 0.02), transparent), #08080a`
            }}
        >
            {/* Diagonal Luminous Horizon Arc */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <svg className="absolute w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Atmospheric Ambient Glow behind the line */}
                    <path 
                        d="M -100 820 C 350 710, 950 510, 1600 320" 
                        stroke="url(#glow-gradient)" 
                        strokeWidth="90" 
                        strokeLinecap="round" 
                        opacity="0.14" 
                        className="blur-[65px]" 
                    />
                    <path 
                        d="M -100 820 C 350 710, 950 510, 1600 320" 
                        stroke="url(#glow-gradient-inner)" 
                        strokeWidth="30" 
                        strokeLinecap="round" 
                        opacity="0.22" 
                        className="blur-[16px]" 
                    />
                    {/* The sharp horizon line */}
                    <path 
                        d="M -100 820 C 350 710, 950 510, 1600 320" 
                        stroke="url(#line-gradient)" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        opacity="0.5" 
                        className="blur-[0.5px]" 
                    />
                    <defs>
                        <linearGradient id="glow-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#1e3a8a" />
                            <stop offset="35%" stopColor="#3b82f6" />
                            <stop offset="65%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>
                        <linearGradient id="glow-gradient-inner" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#1d4ed8" />
                            <stop offset="40%" stopColor="#60a5fa" />
                            <stop offset="70%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>
                        <linearGradient id="line-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                            <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.75" />
                            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.95" />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.35" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Elegant Branding (Top-Left) */}
            <div className="absolute top-8 left-8 sm:top-10 sm:left-12 z-20 select-none">
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d="M12 3V21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
                        <path d="M4 7.5L20 16.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
                        <path d="M20 7.5L4 16.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
                    </svg>
                    <span className="font-space-grotesk font-medium tracking-[0.25em] text-sm text-white">
                        AETHER-AI
                    </span>
                </div>
            </div>

            {/* Premium Login Card */}
            <div 
                className="w-full max-w-[420px] bg-[#16161a]/60 backdrop-blur-3xl border border-white/[0.06] rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-8 relative z-10 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 select-text"
                style={{ minHeight: '440px' }}
            >
                {googleAuthStep === 0 ? (
                    <>
                        {/* Hexagon Logo Header inside Card */}
                        <div className="flex justify-center mb-6">
                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                <svg className="w-7.5 h-7.5 text-white/90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                    <path d="M12 3V21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
                                    <path d="M4 7.5L20 16.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
                                    <path d="M20 7.5L4 16.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
                                </svg>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-normal tracking-tight text-white mb-2">
                                {hasPassword ? 'Welcome back' : 'Welcome'}
                            </h1>
                            <p className="text-xs text-zinc-400 font-normal">
                                {hasPassword ? 'Sign in to continue to your AI workspace' : 'Create a password to start your AI workspace'}
                            </p>
                        </div>

                        {/* Form Inputs */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-normal text-zinc-300 pl-0.5">Email address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-zinc-300 transition-colors duration-200">
                                        <FaEnvelope className="w-3.5 h-3.5" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onInvalid={(e) => e.target.setCustomValidity('Email is required')}
                                        onInput={(e) => { e.target.setCustomValidity(''); setEmail(e.target.value); }}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-[#141417]/50 border border-white/[0.04] hover:border-white/[0.08] focus:border-zinc-600 focus:ring-1 focus:ring-white/[0.02] text-sm text-white placeholder-zinc-600 rounded-xl outline-none transition-all duration-200"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-normal text-zinc-300 pl-0.5">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-zinc-300 transition-colors duration-200">
                                        <FaLock className="w-3.5 h-3.5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onInvalid={(e) => e.target.setCustomValidity('Password is required')}
                                        onInput={(e) => { e.target.setCustomValidity(''); setPassword(e.target.value); setError(''); }}
                                        required
                                        className={`w-full pl-10 pr-10 py-2.5 bg-[#141417]/50 border ${error ? 'border-red-500/70 focus:border-red-500/70 focus:ring-red-500/10' : 'border-white/[0.04] hover:border-white/[0.08] focus:border-zinc-600 focus:ring-1 focus:ring-white/[0.02]'} text-sm text-white placeholder-zinc-600 rounded-xl outline-none transition-all duration-200`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <FaEyeSlash className="w-3.5 h-3.5" /> : <FaEye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                {error && <p className="text-[11px] text-red-400 pl-1 mt-1">{error}</p>}
                            </div>

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 sm:py-3 mt-3 flex items-center justify-between px-5 bg-gradient-to-b from-white to-zinc-200 hover:from-white hover:to-zinc-100 text-zinc-950 rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(255,255,255,0.05)] group"
                            >
                                <span className="flex-1 text-center pl-4">
                                    {loading ? <FaSpinner className="w-4 h-4 animate-spin mx-auto text-zinc-950" /> : "Sign In"}
                                </span>
                                {!loading && <span className="text-zinc-500 font-semibold select-none group-hover:translate-x-0.5 transition-transform duration-200">→</span>}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[0.04]"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] tracking-wide text-zinc-500">
                                <span className="px-3 bg-[#111114]">Or continue with</span>
                            </div>
                        </div>

                        {/* Google button */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-[#1f1f23]/40 border border-white/[0.05] hover:border-white/[0.1] hover:bg-[#1f1f23]/60 text-zinc-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FcGoogle className="w-4 h-4" />
                            Sign in with Google
                        </button>


                    </>
                ) : (
                    <>
                        {/* Google Auth Password Step */}
                        <div className="text-center mb-6 relative">
                            <button
                                type="button"
                                onClick={() => setGoogleAuthStep(0)}
                                className="absolute left-0 top-0 p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-800/40"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </button>
                            <FcGoogle className="w-10 h-10 mx-auto mb-3" />
                            <h1 className="text-xl font-semibold tracking-tight text-white mb-1.5">
                                Verify it's you
                            </h1>
                            <p className="text-xs text-zinc-400 px-4 leading-relaxed">
                                To continue to your AI workspace, please confirm your Google password.
                            </p>

                            <div className="mt-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/[0.05] bg-zinc-950/45 text-xs">
                                <div className="w-4.5 h-4.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                                    {(email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-zinc-300 pr-1">
                                    {email || 'user@example.com'}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleGooglePasswordSubmit} className="space-y-4">
                            {/* Google Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-normal text-zinc-300 pl-0.5">Google Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-zinc-300 transition-colors duration-200">
                                        <FaLock className="w-3.5 h-3.5" />
                                    </div>
                                    <input
                                        type={showGooglePassword ? "text" : "password"}
                                        value={googlePassword}
                                        onInvalid={(e) => e.target.setCustomValidity('Password is required')}
                                        onInput={(e) => { e.target.setCustomValidity(''); setGooglePassword(e.target.value); setGoogleError(''); }}
                                        required
                                        autoFocus
                                        className={`w-full pl-10 pr-10 py-2.5 bg-zinc-950/45 border ${googleError ? 'border-red-500/70 focus:border-red-500/70 focus:ring-red-500/10' : 'border-white/[0.04] hover:border-white/[0.08] focus:border-zinc-700 focus:ring-1 focus:ring-white/[0.03]'} text-sm text-white placeholder-zinc-600 rounded-xl outline-none transition-all duration-200`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowGooglePassword(!showGooglePassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                                    >
                                        {showGooglePassword ? <FaEyeSlash className="w-3.5 h-3.5" /> : <FaEye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                {googleError && <p className="text-[11px] text-red-400 pl-1 mt-1">{googleError}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !googlePassword.trim()}
                                className="w-full py-2.5 sm:py-3 mt-3 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(59,130,246,0.15)]"
                            >
                                {loading ? <FaSpinner className="w-4 h-4 animate-spin text-white" /> : "Continue"}
                            </button>
                        </form>
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 flex flex-col items-center gap-2 text-[10px] tracking-wide text-zinc-500 font-normal select-none pointer-events-none text-center px-4 w-full">
                <div className="flex items-center gap-4 text-zinc-400">
                    <span className="flex items-center gap-1.5">
                        <FaLock className="w-3 h-3 text-zinc-500" /> Secure
                    </span>
                    <span className="text-zinc-800">|</span>
                    <span className="flex items-center gap-1.5">
                        <FaBolt className="w-3 h-3 text-zinc-500" /> Fast
                    </span>
                    <span className="text-zinc-800">|</span>
                    <span className="flex items-center gap-1.5">
                        <FaShieldAlt className="w-3 h-3 text-zinc-500" /> Private
                    </span>
                </div>
                <div className="text-zinc-600">© 2025 Aether-AI. All rights reserved.</div>
            </div>
        </div>
    );
};

export default Login;
