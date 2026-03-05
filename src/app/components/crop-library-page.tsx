import { useState, useEffect } from 'react';
import {
    Sprout,
    Search,
    Filter,
    Info,
    Droplets,
    Thermometer,
    Wind,
    Layers,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { cropsAPI, Crop } from '../services/api';

export function CropLibraryPage() {
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSeason, setSelectedSeason] = useState('All');
    const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

    const seasons = ['All', 'Rabi', 'Kharif', 'Zaid'];

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            setLoading(true);
            const data = await cropsAPI.getAll();
            setCrops(data);
        } catch (err) {
            setError('Failed to fetch crops');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCrops = crops.filter(crop =>
        (crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            crop.nameHi.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedSeason === 'All' || crop.season.includes(selectedSeason))
    );

    if (loading && crops.length === 0) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                        Agricultural Crop Library
                    </h2>
                    <p className="text-sm md:text-base text-slate-600 flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-green-600" />
                        Comprehensive guide for optimal farming
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search crops..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 w-full md:w-80 shadow-sm transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Season Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <Filter className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
                {seasons.map(season => (
                    <button
                        key={season}
                        onClick={() => setSelectedSeason(season)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${selectedSeason === season
                            ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20'
                            : 'bg-white/60 text-slate-600 border-white/50 hover:bg-white/80'
                            }`}
                    >
                        {season} {season === 'All' ? 'Season' : 'Crops'}
                    </button>
                ))}
            </div>

            {/* Crop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCrops.length > 0 ? (
                    filteredCrops.map(crop => (
                        <div
                            key={crop.id}
                            onClick={() => setSelectedCrop(crop)}
                            className="group bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-green-200 transition-all cursor-pointer relative"
                        >
                            {/* Image Header */}
                            <div className="h-48 relative overflow-hidden">
                                <img
                                    src={crop.image}
                                    alt={crop.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-lg border border-white/20 uppercase tracking-widest">
                                        {crop.season}
                                    </span>
                                    <h3 className="text-white text-xl font-bold mt-1 drop-shadow-md">
                                        {crop.name} <span className="font-normal text-sm opacity-90">{crop.nameHi}</span>
                                    </h3>
                                </div>
                            </div>

                            {/* Quick Info Grid */}
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                                        <Droplets className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="truncate">{crop.irrigation}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                                        <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                                        <span className="truncate">{crop.soil}</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`w-6 h-6 rounded-full border-2 border-white bg-green-${i}00 flex items-center justify-center`}>
                                                <Sparkles className="w-3 h-3 text-white" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-bold text-green-600 group-hover:gap-2 transition-all">
                                        View Details <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-16 text-center">
                        <Layers className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No crops match your search</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            We couldn't find any crops matching your current filters. Try searching for "Wheat" or "Rice".
                        </p>
                    </div>
                )}
            </div>

            {/* Crop Detail Modal */}
            {selectedCrop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        onClick={() => setSelectedCrop(null)}
                    ></div>
                    <div className="relative w-full max-w-4xl max-h-[95vh] bg-white rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
                        <div className="md:w-2/5 h-48 md:h-auto relative">
                            <img
                                src={selectedCrop.image}
                                alt={selectedCrop.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20 uppercase tracking-widest">
                                    {selectedCrop.season}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-1">{selectedCrop.name}</h2>
                                    <p className="text-xl md:text-2xl text-slate-400 font-medium">{selectedCrop.nameHi}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedCrop(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <XIcon className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Optimal Soil</p>
                                    <p className="text-base md:text-lg font-bold text-slate-800">{selectedCrop.soil}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Irrigation</p>
                                    <p className="text-base md:text-lg font-bold text-slate-800">{selectedCrop.irrigation}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                                    <h4 className="flex items-center gap-2 font-bold text-green-800 mb-2">
                                        <Droplets className="w-5 h-5" /> Recommended Fertilizer
                                    </h4>
                                    <p className="text-green-700 leading-relaxed">{selectedCrop.fertilizer}</p>
                                </div>

                                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                    <h4 className="flex items-center gap-2 font-bold text-amber-800 mb-2">
                                        <Wind className="w-5 h-5" /> Pest Control
                                    </h4>
                                    <p className="text-amber-700 leading-relaxed">{selectedCrop.pests}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedCrop(null)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}
