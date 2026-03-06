import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Wheat, Loader2, Tag } from 'lucide-react';

export function SignupPage({ onNavigate, onLoginSuccess }: { onNavigate: (path: string) => void, onLoginSuccess: (token: string, user: any) => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('farmer'); // Default role
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, role }),
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

            // Automatically log them in or set token
            onLoginSuccess(data.token, data.user);
        } catch (err: any) {
            setError(err.message || 'An error occurred during sign up');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-full max-w-6xl bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden flex flex-col lg:flex-row-reverse">

                {/* Right Side - Image & Branding (Reversed for distinction) */}
                <div className="w-full lg:w-5/12 relative hidden md:block">
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-800/40 to-transparent z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxhZ3JpY3VsdHVyZXxlbnwwfHx8fDE3NzI0NzEwMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt="Agriculture technology"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-10 text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                                <Wheat className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-4xl font-bold mb-4 leading-tight">Grow Your Future</h3>
                        <p className="text-emerald-50 max-w-md text-lg opacity-90">
                            Create an account to track crops, manage logistics, and get AI-driven insights customized for your farm.
                        </p>
                    </div>
                </div>

                {/* Left Side - Form */}
                <div className="w-full lg:w-7/12 p-8 md:p-10 lg:p-14 flex flex-col justify-center bg-white/40">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-8 text-center lg:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
                                Create Account
                            </h2>
                            <p className="text-slate-600 text-lg">
                                Join our agricultural community today
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl transition-all outline-none"
                                        placeholder="Rajesh Kumar"
                                    />
                                </div>
                            </div>

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
                                <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
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

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Role</label>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <label
                                        className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${role === 'farmer'
                                            ? 'border-green-500 bg-green-50 text-green-800 shadow-sm'
                                            : 'border-slate-200 bg-white/50 text-slate-500 hover:border-green-300 hover:bg-green-50/50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="farmer"
                                            checked={role === 'farmer'}
                                            onChange={() => setRole('farmer')}
                                            className="hidden"
                                        />
                                        <Wheat className={`w-6 h-6 mb-2 ${role === 'farmer' ? 'text-green-600' : 'text-slate-400'}`} />
                                        <span className="font-medium text-sm">Farmer</span>
                                    </label>

                                    <label
                                        className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${role === 'buyer'
                                            ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm'
                                            : 'border-slate-200 bg-white/50 text-slate-500 hover:border-blue-300 hover:bg-blue-50/50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="buyer"
                                            checked={role === 'buyer'}
                                            onChange={() => setRole('buyer')}
                                            className="hidden"
                                        />
                                        <Tag className={`w-6 h-6 mb-2 ${role === 'buyer' ? 'text-blue-600' : 'text-slate-400'}`} />
                                        <span className="font-medium text-sm">Buyer</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 mt-2 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/30 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign Up
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-600">
                                Already have an account?{' '}
                                <button
                                    onClick={() => onNavigate('login')}
                                    className="text-green-600 font-semibold hover:text-green-700 transition-colors"
                                >
                                    Sign in
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
