import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Search,
    MapPin,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Filter
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { mandiAPI, MandiData } from '../services/api';

export function MandiPricesPage() {
    const [mandiData, setMandiData] = useState<MandiData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string>('Pune');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchMandiData();
    }, []);

    const fetchMandiData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await mandiAPI.getData();
            setMandiData(data);
        } catch (err) {
            setError('Failed to fetch mandi prices');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error || !mandiData) {
        return (
            <div className="flex-1 p-8">
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-lg text-center">
                    <p className="text-red-600 mb-4">{error || 'No mandi data available'}</p>
                    <button
                        onClick={fetchMandiData}
                        className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const filteredCrops = mandiData.crops.filter(crop =>
        crop.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTrendData = (cropName: string) => {
        const trends = mandiData.trends[cropName] || [];
        return trends.map((price, index) => ({
            month: mandiData.months[index] || `M${index + 1}`,
            price
        }));
    };

    const calculateChange = (cropName: string): number => {
        const trend = mandiData.trends[cropName];
        if (!trend || trend.length < 2) return 0;
        const current = trend[trend.length - 1];
        const previous = trend[trend.length - 2];
        return ((current - previous) / previous) * 100;
    };

    return (
        <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                        Mandi Price Analytics
                    </h2>
                    <p className="text-slate-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Live market rates as of {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search crops..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 w-64 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl px-3 py-2 cursor-pointer hover:bg-white/80 transition-colors">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                        >
                            {mandiData.districts.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Market Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Trend Chart */}
                <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Price Movement Index</h3>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                <span className="text-slate-600">Wheat</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
                                <span className="text-slate-600">Rice</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getTrendData('Wheat')}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(val) => `₹${val}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Market Insights */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-green-600/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="font-bold">Market Sentiment</h4>
                        </div>
                        <p className="text-green-50 text-sm leading-relaxed mb-4">
                            Current market trends indicate a 12% rise in grain prices due to seasonal demand shifts.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-semibold bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
                            <TrendingUp className="w-3 h-3" />
                            BULLISH MARKET
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg">
                        <h3 className="font-bold text-slate-900 mb-4">Hot Picks</h3>
                        <div className="space-y-4">
                            {mandiData.crops.slice(0, 2).map(crop => {
                                const change = calculateChange(crop);
                                return (
                                    <div key={crop} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-xl">
                                                {crop === 'Wheat' ? '🌾' : '🍚'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{crop}</p>
                                                <p className="text-xs text-slate-500">₹{mandiData.priceTable[selectedDistrict]?.[crop]}/qt</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-1 text-xs font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {Math.abs(change).toFixed(1)}%
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Price Grid */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-white/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Live Price Sheet</h3>
                    <button className="flex items-center gap-2 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
                        <Filter className="w-3.5 h-3.5" />
                        FILTER RESULTS
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Commodity</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Price (per Quintal)</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Avg Change</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCrops.map(crop => {
                                const price = mandiData.priceTable[selectedDistrict]?.[crop] || 0;
                                const change = calculateChange(crop);
                                const trend = mandiData.trends[crop] || [];

                                return (
                                    <tr key={crop} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                                    {crop === 'Wheat' ? '🌾' : crop === 'Rice' ? '🍚' : crop === 'Tomato' ? '🍅' : crop === 'Cotton' ? '☁️' : '🥔'}
                                                </div>
                                                <span className="font-semibold text-slate-900">{crop}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-lg font-bold text-slate-900">₹{price.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${change > 0 ? 'bg-green-100 text-green-700' :
                                                    change < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {change > 0 ? <TrendingUp className="w-3 h-3" /> :
                                                    change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                                {Math.abs(change).toFixed(1)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="h-8 w-24 ml-auto">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={trend.map((p, i) => ({ p }))}>
                                                        <Area
                                                            type="monotone"
                                                            dataKey="p"
                                                            stroke={change >= 0 ? '#22c55e' : '#ef4444'}
                                                            fill={change >= 0 ? '#dcfce7' : '#fee2e2'}
                                                            strokeWidth={2}
                                                            isAnimationActive={false}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
