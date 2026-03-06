import { useState } from 'react';
import { Mail, Lock, ArrowRight, Wheat, Loader2 } from 'lucide-react';

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
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
        <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-full max-w-6xl bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden flex flex-col lg:flex-row">

                {/* Left Side - Image & Branding */}
                <div className="w-full lg:w-5/12 relative hidden md:block">
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-800/40 to-transparent z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1590682680695-43b964a3ae17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxmYXJtZXIlMjBzdW5yaXNlfGVufDF8fHx8MTc3MjQ3MDEwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt="Farmer at sunrise"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-10 text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                                <Wheat className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Crop Intel</h2>
                        </div>
                        <h3 className="text-4xl font-bold mb-4 leading-tight">Empowering Every Harvest</h3>
                        <p className="text-emerald-50 max-w-md text-lg opacity-90">
                            Join thousands of farmers using AI to optimize their yield, connect directly with mandis, and manage transport seamlessly.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white/40">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
                                Welcome Back
                            </h2>
                            <p className="text-slate-600 text-lg">
                                Enter your details to access your dashboard
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl transition-all outline-none"
                                        placeholder="farmer@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <a href="#" className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-xl shadow-green-600/20 hover:shadow-green-600/30 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-600">
                                Don't have an account?{' '}
                                <button
                                    onClick={() => onNavigate('signup')}
                                    className="text-green-600 font-semibold hover:text-green-700 transition-colors"
                                >
                                    Create one now
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
