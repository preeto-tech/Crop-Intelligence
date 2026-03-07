import { useState, useEffect } from 'react';
import { Sms, Lock, ArrowRight, Magicpen, UserSquare, ShieldTick } from 'iconsax-react';
import { Loader2 } from 'lucide-react';
import { Wheat, Tag, MapPin } from 'lucide-react';
import { PlacesAutocomplete } from './places-autocomplete';
import { Button } from './ui/button';

export function SignupPage({ onNavigate, onLoginSuccess }: { onNavigate: (path: string) => void, onLoginSuccess: (token: string, user: any) => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('farmer');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data.city && data.region) {
                    setLocation(`${data.city}, ${data.region}`);
                }
            } catch (err) {
                console.error('Failed to auto-fetch location:', err);
            }
        };
        fetchLocation();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('https://backend-crop-intelligence.onrender.com/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role, location, phone }),
            });

            let data;
            const text = await response.text();
            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                data = { message: 'Invalid response from server' };
            }

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to sign up');
            }

            onLoginSuccess(data.token, data.user);
        } catch (err: any) {
            setError(err.message || 'An error occurred during sign up');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex font-[Inter,system-ui,sans-serif] overflow-hidden">

            {/* ──── Left: Form ──── */}
            <div className="w-full lg:w-[45%] flex items-center justify-center bg-[#fafbfc] p-6 sm:p-10 lg:p-16 relative overflow-y-auto">
                {/* Mobile logo */}
                <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
                    <img src="/logo.png" alt="FarmIQ" className="h-8 w-auto" />
                    <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                        Farm<span className="text-green-500">IQ</span>
                    </span>
                </div>

                <div className="w-full max-w-[420px]">
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-[2.2rem] font-extrabold text-slate-900 tracking-tight mb-2">
                            Create account
                        </h1>
                        <p className="text-slate-500 text-[0.95rem]">
                            Join our growing community of smart farmers
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <UserSquare size={18} className="text-slate-400 group-focus-within:text-green-600 transition-colors" variant="Bold" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl transition-all outline-none text-sm placeholder:text-slate-400"
                                    placeholder="Rajesh Kumar"
                                />
                            </div>
                        </div>

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
                                <label className="text-sm font-semibold text-slate-700">Location (District, State)</label>
                                {location && (
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                                        <MapPin className="w-2.5 h-2.5" />
                                        Auto-detected
                                    </span>
                                )}
                            </div>
                            <PlacesAutocomplete
                                onSelect={(address) => setLocation(address)}
                                defaultValue={location}
                                placeholder="Search your village/city..."
                                className="group"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Phone (Optional)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Sms size={18} className="text-slate-400 group-focus-within:text-green-600 transition-colors" variant="Bold" />
                                </div>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl transition-all outline-none text-sm placeholder:text-slate-400"
                                    placeholder="9876543210"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Password</label>
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

                        {/* Role Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">I am a</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRole('farmer')}
                                    className={`border rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all ${role === 'farmer'
                                        ? 'border-green-500 bg-green-50 ring-4 ring-green-100 shadow-sm'
                                        : 'border-slate-200 bg-white hover:border-green-300 hover:bg-green-50/30'
                                        }`}
                                >
                                    <Wheat className={`w-5 h-5 ${role === 'farmer' ? 'text-green-600' : 'text-slate-400'}`} />
                                    <span className={`text-[10px] font-bold ${role === 'farmer' ? 'text-green-700' : 'text-slate-500'} uppercase tracking-wider`}>Farmer</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRole('buyer')}
                                    className={`border rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all ${role === 'buyer'
                                        ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100 shadow-sm'
                                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                                        }`}
                                >
                                    <Tag className={`w-5 h-5 ${role === 'buyer' ? 'text-blue-600' : 'text-slate-400'}`} />
                                    <span className={`text-[10px] font-bold ${role === 'buyer' ? 'text-blue-700' : 'text-slate-500'} uppercase tracking-wider`}>Buyer</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRole('transporter')}
                                    className={`border rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all ${role === 'transporter'
                                        ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100 shadow-sm'
                                        : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
                                        }`}
                                >
                                    <div className={`w-5 h-5 flex items-center justify-center`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${role === 'transporter' ? 'text-orange-600' : 'text-slate-400'}`}>
                                            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-2.035-2.585A1 1 0 0 0 17.971 10H15v8" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
                                        </svg>
                                    </div>
                                    <span className={`text-[10px] font-bold ${role === 'transporter' ? 'text-orange-700' : 'text-slate-500'} uppercase tracking-wider`}>Driver</span>
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"

                            disabled={isLoading}
                            className="w-full h-13 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-[0.92rem] shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all active:scale-[0.98] gap-2 mt-1"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="mt-7 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <button
                            onClick={() => onNavigate('login')}
                            className="text-green-600 font-bold hover:text-green-700 transition-colors"
                        >
                            Sign in
                        </button>
                    </p>

                    <p className="mt-10 text-center text-xs text-slate-400">
                        © {new Date().getFullYear()} FarmIQ. All rights reserved.
                    </p>
                </div>
            </div>

            {/* ──── Right: Full-height Image ──── */}
            <div className="hidden lg:block lg:w-[55%] relative">
                <img
                    src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=85&fit=crop"
                    alt="Agriculture technology"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-bl from-black/60 via-black/30 to-green-950/40" />

                {/* Branding overlay */}
                <div className="absolute inset-0 z-10 flex flex-col justify-between p-12">
                    {/* Top right */}
                    <div className="self-end">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
                            <ShieldTick size={16} variant="Bold" color="#4ade80" />
                            <span className="text-xs font-bold text-white/80">Secure & Verified</span>
                        </div>
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
                            Grow Your Future with Data
                        </h2>
                        <p className="text-white/60 text-base leading-relaxed">
                            Create an account to track crops, monitor mandi prices in real-time, and get AI-driven insights customized for your farm.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
