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
    Filter,
    Activity,
    AlertCircle,
    ShieldCheck,
    BarChart2,
    ArrowRight,
    Frown,
    XCircle
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Line
} from 'recharts';
import { mandiAPI, MandiData } from '../services/api';

export function MandiPricesPage() {
    const [mandiData, setMandiData] = useState<MandiData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [mandiRecords, setMandiRecords] = useState<any[]>([]);
    const [selectedCommodity, setSelectedCommodity] = useState<any | null>(null);

    // Filter states
    const [states, setStates] = useState<{ state_id: number, state_name: string }[]>([]);
    const [selectedStateId, setSelectedStateId] = useState<number | null>(100006);
    const [loadingFilters, setLoadingFilters] = useState(true);

    useEffect(() => {
        // Fetch states on mount
        const getFilters = async () => {
            try {
                const filters = await mandiAPI.getFilters();
                if (filters?.data?.state_data) {
                    setStates(filters.data.state_data);
                }
            } catch (err) {
                console.error("Could not load filters", err);
            } finally {
                setLoadingFilters(false);
            }
        };
        getFilters();
    }, []);

    useEffect(() => {
        // Reset and refetch whenever selectedStateId changes
        setMandiRecords([]);
        setPage(1);
        setHasMore(true);
        setSelectedCommodity(null);
        fetchMandiData(1, selectedStateId || 100006);
    }, [selectedStateId]);

    const fetchMandiData = async (currentPage: number, stateId: number | null) => {
        try {
            if (currentPage === 1) setLoading(true);
            else setIsLoadingMore(true);

            setError(null);
            const data = await mandiAPI.getData(currentPage, 30, stateId);
            setMandiData(data);

            const records = data?.data?.records || [];

            if (currentPage === 1) {
                setMandiRecords(records);
                if (records.length > 0) setSelectedCommodity(records[0]);
                else setSelectedCommodity(null);
            } else {
                setMandiRecords(prev => {
                    const existingNames = new Set(prev.map(r => r.cmdt_name));
                    const newRecords = records.filter((r: any) => !existingNames.has(r.cmdt_name));
                    const merged = [...prev, ...newRecords];
                    if (!selectedCommodity && merged.length > 0) setSelectedCommodity(merged[0]);
                    return merged;
                });
            }

            const totalPages = data?.pagination?.total_pages || 0;
            const currentP = data?.pagination?.current_page || 0;
            setHasMore(currentP < totalPages);

        } catch (err) {
            setError('Failed to fetch mandi prices');
            console.error(err);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedStateId(val ? parseInt(val) : 100006);
    };

    const clearFilters = () => {
        setSelectedStateId(100006);
        setSearchQuery('');
    };

    const handleLoadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchMandiData(next, selectedStateId || 100006);
    };

    if (loadingFilters) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    const filteredRecords = mandiRecords.filter(record =>
        record.cmdt_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getChartTrendData = (record: any) => {
        return [
            {
                day: 'Day 1',
                price: parseFloat(record.two_day_ago_price || record.one_day_ago_price || record.as_on_price),
                volume: parseFloat(record.two_day_ago_arrival || record.one_day_ago_arrival || record.as_on_arrival || '0')
            },
            {
                day: 'Day 2',
                price: parseFloat(record.one_day_ago_price || record.as_on_price),
                volume: parseFloat(record.one_day_ago_arrival || record.as_on_arrival || '0')
            },
            {
                day: 'Today',
                price: parseFloat(record.as_on_price),
                volume: parseFloat(record.as_on_arrival || '0')
            }
        ];
    };

    const calculateChange = (record: any): number => {
        const current = parseFloat(record.as_on_price) || 0;
        const previous = parseFloat(record.one_day_ago_price) || 0;
        if (!previous) return 0;
        return ((current - previous) / previous) * 100;
    };

    const calculateVariance = (current: string | number, target: string | number | null): number => {
        if (!target) return 0;
        const c = typeof current === 'string' ? parseFloat(current) : current;
        const t = typeof target === 'string' ? parseFloat(target) : target;
        if (!t) return 0;
        return ((c - t) / t) * 100;
    };

    const getMarketIntel = () => {
        if (mandiRecords.length === 0) return { topGainer: null, biggestDrop: null, highVolume: null };
        let topGainer = mandiRecords[0];
        let biggestDrop = mandiRecords[0];
        let highVolume = mandiRecords[0];
        mandiRecords.forEach(record => {
            const currentChange = calculateChange(record);
            if (currentChange > calculateChange(topGainer)) topGainer = record;
            if (currentChange < calculateChange(biggestDrop)) biggestDrop = record;
            if (parseFloat(record.as_on_arrival || '0') > parseFloat(highVolume.as_on_arrival || '0')) highVolume = record;
        });
        return { topGainer, biggestDrop, highVolume };
    };

    const { topGainer, biggestDrop, highVolume } = getMarketIntel();
    const primaryRecord = selectedCommodity || (mandiRecords.length > 0 ? mandiRecords[0] : null);

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                        Mandi Price Analytics
                    </h2>
                    <p className="text-sm md:text-base text-slate-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Live rates: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative group flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search crops..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 w-full sm:w-64 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl px-3 py-2 hover:bg-white/80 transition-colors">
                        <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                        <select
                            className="bg-transparent border-none text-sm font-medium text-slate-700 outline-none cursor-pointer w-full"
                            value={selectedStateId || ''}
                            onChange={handleStateChange}
                        >
                            <option value="100006">All States</option>
                            {states.map(state => (
                                <option key={state.state_id} value={state.state_id}>{state.state_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="h-[600px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            ) : (error || mandiRecords.length === 0) ? (
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-lg text-center flex flex-col items-center justify-center gap-6 min-h-[400px]">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                        <Frown className="w-10 h-10 text-slate-400" />
                    </div>
                    <div className="max-w-md">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                        <p className="text-slate-600 mb-6">
                            {error || "We couldn't find any Mandi price data for the selected state. Try clearing filters or checking back later."}
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => fetchMandiData(1, selectedStateId)}
                                className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all"
                            >
                                Retry
                            </button>
                            {selectedStateId !== 100006 && (
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Clear Filter
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Market Intel Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-colors"></div>
                            <div className="flex items-center gap-3 mb-4 text-green-600">
                                <TrendingUp className="w-5 h-5" />
                                <h3 className="font-bold text-slate-900">Highest Gainer</h3>
                            </div>
                            {topGainer && (
                                <div>
                                    <p className="text-2xl font-black text-slate-900 mb-1">{topGainer.cmdt_name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-slate-700">₹{parseFloat(topGainer.as_on_price).toLocaleString()}</span>
                                        <span className="flex items-center text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                            <ArrowUpRight className="w-3 h-3 mr-1" />
                                            {calculateChange(topGainer).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-colors"></div>
                            <div className="flex items-center gap-3 mb-4 text-red-600">
                                <TrendingDown className="w-5 h-5" />
                                <h3 className="font-bold text-slate-900">Biggest Drop</h3>
                            </div>
                            {biggestDrop && (
                                <div>
                                    <p className="text-2xl font-black text-slate-900 mb-1">{biggestDrop.cmdt_name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-slate-700">₹{parseFloat(biggestDrop.as_on_price).toLocaleString()}</span>
                                        <span className="flex items-center text-sm font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                            <ArrowDownRight className="w-3 h-3 mr-1" />
                                            {Math.abs(calculateChange(biggestDrop)).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
                            <div className="flex items-center gap-3 mb-4 text-blue-600">
                                <BarChart2 className="w-5 h-5" />
                                <h3 className="font-bold text-slate-900">Highest Volume</h3>
                            </div>
                            {highVolume && (
                                <div>
                                    <p className="text-2xl font-black text-slate-900 mb-1">{highVolume.cmdt_name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-slate-700">{parseFloat(highVolume.as_on_arrival).toLocaleString()} MT</span>
                                        <span className="text-sm font-medium text-slate-500">Arrival Today</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Price Trends vs. Market Arrival - Dual Axis Chart */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/50 shadow-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-2 text-green-600 mb-1">
                                    <Activity className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Market Intelligence</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    {primaryRecord ? `${primaryRecord.cmdt_name} Price Trend vs Vol` : 'Price Analytics'}
                                </h3>
                            </div>
                            {primaryRecord && (
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-xs font-semibold text-slate-600">Price (₹/Qtl)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                        <span className="text-xs font-semibold text-slate-600">Arrival (MT)</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-[300px] md:h-[400px] w-full">
                            {primaryRecord ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={getChartTrendData(primaryRecord)}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                            tickFormatter={(val) => `₹${val.toLocaleString()}`}
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                                            tickFormatter={(val) => `${val} MT`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                backdropFilter: 'blur(8px)'
                                            }}
                                        />
                                        <Bar
                                            yAxisId="right"
                                            dataKey="volume"
                                            fill="#e2e8f0"
                                            radius={[4, 4, 0, 0]}
                                            barSize={40}
                                        />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#22c55e"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorPrice)"
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <BarChart2 className="w-10 h-10 opacity-20" />
                                    <p className="text-sm font-medium">Select a commodity to view detailed analytics</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detailed Price Grid */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-white/50 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900">Live Price Sheet</h3>
                                <p className="text-xs text-slate-500 mt-1">Showing {filteredRecords.length} {searchQuery ? 'matching ' : ''}commodities</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Commodity</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Market Price</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">MSP Variance</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Arrival Volume</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">3-Day Trend (Price vs Vol)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredRecords.map((record, index) => {
                                        const price = parseFloat(record.as_on_price);
                                        const change = calculateChange(record);
                                        const trendData = getChartTrendData(record);
                                        return (
                                            <tr
                                                key={`${record.cmdt_name}-${index}`}
                                                onClick={() => setSelectedCommodity(record)}
                                                className={`transition-colors group cursor-pointer ${selectedCommodity?.cmdt_name === record.cmdt_name ? 'bg-green-50/50 hover:bg-green-50/80' : 'hover:bg-slate-50/50'}`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${selectedCommodity?.cmdt_name === record.cmdt_name ? 'bg-green-200 scale-110 shadow-sm' : 'bg-slate-100 group-hover:scale-105'}`}>
                                                            {record.cmdt_name.includes('Wheat') ? '🌾' : record.cmdt_name.includes('Paddy') ? '🍚' : record.cmdt_name.includes('Tomato') ? '🍅' : record.cmdt_name.includes('Cotton') ? '☁️' : '🥔'}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-slate-900 block">{record.cmdt_name}</span>
                                                            <span className="text-xs font-medium text-slate-500">{record.cmdt_grp_name}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-lg font-bold text-slate-900">₹{price.toLocaleString()}</span>
                                                        <div className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1 ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                            {change > 0 ? <TrendingUp className="w-3 h-3" /> : change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                                            {Math.abs(change).toFixed(1)}% (24h)
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {record.msp_price ? (() => {
                                                        const variance = calculateVariance(record.as_on_price, record.msp_price);
                                                        const isBelowMSP = variance < 0;
                                                        return (
                                                            <div className="flex flex-col items-center">
                                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isBelowMSP ? 'bg-red-50/80 text-red-700 border-red-200/50' : 'bg-green-50/80 text-green-700 border-green-200/50'}`}>
                                                                    {isBelowMSP ? <AlertCircle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                                                    {isBelowMSP ? 'Below MSP' : 'Above MSP'}
                                                                </div>
                                                                <span className="text-[10px] font-semibold text-slate-500 mt-1">Target: ₹{parseFloat(record.msp_price).toLocaleString()}</span>
                                                            </div>
                                                        );
                                                    })() : (
                                                        <span className="text-xs text-slate-400 font-medium">No MSP Data</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="text-sm font-bold text-slate-700">{parseFloat(record.as_on_arrival || '0').toLocaleString()} MT</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="h-10 w-32 ml-auto">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <ComposedChart data={trendData}>
                                                                <Bar dataKey="volume" fill="#cbd5e1" radius={[2, 2, 0, 0]} maxBarSize={8} opacity={0.4} />
                                                                <Line type="monotone" dataKey="price" stroke={change >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} dot={false} isAnimationActive={false} />
                                                            </ComposedChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {hasMore && (
                            <div className="p-6 border-t border-slate-100 flex justify-center bg-slate-50/30">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="px-8 py-2.5 bg-white border border-slate-200 shadow-sm text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-green-200 hover:text-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        "Load More Crops"
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
