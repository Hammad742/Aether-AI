import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaEnvelope, FaLock, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import AetherLogo from './AetherLogo';

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

    return (
        // Replaced min-h-screen with min-h-[100dvh] to prevent horrific mobile address-bar resize trailing repaints.
        <div
            className="min-h-[100dvh] flex items-center justify-center p-4 relative overflow-hidden bg-black"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Elegant Branding (V6: Node-Link Logo Integration) */}
            <div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-[10] select-none group">
                <div className="relative px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-white/10 group-hover:border-white/20 group-hover:drop-shadow-[0_0_50px_rgba(255,255,255,0.2)] flex items-center gap-4 overflow-hidden">
                    {/* Branding Logo (Crystalline Prism SVG) */}
                    <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
                        {/* Base Logo & Facets */}
                        <svg className="w-full h-full relative z-10 text-white/70 transition-colors duration-[1000ms] group-hover:text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M12 3V21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                            <path d="M4 7.5L20 16.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                            <path d="M20 7.5L4 16.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />

                            {/* Spectral Orbit Border Animation (Looped tracing) */}
                            <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" className="animate-spectral-orbit" style={{ opacity: 0.1 }} />
                        </svg>

                        {/* Logo Chromatic Ghosts */}
                        <svg className="absolute inset-0 z-0 text-cyan-400/0 group-hover:text-cyan-400/60 transition-all duration-1000 blur-[2px] animate-chroma pointer-events-none select-none" viewBox="0 0 24 24" fill="none" style={{ '--chroma-offset-x': '-3px', '--chroma-offset-y': '1px' }}>
                            <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M12 3V21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                            <path d="M4 7.5L20 16.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                            <path d="M20 7.5L4 16.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                        </svg>
                        <svg className="absolute inset-0 z-0 text-magenta-500/0 group-hover:text-magenta-500/60 transition-all duration-1000 blur-[2px] animate-chroma pointer-events-none select-none" viewBox="0 0 24 24" fill="none" style={{ '--chroma-offset-x': '3px', '--chroma-offset-y': '-1px', animationDelay: '-1s' }}>
                            <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M12 3V21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                            <path d="M4 7.5L20 16.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                            <path d="M20 7.5L4 16.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                        </svg>
                    </div>

                    <div className="relative font-space-grotesk font-bold tracking-[0.3em] text-2xl sm:text-3xl text-white/70 dark:text-custom-primary/80 transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-white cursor-default flex items-center justify-center">
                        {/* Base Text */}
                        <span className="relative z-10">AETHER-AI</span>

                        {/* Text Chromatic Ghosts */}
                        <span className="absolute inset-0 z-0 text-cyan-400/0 group-hover:text-cyan-400/60 transition-all duration-1000 blur-[2px] animate-chroma pointer-events-none select-none" style={{ '--chroma-offset-x': '-3px', '--chroma-offset-y': '1px' }}>
                            AETHER-AI
                        </span>
                        <span className="absolute inset-0 z-0 text-magenta-500/0 group-hover:text-magenta-500/60 transition-all duration-1000 blur-[2px] animate-chroma pointer-events-none select-none" style={{ '--chroma-offset-x': '3px', '--chroma-offset-y': '-1px', animationDelay: '-1s' }}>
                            AETHER-AI
                        </span>
                    </div>

                    {/* Laser Lens Flare Sweep (Scanning Logo + Text) */}
                    <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                        <div className="absolute inset-0 laser-flare animate-laser" />
                    </div>
                </div>
            </div>

            {/* Interactive Parallax Background Layer */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[600ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] scale-[1.10] will-change-transform pointer-events-none z-0"
                style={{
                    backgroundImage: 'url("/249037e8d6daa355b289ea8e8a6db766.jpg")',
                    transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 20}px, 0) scale(1.10)`
                }}
            ></div>

            {/* Subtle overlay to ensure global text contrast without hiding the gorgeous background */}
            <div className="absolute inset-0 bg-white/5 dark:bg-black/35 transition-colors duration-500 pointer-events-none z-[1]"></div>

            {/* Background Animations: Floating Particles & Shooting Stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Shooting Stars */}
                <div className="absolute top-[10%] left-[-50px] w-[2px] h-[2px] bg-white rounded-full shadow-[0_0_10px_white] animate-shooting-star" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-[30%] left-[-50px] w-[1.5px] h-[1.5px] bg-white rounded-full shadow-[0_0_8px_white] animate-shooting-star" style={{ animationDelay: '7s' }}></div>
                <div className="absolute top-[15%] left-[-50px] w-[1px] h-[1px] bg-white rounded-full shadow-[0_0_6px_white] animate-shooting-star" style={{ animationDelay: '14s' }}></div>

                {/* Floating Ethereal Orbs */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] animate-float-orb" style={{ animationDelay: '0s' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] animate-float-orb" style={{ animationDelay: '4s' }}></div>
                <div className="absolute top-2/3 left-1/2 w-24 h-24 bg-indigo-500/10 rounded-full blur-[40px] animate-float-orb" style={{ animationDelay: '8s' }}></div>
            </div>

            {/* Pure Glassmorphism Login Card wrapper  */}
            {/* The custom text-shadow logic creates perfect readable "halos" in respective modes without ruining the crystal clear card transparency */}
            <div className="w-full max-w-md bg-white/10 dark:bg-black/20 backdrop-blur-[24px] border border-white/40 dark:border-white/10 rounded-3xl sm:rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 sm:p-8 relative overflow-hidden z-10 transition-colors duration-300 transform-gpu will-change-transform [&_h1]:text-white [&_h1]:drop-shadow-md dark:[&_h1]:text-custom-primary dark:[&_h1]:[text-shadow:_0_2px_12px_rgba(0,0,0,0.9)] dark:[&_h1]:drop-shadow-none [&_p]:text-white/90 [&_p]:drop-shadow-sm dark:[&_p]:text-custom-secondary dark:[&_p]:[text-shadow:_0_2px_8px_rgba(0,0,0,0.9)] dark:[&_p]:drop-shadow-none [&_label]:text-white/90 [&_label]:drop-shadow-sm dark:[&_label]:text-custom-primary dark:[&_label]:[text-shadow:_0_2px_8px_rgba(0,0,0,0.9)] dark:[&_label]:drop-shadow-none" style={{ minHeight: '400px' }}>

                {googleAuthStep === 0 ? (
                    <>
                        {/* Header Section */}
                        <div className="text-center mb-6 sm:mb-8">
                            <div className="flex justify-center mb-4 sm:mb-6">
                                <AetherLogo size="lg" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-custom-primary mb-2">
                                {localStorage.getItem('aetherai_main_password') ? 'Welcome Back' : 'Welcome'}
                            </h1>
                            <p className="text-custom-secondary text-sm">
                                {localStorage.getItem('aetherai_main_password') ? 'Sign in to continue to your AI Workspace' : 'Create an account to start your AI Workspace'}
                            </p>
                        </div>

                        {/* Authentication Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

                            {/* Email Input */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-custom-primary pl-1">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-custom-secondary">
                                        <FaEnvelope className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onInvalid={(e) => e.target.setCustomValidity('Email is Required')}
                                        onInput={(e) => { e.target.setCustomValidity(''); setEmail(e.target.value); }}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-custom-tertiary border border-custom focus:border-custom-primary text-custom-primary placeholder-custom-secondary rounded-xl outline-none transition-all duration-200"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-custom-primary pl-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-custom-secondary">
                                        <FaLock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onInvalid={(e) => e.target.setCustomValidity('Password is Required')}
                                        onInput={(e) => { e.target.setCustomValidity(''); setPassword(e.target.value); setError(''); }}
                                        required
                                        className={`w-full pl-10 pr-10 py-2.5 sm:py-3 bg-custom-tertiary border ${error ? 'border-red-500 focus:border-red-500' : 'border-custom focus:border-custom-primary'} text-custom-primary placeholder-custom-secondary rounded-xl outline-none transition-all duration-200`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-custom-secondary hover:text-custom-primary transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {error && <p className="text-xs text-red-500 pl-1 mt-1">{error}</p>}
                            </div>

                            {/* Primary Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 sm:py-3.5 mt-1 sm:mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-secondary))] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                            >
                                {loading ? <FaSpinner className="w-5 h-5 animate-spin" /> : "Sign In"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-5 sm:my-7">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-custom"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-custom-secondary px-4 text-custom-secondary">Or continue with</span>
                            </div>
                        </div>

                        {/* Secondary Google Auth Button */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-2.5 sm:py-3 px-4 bg-custom-tertiary border border-custom hover:border-custom-primary text-custom-primary rounded-xl font-medium transition-all duration-200 hover:bg-custom-secondary hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        >
                            <FcGoogle className="w-5 h-5" />
                            Sign in with Google
                        </button>
                    </>
                ) : (
                    <>
                        {/* Google Auth Password Step */}
                        <div className="text-center mb-5 sm:mb-6 relative">
                            <button
                                type="button"
                                onClick={() => setGoogleAuthStep(0)}
                                className="absolute left-0 top-0 p-2 text-custom-secondary hover:text-custom-primary transition-colors rounded-full hover:bg-custom-tertiary"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </button>
                            <FcGoogle className="w-12 h-12 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold tracking-tight text-custom-primary mb-2">
                                Verify it's you
                            </h1>
                            <p className="text-custom-secondary text-sm">
                                To continue to your AI Workspace, please confirm your Google password.
                            </p>

                            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-custom bg-custom-tertiary transition-colors">
                                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                                    {(email || 'H').charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-custom-primary pr-1">
                                    {email || 'hammad_k@gmail.com'}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleGooglePasswordSubmit} className="space-y-4 sm:space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-custom-primary pl-1">Google Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-custom-secondary">
                                        <FaLock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showGooglePassword ? "text" : "password"}
                                        value={googlePassword}
                                        onInvalid={(e) => e.target.setCustomValidity('Password is Required')}
                                        onInput={(e) => { e.target.setCustomValidity(''); setGooglePassword(e.target.value); setGoogleError(''); }}
                                        required
                                        autoFocus
                                        className={`w-full pl-10 pr-10 py-2.5 sm:py-3 bg-custom-tertiary border ${googleError ? 'border-red-500 focus:border-red-500' : 'border-custom focus:border-blue-500'} text-custom-primary placeholder-custom-secondary rounded-xl outline-none transition-all duration-200`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowGooglePassword(!showGooglePassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-custom-secondary hover:text-custom-primary transition-colors focus:outline-none"
                                    >
                                        {showGooglePassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {googleError && <p className="text-xs text-red-500 pl-1 mt-1">{googleError}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !googlePassword.trim()}
                                className="w-full py-3 sm:py-3.5 mt-1 sm:mt-0 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                            >
                                {loading ? <FaSpinner className="w-5 h-5 animate-spin" /> : "Continue"}
                            </button>
                        </form>
                    </>
                )}

            </div>
        </div>
    );
};

export default Login;
