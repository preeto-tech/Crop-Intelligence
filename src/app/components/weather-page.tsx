import { useState, useEffect } from 'react';
import {
    CloudSun,
    Wind,
    Droplets,
    Thermometer,
    Sun,
    CloudRain,
    CloudLightning,
    Calendar,
    MapPin,
    AlertTriangle,
    Sunrise,
    Sunset,
    ArrowDown,
    ArrowUp
} from 'lucide-react';
import { weatherAPI, WeatherData } from '../services/api';

export function WeatherPage() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [city, setCity] = useState('Nagpur');

    useEffect(() => {
        fetchWeather();
    }, [city]);

    const fetchWeather = async () => {
        try {
            setLoading(true);
            const data = await weatherAPI.getCurrent(city);
            setWeather(data);
        } catch (err) {
            setError('Could not update weather data');
        } finally {
            setLoading(false);
        }
    };

    const forecast = [
        { day: 'Tomorrow', temp: 32, cond: 'Sunny', icon: Sun, color: 'text-amber-500' },
        { day: 'Friday', temp: 30, cond: 'Partly Cloudy', icon: CloudSun, color: 'text-slate-400' },
        { day: 'Saturday', temp: 28, cond: 'Light Rain', icon: CloudRain, color: 'text-blue-500' },
        { day: 'Sunday', temp: 29, cond: 'Cloudy', icon: CloudSun, color: 'text-slate-400' },
        { day: 'Monday', temp: 33, cond: 'Sunny', icon: Sun, color: 'text-amber-500' },
    ];

    if (loading && !weather) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                        Weather & Climate Analytics
                    </h2>
                    <p className="text-sm md:text-base text-slate-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Live: {weather?.city || city}, India
                    </p>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {['Nagpur', 'Pune', 'Nashik', 'Amravati'].map(c => (
                        <button
                            key={c}
                            onClick={() => setCity(c)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${city === c
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-white/50'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Observation */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        {weather?.condition.toLowerCase().includes('sun') ? <Sun size={200} /> : <CloudSun size={200} />}
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between gap-8 md:gap-12">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                            <div>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border border-white/20 mb-4 inline-block">
                                    Current Conditions
                                </span>
                                <h3 className="text-5xl md:text-6xl font-bold mt-2">{weather?.temperature}°C</h3>
                                <p className="text-xl md:text-2xl text-blue-100 font-medium mt-1">{weather?.condition}</p>
                            </div>
                            <div className="sm:text-right">
                                <p className="text-blue-100 font-medium text-sm md:text-base">Feels like {weather ? weather.temperature + 2 : '--'}°C</p>
                                <div className="flex items-center sm:justify-end gap-3 mt-4">
                                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                                        <ArrowUp className="w-3 md:w-4 h-3 md:h-4 text-orange-300" />
                                        <span className="text-xs md:text-sm font-bold">34°</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                                        <ArrowDown className="w-3 md:w-4 h-3 md:h-4 text-blue-300" />
                                        <span className="text-xs md:text-sm font-bold">22°</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            <div className="space-y-1">
                                <p className="text-blue-100/60 text-[10px] md:text-xs font-bold uppercase tracking-wider">Wind Speed</p>
                                <div className="flex items-center gap-2">
                                    <Wind className="w-4 md:w-5 h-4 md:h-5 text-blue-200" />
                                    <span className="text-lg md:text-xl font-bold">{weather?.windSpeed} km/h</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-blue-100/60 text-[10px] md:text-xs font-bold uppercase tracking-wider">Humidity</p>
                                <div className="flex items-center gap-2">
                                    <Droplets className="w-4 md:w-5 h-4 md:h-5 text-blue-200" />
                                    <span className="text-lg md:text-xl font-bold">{weather?.humidity}%</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-blue-100/60 text-[10px] md:text-xs font-bold uppercase tracking-wider">Visibility</p>
                                <div className="flex items-center gap-2">
                                    <CloudSun className="w-4 md:w-5 h-4 md:h-5 text-blue-200" />
                                    <span className="text-lg md:text-xl font-bold">10 km</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-blue-100/60 text-[10px] md:text-xs font-bold uppercase tracking-wider">UV Index</p>
                                <div className="flex items-center gap-2">
                                    <Sun className="w-4 md:w-5 h-4 md:h-5 text-amber-300" />
                                    <span className="text-lg md:text-xl font-bold">High (7)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Agricultural Insights */}
                <div className="space-y-6">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Agri-Weather Alerts
                        </h4>
                        <div className="space-y-4">
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                <p className="text-sm font-bold text-amber-800">Spray Conditions Warning</p>
                                <p className="text-xs text-amber-700 mt-1">Wind exceeds 8km/h. Avoid pesticide spraying between 12:00 PM - 04:00 PM.</p>
                            </div>
                            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl">
                                <p className="text-sm font-bold text-green-800">Ideal Harvest Window</p>
                                <p className="text-xs text-green-700 mt-1">Next 48 hours are clear. Perfect window for Soyabean harvest.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Sunrise className="w-5 h-5 text-orange-500" />
                            Solar Data
                        </h4>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 text-center">
                                <Sunrise className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                                <p className="text-xs text-slate-500">Sunrise</p>
                                <p className="text-lg font-bold text-slate-800">06:12 AM</p>
                            </div>
                            <div className="w-px h-12 bg-slate-200"></div>
                            <div className="flex-1 text-center">
                                <Sunset className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                                <p className="text-xs text-slate-500">Sunset</p>
                                <p className="text-lg font-bold text-slate-800">06:45 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    Extended Forecast
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {forecast.map((item, idx) => (
                        <div key={idx} className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 text-center hover:shadow-xl hover:border-blue-200 transition-all group">
                            <p className="font-bold text-slate-900 mb-4">{item.day}</p>
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <item.icon className={`w-8 h-8 ${item.color}`} />
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{item.temp}°</p>
                            <p className="text-xs text-slate-500 font-medium mt-1">{item.cond}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
