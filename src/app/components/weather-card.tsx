import { CloudRain, Wind, Droplets, CloudSun, Cloud, Sun, CloudLightning } from 'lucide-react';
import { useState, useEffect } from 'react';
import { weatherAPI, WeatherData } from '../services/api';

interface WeatherCardProps {
  onViewAll?: () => void;
}

export function WeatherCard({ onViewAll }: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const data = await weatherAPI.getCurrent('Nagpur');
        setWeather(data);
      } catch (err) {
        setError('Weather data unavailable');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain')) return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (c.includes('cloud')) return <CloudSun className="w-6 h-6 text-slate-400" />;
    if (c.includes('clear') || c.includes('sun')) return <Sun className="w-6 h-6 text-amber-500" />;
    if (c.includes('storm')) return <CloudLightning className="w-6 h-6 text-purple-500" />;
    return <Cloud className="w-6 h-6 text-slate-400" />;
  };

  const getWeatherGradient = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain')) return 'from-blue-50 to-indigo-50 text-blue-700';
    if (c.includes('clear') || c.includes('sun')) return 'from-amber-50 to-orange-50 text-amber-700';
    return 'from-slate-50 to-slate-100 text-slate-700';
  };

  if (loading) return <div className="h-48 bg-white/60 animate-pulse rounded-2xl" />;
  if (error || !weather) return (
    <div className="h-48 bg-white/60 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400">
      <CloudSun className="w-8 h-8 mb-2" />
      <p className="text-sm">Weather unavailable</p>
    </div>
  );

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Weather Today</h3>
          <p className="text-sm text-slate-500">{weather.city}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getWeatherGradient(weather.condition)} flex items-center justify-center`}>
          {getWeatherIcon(weather.condition)}
        </div>
      </div>

      <div className="flex items-end gap-2 mb-6">
        <div className="text-5xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
          {weather.temperature}°C
        </div>
        <div className="text-lg text-slate-500 mb-2">{weather.condition}</div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50/80 rounded-xl p-3 backdrop-blur-sm">
          <Droplets className="w-5 h-5 text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">Humidity</p>
          <p className="text-sm font-semibold text-slate-900">{weather.humidity}%</p>
        </div>
        <div className="bg-slate-50/80 rounded-xl p-3 backdrop-blur-sm">
          <Wind className="w-5 h-5 text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">Wind</p>
          <p className="text-sm font-semibold text-slate-900">{weather.windSpeed} km/h</p>
        </div>
        <div className="bg-slate-50/80 rounded-xl p-3 backdrop-blur-sm flex flex-col justify-center items-center">
          <button
            onClick={onViewAll}
            className="text-[10px] font-bold text-green-600 hover:text-green-700 transition-colors uppercase"
          >
            Details →
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-[10px] text-slate-500">
          <span className="text-green-600 font-bold uppercase">Safe to spray</span> • Low wind conditions
        </p>
      </div>
    </div>
  );
}