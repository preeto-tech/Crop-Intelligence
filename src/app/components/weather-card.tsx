import { CloudRain, Wind, Droplets, CloudSun, Cloud, Sun, CloudLightning } from 'lucide-react';
import { useState, useEffect } from 'react';
import { weatherAPI, WeatherData } from '../services/api';

interface WeatherCardProps {
  onViewAll?: () => void;
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
}

export function WeatherCard({ onViewAll, weather, loading, error }: WeatherCardProps) {
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

  if (loading) return (
    <div className="h-full bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Updating Weather...</p>
    </div>
  );

  if (error || !weather) return (
    <div className="h-full bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 flex flex-col items-center justify-center text-slate-400">
      <CloudSun className="w-8 h-8 mb-2" />
      <p className="text-sm font-medium">Weather data unavailable</p>
    </div>
  );

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Weather Today</h3>
          <p className="text-sm text-slate-500 font-medium">{weather.city}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getWeatherGradient(weather.condition)} flex items-center justify-center shadow-sm`}>
          {getWeatherIcon(weather.condition)}
        </div>
      </div>

      <div className="flex items-end gap-2 mb-6">
        <div className="text-5xl font-black bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
          {weather.temperature}°
        </div>
        <div className="text-lg text-slate-500 font-bold mb-2 lowercase">{weather.condition}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50/80 rounded-xl p-3 backdrop-blur-sm border border-slate-100">
          <Droplets className="w-4 h-4 text-blue-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Humidity</p>
          <p className="text-sm font-black text-slate-900">{weather.humidity}%</p>
        </div>
        <div className="bg-slate-50/80 rounded-xl p-3 backdrop-blur-sm border border-slate-100">
          <Wind className="w-4 h-4 text-green-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wind</p>
          <p className="text-sm font-black text-slate-900">{weather.windSpeed} km/h</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100/50 flex items-center justify-between">
        <p className="text-[10px] text-slate-500 font-medium">
          <span className="text-green-600 font-black uppercase tracking-widest">Safe to spray</span> • Low wind
        </p>
        <button
          onClick={onViewAll}
          className="text-[10px] font-black text-slate-400 hover:text-green-600 transition-all uppercase tracking-widest flex items-center gap-1"
        >
          Details →
        </button>
      </div>
    </div>
  );
}