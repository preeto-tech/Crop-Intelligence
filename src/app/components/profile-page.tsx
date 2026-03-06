import { useEffect, useState } from 'react';
import { User, Mail, Shield, LogOut, Loader2, ArrowLeft } from 'lucide-react';

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export function ProfilePage({ token, onLogout, onNavigate }: { token: string | null, onLogout: () => void, onNavigate: (view: string) => void }) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                setError('Not authenticated');
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                let data;
                const text = await response.text();
                try {
                    data = text ? JSON.parse(text) : {};
                } catch (e) {
                    data = { message: 'Invalid response from server' };
                }

                if (!response.ok) {
                    throw new Error(data?.message || 'Failed to fetch profile. Please log in again.');
                }

                setProfile(data);
            } catch (err: any) {
                setError(err.message || 'Error loading profile');
                onLogout(); // Force logout if profile fetch fails
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [token, onLogout]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                <p className="text-slate-600">Loading your profile...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-slate-500 animate-in fade-in slide-in-from-bottom-4">
                <Shield className="w-16 h-16 mb-4 text-red-400 opacity-50" />
                <p className="text-xl font-medium text-slate-800 mb-2">Authentication Error</p>
                <p className="mb-6">{error || 'Please log in to view this page'}</p>
                <button
                    onClick={() => onNavigate('login')}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        My Profile
                    </h1>
                    <p className="text-sm md:text-base text-slate-500 mt-1">
                        Manage your account details and preferences
                    </p>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-colors font-medium text-sm md:text-base"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                </button>
            </div>

            {/* Main Profile Card */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden relative">
                <div className="h-32 md:h-48 bg-gradient-to-r from-green-500 to-emerald-700 relative">
                    <img
                        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxmYXJtZXIlMjBiYWNrZ3JvdW5kfGVufDF8fHx8MTc3MjQ3MTEyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                        alt="Farm landscape"
                    />
                </div>

                <div className="px-6 md:px-10 pb-10 relative">
                    {/* Avatar Profile Picture */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-slate-100 shadow-xl flex items-center justify-center mx-auto md:mx-0 absolute -top-12 md:-top-16 left-0 right-0 md:left-10 md:right-auto overflow-hidden">
                        <User className="w-12 h-12 md:w-16 md:h-16 text-slate-300" />
                        <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}&backgroundColor=059669`}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="mt-16 md:mt-20 md:ml-40 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{profile.name}</h2>
                            <p className="text-slate-500 font-medium capitalize mt-1 flex items-center justify-center md:justify-start gap-1.5">
                                <Shield className="w-4 h-4" />
                                {profile.role} Account
                            </p>
                        </div>

                        <button className="w-full md:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium">
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Personal Details */}
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4">
                        Personal Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                                <User className="w-4 h-4" /> Full Name
                            </p>
                            <p className="text-slate-800 bg-slate-50 border border-slate-100 p-3 rounded-lg font-medium">
                                {profile.name}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                                <Mail className="w-4 h-4" /> Email Address
                            </p>
                            <p className="text-slate-800 bg-slate-50 border border-slate-100 p-3 rounded-lg font-medium">
                                {profile.email}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">User ID</p>
                            <p className="text-slate-500 bg-slate-50 border border-slate-100 p-3 rounded-lg font-mono text-xs">
                                {profile._id}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Account Settings / Preferences */}
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4">
                        Account Preferences
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-green-900">Email Notifications</p>
                                <p className="text-xs text-green-700 mt-0.5">Receive updates about your crops</p>
                            </div>
                            <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer shadow-inner">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-slate-900">SMS Alerts</p>
                                <p className="text-xs text-slate-500 mt-0.5">Mandi price drops and weather alerts</p>
                            </div>
                            <div className="w-10 h-5 bg-slate-300 rounded-full relative cursor-pointer shadow-inner">
                                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>

                        <button className="w-full mt-2 p-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl transition-all">
                            Manage Security Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
