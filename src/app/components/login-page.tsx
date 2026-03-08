import { useState } from 'react';
import { Sms, Lock, ArrowRight, Magicpen } from 'iconsax-react';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';

export function LoginPage({ onNavigate, onLoginSuccess }: { onNavigate: (path: string) => void, onLoginSuccess: (token: string, user: any) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            let data;
            const text = await response.text();
            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                data = { message: 'Invalid response from server' };
            }

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to login');
            }

            onLoginSuccess(data.token, data.user);
        } catch (err: any) {
            setError(err.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex font-[Inter,system-ui,sans-serif] overflow-hidden">

            {/* ──── Left: Full-height Image ──── */}
            <div className="hidden lg:block lg:w-[55%] relative">
                <img
                    src="https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=1200&q=85&fit=crop"
                    alt="Farmer at sunrise"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-green-950/40" />

                {/* Branding overlay */}
                <div className="absolute inset-0 z-10 flex flex-col justify-between p-12">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="FarmIQ" className="h-9 w-auto" />
                        <span className="text-xl font-extrabold text-white tracking-tight">
                            Farm<span className="text-green-400">IQ</span>
                        </span>
                    </div>

                    {/* Bottom content */}
                    <div className="max-w-md">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-green-500/20 backdrop-blur-md border border-green-400/30 flex items-center justify-center">
                                <Magicpen size={18} variant="Bold" color="#4ade80" />
                            </div>
                            <span className="text-xs font-bold text-green-300 tracking-widest uppercase">AI-Powered</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-white leading-[1.15] mb-4 tracking-tight">
                            Empowering Every Harvest
                        </h2>
                        <p className="text-white/60 text-base leading-relaxed">
                            Join farmers across India using AI to optimize yield, discover the best mandi prices, and make smarter decisions every season.
                        </p>
                    </div>
                </div>
            </div>

            {/* ──── Right: Form ──── */}
            <div className="w-full lg:w-[45%] flex items-center justify-center bg-[#fafbfc] p-6 sm:p-10 lg:p-16 relative">
                {/* Mobile logo */}
                <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
                    <img src="/logo.png" alt="FarmIQ" className="h-8 w-auto" />
                    <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                        Farm<span className="text-green-500">IQ</span>
                    </span>
                </div>

                <div className="w-full max-w-[420px]">
                    <div className="mb-10">
                        <h1 className="text-3xl sm:text-[2.2rem] font-extrabold text-slate-900 tracking-tight mb-2">
                            Welcome back
                        </h1>
                        <p className="text-slate-500 text-[0.95rem]">
                            Enter your credentials to access your dashboard
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Sms size={18} className="text-slate-400 group-focus-within:text-green-600 transition-colors" variant="Bold" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl transition-all outline-none text-sm placeholder:text-slate-400"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <a href="#" className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-400 group-focus-within:text-green-600 transition-colors" variant="Bold" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl transition-all outline-none text-sm placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-13 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-[0.92rem] shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all active:scale-[0.98] gap-2 mt-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <button
                            onClick={() => onNavigate('signup')}
                            className="text-green-600 font-bold hover:text-green-700 transition-colors"
                        >
                            Create one now
                        </button>
                    </p>

                    <p className="mt-12 text-center text-xs text-slate-400">
                        © {new Date().getFullYear()} FarmIQ. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
