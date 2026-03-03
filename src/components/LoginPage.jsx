import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FaGoogle, FaProjectDiagram, FaArrowRight, FaChevronLeft } from 'react-icons/fa';
import loginBg from '../assets/login-bg.jpg';

const LoginPage = () => {
    const { loginWithGoogle, loading } = useAuth();
    const { t } = useLanguage();

    // Auth Steps: 'initial' -> 'email' -> 'password'
    const [step, setStep] = useState('initial');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Mouse movement for subtle parallax
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 30;
        const y = (clientY / window.innerHeight - 0.5) * 30;
        setMousePos({ x, y });
    };

    const handleInitialClick = () => {
        setStep('email');
    };

    const handleEmailNext = (e) => {
        e.preventDefault();
        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }
        setError('');
        setStep('password');
    };

    const handlePasswordNext = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }

        const credsKey = `aether_creds_${btoa(email)}`;
        const storedPassword = localStorage.getItem(credsKey);

        if (storedPassword) {
            if (password !== storedPassword) {
                setError('Wrong password. Try again.');
                return;
            }
        } else {
            // First time login - save password
            localStorage.setItem(credsKey, password);
        }

        await loginWithGoogle(email);
    };

    const goBack = () => {
        if (step === 'password') setStep('email');
        else if (step === 'email') setStep('initial');
        setError('');
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950 overflow-hidden px-4 sm:px-6 transition-colors duration-500"
        >
            {/* --- CUSTOM USER BACKGROUND --- */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    transform: `scale(1.1) translate(${mousePos.x}px, ${mousePos.y}px)`,
                    transition: 'transform 0.2s ease-out'
                }}
            >
                <img
                    src={loginBg}
                    alt="Background"
                    className="w-full h-full object-cover transition-all duration-700"
                />
                {/* Visual Polish Overlays - Minimal for footer readability only */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 dark:bg-black/30" />

                {/* Technical Dot Grid (Subtle overlay for consistency) */}
                <div className="absolute inset-0 opacity-[0.1] dot-grid mask-radial-fade text-white" />
            </div>
            {/* --- END CUSTOM BACKGROUND --- */}

            {/* Glass Login Card - ULTRA TRANSPARENT REDESIGN */}
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 z-10">
                <div className="backdrop-blur-2xl bg-white/5 dark:bg-black/20 border border-white/20 dark:border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[500px] transition-all duration-300">

                    {/* Content Wrapper (Grows to push footer down) */}
                    <div className="flex-1 w-full flex flex-col items-center justify-center">
                        {/* Back Button (Conditional) */}
                        {step !== 'initial' && !loading && (
                            <button
                                onClick={goBack}
                                className="absolute top-8 left-8 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"
                            >
                                <FaChevronLeft className="w-4 h-4" />
                            </button>
                        )}

                        {/* Logo Section */}
                        <div className="mb-8 relative group">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-accent-DEFAULT/20 animate-logo-nebula shadow-[0_0_25px_rgba(0,0,0,0.15)] dark:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                <FaProjectDiagram className="w-10 h-10 text-accent-DEFAULT group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                            </div>
                        </div>

                        {/* Step Content Container */}
                        <div className="w-full text-center flex flex-col items-center">
                            {step === 'initial' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-zinc-950 to-zinc-700 dark:from-white dark:to-zinc-300 mb-2 filter drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                        Aether AI
                                    </h1>
                                    <p className="text-zinc-800 dark:text-zinc-200 mb-10 text-sm sm:text-base leading-relaxed font-semibold drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]">
                                        The ultimate premium workspace for intelligence and creativity.
                                    </p>
                                    <button
                                        onClick={handleInitialClick}
                                        className="w-full group relative flex items-center justify-center gap-3 py-4 glass-apple-blue dark:bg-blue-600/10 border border-blue-400/30 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/5 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        <FaGoogle className="w-5 h-5 text-blue-500 group-hover:rotate-12 transition-transform" />
                                        <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                                            Continue with Google
                                        </span>
                                    </button>
                                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-300 uppercase tracking-widest font-bold">
                                        <span className="w-10 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
                                        Secure social entry
                                        <span className="w-10 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
                                    </div>
                                </div>
                            )}

                            {step === 'email' && (
                                <form onSubmit={handleEmailNext} className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-white mb-2">Sign in</h2>
                                    <p className="text-zinc-500 dark:text-zinc-300 mb-8">Use your Google Account</p>

                                    <div className="text-left mb-6">
                                        <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-300 uppercase tracking-wider mb-2 px-1">Email or phone</label>
                                        <input
                                            type="email"
                                            autoFocus
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full px-5 py-4 bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-zinc-800 dark:text-white"
                                            required
                                        />
                                        {error && <p className="mt-2 text-xs text-red-500 px-1">{error}</p>}
                                    </div>

                                    <div className="flex items-center justify-end gap-4 mt-8 pb-4">
                                        <button
                                            type="submit"
                                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all hover:shadow-lg shadow-blue-500/20"
                                        >
                                            Next <FaArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 'password' && (
                                <form onSubmit={handlePasswordNext} className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center justify-center gap-3 mb-6 bg-zinc-100 dark:bg-zinc-800/50 py-2 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 w-fit mx-auto transition-all">
                                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">
                                            {email.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{email}</span>
                                    </div>

                                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-white mb-2">Welcome</h2>
                                    <p className="text-zinc-500 dark:text-zinc-300 mb-8">Enter your password</p>

                                    <div className="text-left mb-6">
                                        <input
                                            type="password"
                                            autoFocus
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full px-5 py-4 bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-zinc-800 dark:text-white"
                                            required
                                        />
                                        {error && <p className="mt-2 text-xs text-red-500 px-1">{error}</p>}
                                    </div>

                                    <div className="flex items-center justify-end gap-4 mt-8 pb-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center gap-2 transition-all hover:shadow-lg shadow-blue-500/20"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>Next <FaArrowRight className="w-3 h-3" /></>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Footer Info (Now part of the flow) */}
                    <div className="pt-8 pb-2 text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-300 text-center animate-in fade-in duration-1000 font-medium">
                        By continuing, you agree to Aether’s premium standards of excellence.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
