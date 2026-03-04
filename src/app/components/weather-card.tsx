import { Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react';
import { useState, useEffect } from 'react';
import { weatherAPI, WeatherData } from '../services/api';

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('Pune');

  useEffect(() => {
    fetchWeather();
  }, [city]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await weatherAPI.getCurrent(city);
      setWeather(data);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain')) return <CloudRain className="w-7 h-7 text-white" />;
    if (lower.includes('cloud')) return <Cloud className="w-7 h-7 text-white" />;
    return <Sun className="w-7 h-7 text-white" />;
  };

  const getWeatherGradient = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain')) return 'from-blue-400 to-blue-600';
    if (lower.includes('cloud')) return 'from-slate-400 to-slate-600';
    return 'from-yellow-400 to-orange-500';
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-16 bg-slate-200 rounded w-2/3"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg">
        <p className="text-red-600">{error || 'No weather data available'}</p>
        <button 
          onClick={fetchWeather}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-shadow">
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

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-50/80 rounded-xl p-3 backdrop-blur-sm">
          <Wind className="w-5 h-5 text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">Wind</p>
          <p className="text-sm font-semibold text-slate-900">{weather.windSpeed} km/h</p>
        </div>
        <div className="bg-slate-50/80 rounded-xl p-3 backdrop-blur-sm">
          <Droplets className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-xs text-slate-500">Humidity</p>
          <p className="text-sm font-semibold text-slate-900">{weather.humidity}%</p>
        </div>
        <div className="bg-slate-50/80 rounded-xl p-3 backdrop-blur-sm">
          <CloudRain className="w-5 h-5 text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">Rain</p>
          <p className="text-sm font-semibold text-slate-900">-</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-600">
          <span className="font-medium text-green-600">Good conditions</span> for irrigation today
        </p>
      </div>
    </div>
  );
}