import { useState, useEffect, useRef } from 'react';
import {
    CloudSun,
    Wind,
    Droplets,
    Thermometer,
    Sun,
    CloudRain,
    Calendar,
    MapPin,
    AlertTriangle,
    Sunrise,
    Sunset,
    ArrowDown,
    ArrowUp,
    Search,
    Navigation,
    Loader2,
    Compass,
    Eye,
    Zap,
    Cloud,
    Clock,
    ChevronRight
} from 'lucide-react';
import { weatherAPI, WeatherData } from '../services/api';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Kolkata"
];

const NEARBY_HUBS = [
    { name: 'Nagpur', region: 'Maharashtra' },
    { name: 'Indore', region: 'Madhya Pradesh' },
    { name: 'Ludhiana', region: 'Punjab' },
    { name: 'Coimbatore', region: 'Tamil Nadu' },
    { name: 'Nashik', region: 'Maharashtra' }
];

export function WeatherPage() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [nearbyWeather, setNearbyWeather] = useState<(WeatherData & { name: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [city, setCity] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isPermissionDenied, setIsPermissionDenied] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        detectLocation();
        fetchNearbyWeather();
    }, []);

    useEffect(() => {
        if (city) {
            fetchWeather();
        }
    }, [city]);

    const detectLocation = () => {
        if ("geolocation" in navigator) {
            setIsLocating(true);
            setIsPermissionDenied(false);
            setLoading(true);
            setError(null);

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const data = await weatherAPI.getCurrent({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        });
                        setWeather(data);
                        setCity(data.city);
                    } catch (err) {
                        console.error("Geo-weather fetch failed", err);
                        setError("Could not update weather data");
                    } finally {
                        setIsLocating(false);
                        setLoading(false);
                    }
                },
                (err) => {
                    console.error("Geolocation error", err);
                    setIsLocating(false);
                    setLoading(false);
                    if (err.code === 1) { // PERMISSION_DENIED
                        setIsPermissionDenied(true);
                    } else {
                        setError("Location detection failed. Please search manually.");
                    }
                },
                { timeout: 10000 }
            );
        } else {
            setError("Geolocation not supported. Please search manually.");
            setLoading(false);
        }
    };

    const fetchWeather = async () => {
        if (!city) return;
        try {
            setLoading(true);
            setError(null);
            const data = await weatherAPI.getCurrent({ city });
            setWeather(data);
        } catch (err) {
            setError('Could not update weather data');
        } finally {
            setLoading(false);
        }
    };

    const fetchNearbyWeather = async () => {
        try {
            const promises = NEARBY_HUBS.map(async (hub) => {
                const data = await weatherAPI.getCurrent({ city: hub.name });
                return { ...data, name: hub.name };
            });
            const results = await Promise.all(promises);
            setNearbyWeather(results);
        } catch (err) {
            console.error("Nearby weather fetch failed", err);
        }
    };

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return '--:--';
        return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const filteredStates = INDIAN_STATES.filter(s =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const forecast = [
        { day: 'Tomorrow', temp: (weather?.temperature || 30) + 1, cond: 'Sunny', icon: Sun, color: 'text-amber-500' },
        { day: 'Friday', temp: (weather?.temperature || 30) - 2, cond: 'Partly Cloudy', icon: CloudSun, color: 'text-slate-400' },
        { day: 'Saturday', temp: (weather?.temperature || 30) - 4, cond: 'Light Rain', icon: CloudRain, color: 'text-blue-500' },
        { day: 'Sunday', temp: (weather?.temperature || 30) - 1, cond: 'Cloudy', icon: CloudSun, color: 'text-slate-400' },
        { day: 'Monday', temp: (weather?.temperature || 30) + 2, cond: 'Sunny', icon: Sun, color: 'text-amber-500' },
    ];

    if (loading && !weather) {
        return (
            <div className="flex-1 p-8 flex flex-col items-center justify-center space-y-6 min-h-screen">
                <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin shadow-lg"></div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Detecting Farm Location...</h3>
                    <p className="text-slate-500 text-sm mt-1">Fetching precision weather data via satellite</p>
                </div>
            </div>
        );
    }

    if (!weather && (isPermissionDenied || error)) {
        return (
            <div className="flex-1 p-4 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
                <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Navigation className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Location Access Required</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                        To provide precision weather alerts for your farm, we need your location. Please enable location permissions or search for your region manually.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={detectLocation}
                            className="w-full sm:w-auto px-8 py-3.5 bg-green-500 text-slate-900 font-black rounded-2xl hover:bg-green-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                        >
                            <Navigation className="w-4 h-4 fill-current" />
                            Allow Access
                        </button>
                        <div className="relative group w-full sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search regions (e.g. Maharashtra)..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                className="w-full pl-11 pr-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all font-bold"
                            />
                            {showDropdown && filteredStates.length > 0 && (
                                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                                    {filteredStates.slice(0, 5).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => {
                                                setCity(s);
                                                setSearchQuery('');
                                                setShowDropdown(false);
                                            }}
                                            className="w-full text-left px-5 py-3 hover:bg-green-50 text-slate-700 text-sm font-bold flex items-center justify-between"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto min-h-screen">
            {/* Standard Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                        Weather & Climate Analytics
                    </h2>
                    <p className="text-sm md:text-base text-slate-600 flex items-center gap-2 font-medium">
                        <MapPin className="w-4 h-4 text-green-600" />
                        Live: {weather?.city || city}, India
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search regions..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            className="w-full pl-11 pr-10 py-2.5 bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm transition-all font-medium text-slate-700"
                        />
                        <button
                            onClick={detectLocation}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Current location"
                        >
                            <Compass className={`w-4 h-4 text-slate-400 ${isLocating ? 'animate-spin text-green-600' : ''}`} />
                        </button>

                        {showDropdown && filteredStates.length > 0 && (
                            <div className="absolute top-full mt-2 left-0 right-0 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden z-50">
                                {filteredStates.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => {
                                            setCity(s);
                                            setSearchQuery('');
                                            setShowDropdown(false);
                                        }}
                                        className="w-full text-left px-5 py-3 hover:bg-green-50 text-slate-700 text-sm font-bold flex items-center justify-between group"
                                    >
                                        {s}
                                        <ArrowUp className="w-4 h-4 opacity-0 group-hover:opacity-100 rotate-45 transition-all text-green-600" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Weather Observation Hub - Consistent with Mandi Price Intel Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                        {weather?.condition.toLowerCase().includes('sun') ? <Sun size={240} /> : <Cloud size={240} />}
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 mb-4 inline-block">
                                    Current conditions
                                </span>
                                <div className="flex items-center gap-6 mt-2">
                                    <h3 className="text-6xl md:text-7xl font-black tracking-tighter drop-shadow-lg">
                                        {weather?.temperature || '--'}°
                                    </h3>
                                    <div>
                                        <p className="text-2xl font-bold">{weather?.condition}</p>
                                        <p className="text-blue-100/80 font-medium">Feels like {weather?.feels_like || '--'}°</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                                    <ArrowUp className="w-4 h-4 text-orange-300" />
                                    <span className="text-sm font-bold">{weather?.temp_max || '--'}°</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                                    <ArrowDown className="w-4 h-4 text-blue-300" />
                                    <span className="text-sm font-bold">{weather?.temp_min || '--'}°</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                            {[
                                { label: 'Wind', value: `${weather?.windSpeed || '--'} km/h`, icon: Wind },
                                { label: 'Humidity', value: `${weather?.humidity || '--'}%`, icon: Droplets },
                                { label: 'Visibility', value: `${weather?.visibility || '--'} km`, icon: Eye },
                                { label: 'Solar Index', value: 'High (7)', icon: Sun }
                            ].map((s, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/60 mb-1">{s.label}</p>
                                    <div className="flex items-center gap-2">
                                        <s.icon className="w-4 h-4 text-blue-200" />
                                        <span className="text-lg font-bold">{s.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Agri-Weather Alerts
                        </h4>
                        <div className="space-y-3">
                            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Spray Conditions Warning</p>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    Wind exceeds 12km/h. Avoid pesticide spraying between 11 AM - 4 PM.
                                </p>
                            </div>
                            <div className="p-4 bg-green-50/50 border border-green-100 rounded-2xl">
                                <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1">Optimal Harvest Window</p>
                                <p className="text-xs text-green-700 leading-relaxed">
                                    Sky is clear for the next 72h. Perfect window for Soyabean harvest.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <Sunrise className="w-4 h-4 text-orange-500" />
                                Solar Data
                            </h4>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">Sunrise</p>
                                <p className="text-lg font-bold text-slate-800">{formatTime(weather?.sunrise)}</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div className="flex-1 text-right">
                                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">Sunset</p>
                                <p className="text-lg font-bold text-slate-800">{formatTime(weather?.sunset)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Extended Forecast Row - Consistent Grid Layout */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        5-Day Extended Forecast
                    </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {forecast.map((item, idx) => (
                        <div key={idx} className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 text-center hover:shadow-xl hover:border-blue-200 transition-all group">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{item.day}</p>
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <item.icon className={`w-7 h-7 ${item.color}`} />
                            </div>
                            <p className="text-2xl font-black text-slate-900">{item.temp}°</p>
                            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{item.cond}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Nearby Agricultural Hubs - Consistent Row Style */}
            <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Regional Mandi Hubs Weather
                </h4>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    {nearbyWeather.map((nb, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCity(nb.name)}
                            className="flex-shrink-0 bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl px-6 py-5 min-w-[200px] cursor-pointer hover:bg-white/80 hover:border-green-200 transition-all shadow-sm group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{nb.name}</span>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-3xl font-black text-slate-900">{nb.temperature}°</p>
                                <div className="text-[10px] text-slate-500 font-bold uppercase leading-tight">
                                    <p>{nb.condition}</p>
                                    <p className="text-slate-400">{nb.humidity}% humidity</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


