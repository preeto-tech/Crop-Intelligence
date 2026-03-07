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

const CROP_IMAGES: Record<string, string> = {
    'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
    'Rice': 'https://spanishboosting.com/wp-content/uploads/2024/04/organic-rice.jpg',
    'Cotton': 'https://agriculture.ec.europa.eu/sites/default/files/styles/oe_theme_medium_no_crop/public/2025-06/cotton-field-greece_600x400px_0.jpg?itok=Eq50ehaK',
    'Sugarcane': 'https://www.saveur.com/uploads/2022/03/05/sugarcane-linda-xiao.jpg?format=auto&optimize=high&width=1440',
    'Maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=800',
    'Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800',
    'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f02bad177?auto=format&fit=crop&q=80&w=800',
    'Bajra': 'https://images.unsplash.com/photo-1626017382025-a4f54f76789e?auto=format&fit=crop&q=80&w=800',
    'Jowar': 'https://images.unsplash.com/photo-1599584310571-0857a2c0f99d?auto=format&fit=crop&q=80&w=800',
    'Mustard': 'https://images.unsplash.com/photo-1587823567406-382aeb161109?auto=format&fit=crop&q=80&w=800',
    'Soybean': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaPsM4BAk-6Dvh79JtDHxp2fI_L9nfa2od2w&s',
    'Onion': 'https://images.immediate.co.uk/production/volatile/sites/30/2019/08/Onion-72ea178.jpg?resize=1366,1503'
};

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
            // Override with high-quality real images
            const enrichedData = data.map(crop => ({
                ...crop,
                image: CROP_IMAGES[crop.name] || crop.image
            }));
            setCrops(enrichedData);
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
                            className="group bg-white/40 backdrop-blur-md border border-white/40 rounded-3xl overflow-hidden shadow-none hover:shadow-xl hover:shadow-green-900/5 hover:border-green-200/50 transition-all duration-500 cursor-pointer relative"
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
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setSelectedCrop(null)}
                    ></div>
                    <div className="relative w-full max-w-4xl max-h-[95vh] bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
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

                            <div className="space-y-5">
                                {/* Fertilizer */}
                                <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
                                    <h4 className="flex items-center gap-2 font-bold text-green-800 mb-2">
                                        <Droplets className="w-5 h-5" /> Recommended Fertilizer
                                    </h4>
                                    <p className="text-green-700 leading-relaxed text-sm">{selectedCrop.fertilizer}</p>
                                </div>

                                {/* Pest Control */}
                                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                                    <h4 className="flex items-center gap-2 font-bold text-amber-800 mb-2">
                                        <Wind className="w-5 h-5" /> Pest Control
                                    </h4>
                                    <p className="text-amber-700 leading-relaxed text-sm">{selectedCrop.pests}</p>
                                </div>

                                {/* Best Practices */}
                                {selectedCrop.bestPractices && selectedCrop.bestPractices.length > 0 && (
                                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                                        <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-3">
                                            <Sparkles className="w-5 h-5" /> Best Practices
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedCrop.bestPractices.map((tip, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Community Q&A */}
                                {selectedCrop.communityQA && selectedCrop.communityQA.length > 0 && (
                                    <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100">
                                        <h4 className="flex items-center gap-2 font-bold text-purple-800 mb-3">
                                            <Info className="w-5 h-5" /> Farmer Q&amp;A
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedCrop.communityQA.map((qa, i) => (
                                                <div key={i} className="bg-white/70 rounded-xl p-3 border border-purple-100">
                                                    <p className="text-xs font-bold text-purple-700 mb-1">Q: {qa.question}</p>
                                                    <p className="text-xs text-purple-600">A: {qa.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Storage & Market */}
                                {(selectedCrop.storage || selectedCrop.marketDynamics) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {selectedCrop.storage && (
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Storage</h4>
                                                <p className="text-sm text-slate-700">{selectedCrop.storage}</p>
                                            </div>
                                        )}
                                        {selectedCrop.marketDynamics && (
                                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Market</h4>
                                                <p className="text-sm text-emerald-700">{selectedCrop.marketDynamics}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
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
