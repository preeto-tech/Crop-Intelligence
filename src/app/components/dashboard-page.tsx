import { useState, useEffect } from 'react';
import { Sparkles, Navigation } from 'lucide-react';
import { Cloud, Sun1, Magicpen, Book1, Truck, StatusUp, Notification } from 'iconsax-react';
import { weatherAPI, WeatherData } from '../services/api';
import { WeatherCard } from './weather-card';
import { MandiPricesCard } from './mandi-prices-card';
import { CommunityCard } from './community-card';
import { TransportCard } from './transport-card';

interface DashboardPageProps {
    user: any;
    onNavigate: (view: string) => void;
    onOpenAI: () => void;
}

export function DashboardPage({ user, onNavigate, onOpenAI }: DashboardPageProps) {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [weatherError, setWeatherError] = useState<string | null>(null);
    const [isPermissionDenied, setIsPermissionDenied] = useState(false);

    const loadWeather = async (params?: { city?: string; lat?: number; lon?: number }) => {
        try {
            setWeatherLoading(true);
            setWeatherError(null);

            // If no params, we'll wait for geolocation or explicit city.
            // But for the initial load, if geolocation is blocked, we fallback to NULL or a clear default.
            const finalParams = params || { city: 'Nagpur' };
            const data = await weatherAPI.getCurrent(finalParams);
            setWeatherData(data);
        } catch (err) {
            setWeatherError('Weather unavailable');
            console.error(err);
        } finally {
            setWeatherLoading(false);
        }
    };

    const handleDetectLocation = () => {
        setIsPermissionDenied(false);
        setWeatherLoading(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    loadWeather({ lat: position.coords.latitude, lon: position.coords.longitude });
                },
                (error) => {
                    console.error("Location error:", error);
                    if (error.code === 1) { // PERMISSION_DENIED
                        setIsPermissionDenied(true);
                    }
                    // Do NOT silently fallback to Nagpur. Let the user see the "Allow Location" button.
                    setWeatherLoading(false);
                    setWeatherError('Location access required for local weather');
                },
                { timeout: 10000 }
            );
        } else {
            loadWeather({ city: 'Nagpur' });
        }
    };

    useEffect(() => {
        handleDetectLocation();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const currentDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const firstName = user?.name ? user.name.split(' ')[0] : 'Farmer';

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">

            {/* ──── HERO WELCOME CARD ──── */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
                {/* Background gradient effects */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-green-500/20 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />

                <div className="relative p-8 md:p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">

                    {/* Left: Greeting & Date */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium">
                                {weatherLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Detecting Farm Location...
                                    </>
                                ) : weatherData ? (
                                    <>
                                        <Cloud size={20} variant="Bold" className="text-blue-300" />
                                        {weatherData.temperature}°C, {weatherData.condition} in {weatherData.city}
                                    </>
                                ) : (
                                    <>
                                        <Navigation size={20} className="text-slate-400" />
                                        {weatherError || 'Location needed'}
                                    </>
                                )}
                            </div>
                            {(isPermissionDenied || weatherError) && (
                                <button
                                    onClick={handleDetectLocation}
                                    className="px-3 py-1.5 rounded-full bg-green-500 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-green-400 transition-all flex items-center gap-1.5 shadow-lg shadow-green-500/20"
                                >
                                    <Navigation className="w-3 h-3 fill-current" />
                                    Allow Location
                                </button>
                            )}
                        </div>

                        <div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-2">
                                {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">{firstName}</span> 🌾
                            </h1>
                            <p className="text-slate-400 text-base md:text-lg font-medium">
                                {currentDate}
                            </p>
                        </div>
                    </div>

                    {/* Right: AI Call to action */}
                    {/* <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                            <Magicpen size={24} variant="Bold" className="text-green-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-bold leading-tight">FarmIQ AI Assistant</h3>
                            <p className="text-slate-400 text-sm">Get personalized crop advice</p>
                        </div>
                        <button
                            onClick={onOpenAI}
                            className="w-full sm:w-auto px-6 py-3 bg-green-500 hover:bg-green-400 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] whitespace-nowrap"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Ask AI
                            </span>
                        </button>
                    </div> */}
                </div>
            </div>

            {/* ──── QUICK ACTIONS ROW ──── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    {/* Tile 1: Crops */}
                    <button
                        onClick={() => onNavigate('crops')}
                        className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all text-left flex flex-col justify-between h-36"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-[40px] -mr-10 -mt-10 transition-all group-hover:bg-green-100" />
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-2 z-10 border border-green-200">
                            <Book1 size={20} variant="Bold" className="text-green-600" />
                        </div>
                        <div className="z-10">
                            <h3 className="font-bold text-slate-900">Crop Library</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Browse 110+ guides</p>
                        </div>
                    </button>

                    {/* Tile 2: Mandi */}
                    <button
                        onClick={() => onNavigate('mandi')}
                        className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all text-left flex flex-col justify-between h-36"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[40px] -mr-10 -mt-10 transition-all group-hover:bg-blue-100" />
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-2 z-10 border border-blue-200">
                            <StatusUp size={20} variant="Bold" className="text-blue-600" />
                        </div>
                        <div className="z-10">
                            <h3 className="font-bold text-slate-900">Live Mandi</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Current market rates</p>
                        </div>
                    </button>

                    {/* Tile 3: Transport */}
                    <button
                        onClick={() => onNavigate('transport')}
                        className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all text-left flex flex-col justify-between h-36"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-[40px] -mr-10 -mt-10 transition-all group-hover:bg-amber-100" />
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-2 z-10 border border-amber-200">
                            <Truck size={20} variant="Bold" className="text-amber-600" />
                        </div>
                        <div className="z-10">
                            <h3 className="font-bold text-slate-900">Transport</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Book logistics</p>
                        </div>
                    </button>

                    {/* Tile 4: Alerts / Notifications */}
                    <button
                        className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all text-left flex flex-col justify-between h-36"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-[40px] -mr-10 -mt-10 transition-all group-hover:bg-purple-100" />
                        <div className="absolute top-5 right-5 flex">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-2 z-10 border border-purple-200">
                            <Notification size={20} variant="Bold" className="text-purple-600" />
                        </div>
                        <div className="z-10">
                            <h3 className="font-bold text-slate-900">Farm Alerts</h3>
                            <p className="text-xs text-slate-500 mt-0.5">2 pending updates</p>
                        </div>
                    </button>

                </div>
            </div>

            {/* ──── DATA CARDS GRID ──── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WeatherCard
                    onViewAll={() => onNavigate('weather')}
                    weather={weatherData}
                    loading={weatherLoading}
                    error={weatherError}
                />
                <MandiPricesCard
                    onViewAll={() => onNavigate('mandi')}
                    images={{
                        wheat: 'https://images.unsplash.com/photo-1721577756352-54505d771f0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
                        rice: 'https://images.unsplash.com/photo-1603106116068-02fc27fe5131?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
                        tomato: 'https://images.unsplash.com/photo-1560433802-62c9db426a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
                    }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CommunityCard onViewAll={() => onNavigate('community')} user={user} />
                <TransportCard onViewAll={() => onNavigate('transport')} user={user} />
            </div>

        </div>
    );
}
