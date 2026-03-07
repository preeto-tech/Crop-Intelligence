import { useState, useEffect } from 'react';
import { Sparkles, Store, MapPin, Tag, Weight, CheckCircle2, Loader2, ArrowRight, CircleDollarSign, ListChecks, CalendarDays } from 'lucide-react';
import { aiAPI, marketAPI, mandiAPI, User, MarketListing } from '../services/api';
import { PlacesAutocomplete } from './places-autocomplete';

export function SellCropsPage({ user }: { user: User }) {
    const [activeTab, setActiveTab] = useState<'ai' | 'manual' | 'listings'>('ai');

    // My Listings State
    const [myListings, setMyListings] = useState<MarketListing[]>([]);
    const [isLoadingListings, setIsLoadingListings] = useState(false);

    // AI Form State
    const [aiPrompt, setAiPrompt] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [parsedData, setParsedData] = useState<{ crop: string | null, quantity: string | null, location: string | null } | null>(null);
    const [aiRecommendedPrice, setAiRecommendedPrice] = useState<number | null>(null);

    // Manual Form State
    const [crop, setCrop] = useState('');
    const [quantity, setQuantity] = useState('');
    const [location, setLocation] = useState(user?.location || '');
    const [manualRecommendedPrice, setManualRecommendedPrice] = useState<number | null>(null);

    // Submission State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const CROP_CATEGORIES = [
        "Wheat", "Rice", "Maize", "Cotton", "Sugarcane",
        "Tomato", "Potato", "Onion", "Apple", "Mango"
    ];

    // Auto-fetch price for manual form when fields change
    useEffect(() => {
        if (activeTab === 'manual' && crop && location) {
            fetchPrice(crop, location, setManualRecommendedPrice);
        }
    }, [crop, location, activeTab]);

    // Fetch personal listings when tab changes
    useEffect(() => {
        if (activeTab === 'listings') {
            loadListings();
        }
    }, [activeTab]);

    const loadListings = async () => {
        setIsLoadingListings(true);
        try {
            const data = await marketAPI.getMyListings();
            setMyListings(data.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            }));
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingListings(false);
        }
    };

    const fetchPrice = async (c: string, l: string, setter: (val: number | null) => void) => {
        try {
            const res = await mandiAPI.getData(1, 100);
            if (res && res.data && res.data.records && res.data.records.length > 0) {
                // Find a record for the crop, or just use the first
                const match = res.data.records.find((r: any) => r.cmdt_name.toLowerCase().includes(c.toLowerCase()));
                const priceMatch = match || res.data.records[0];
                let price: any = priceMatch.as_on_price || priceMatch.msp_price;
                if (typeof price === 'string') {
                    price = parseInt(price.replace(/,/g, '') || '2500', 10);
                }
                setter(Math.round((price || 2500) / 100));
            } else {
                setter(null);
            }
        } catch (e) {
            setter(null);
        }
    };

    const handleAIParsing = async () => {
        if (!aiPrompt.trim()) return;
        setIsParsing(true);
        setErrorMsg('');
        setParsedData(null);
        setAiRecommendedPrice(null);

        try {
            const data = await aiAPI.parseSellIntent(aiPrompt);
            setParsedData(data);

            if (data.crop && data.location) {
                await fetchPrice(data.crop, data.location, setAiRecommendedPrice);
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to parse your request. Please try manual entry.');
        } finally {
            setIsParsing(false);
        }
    };

    const handleSubmit = async (isAI: boolean) => {
        setIsSubmitting(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const listingData: MarketListing = isAI ? {
                crop: parsedData?.crop || '',
                quantity: parsedData?.quantity || '',
                location: parsedData?.location || '',
                price: aiRecommendedPrice,
                isAIGenerated: true
            } : {
                crop,
                quantity,
                location,
                price: manualRecommendedPrice,
                isAIGenerated: false
            };

            if (!listingData.crop || !listingData.quantity || !listingData.location) {
                throw new Error("Missing required fields. Please ensure crop, quantity, and location are provided.");
            }

            await marketAPI.sellCrop(listingData);

            setSuccessMsg('Your crop listing has been successfully published to the market!');

            // clear forms
            if (isAI) {
                setAiPrompt('');
                setParsedData(null);
                setAiRecommendedPrice(null);
            } else {
                setCrop('');
                setQuantity('');
                setManualRecommendedPrice(null);
            }

            // switch to listings tab immediately
            setActiveTab('listings');

            // hide success message after 5 seconds
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to create listing");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Store className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Sell Your Crops</h1>
                        <p className="text-slate-500 mt-1">List your harvest on the marketplace easily using our AI assistant or manual entry.</p>
                    </div>
                </div>

                {successMsg && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span className="font-medium text-sm">{successMsg}</span>
                    </div>
                )}

                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <span className="font-medium text-sm">{errorMsg}</span>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100 inline-flex flex-wrap gap-1">
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'ai' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Sparkles className="w-4 h-4" />
                        AI Assistant
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'manual' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Store className="w-4 h-4" />
                        Manual Entry
                    </button>
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'listings' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        <ListChecks className="w-4 h-4" />
                        My Listings
                    </button>
                </div>

                {/* AI Assistant Mode */}
                {activeTab === 'ai' && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/4"></div>

                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-indigo-500" />
                                Tell us what you want to sell
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">Type naturally in Hindi, Hinglish, or English. E.g., "mujhe 500kg wheat bechna hai delhi me"</p>

                            <div className="space-y-4 relative">
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="Enter your selling details here..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[120px] focus:outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700 font-medium resize-none relative z-10"
                                    disabled={isParsing || isSubmitting}
                                />
                                <div className="flex justify-end relative z-10">
                                    <button
                                        onClick={handleAIParsing}
                                        disabled={isParsing || !aiPrompt.trim()}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-indigo-200"
                                    >
                                        {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                        Parse with AI
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* AI Confirmation Card */}
                        {parsedData && (
                            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100/20 border justify-between border-indigo-100 animate-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="font-bold text-slate-800">Confirm Your Listing Details</h4>
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">AI Extracted</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                                            <Tag className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Crop</span>
                                        </div>
                                        <p className="font-bold text-slate-800 text-lg capitalize">{parsedData.crop || <span className="text-red-400 italic text-sm">Missing</span>}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                                            <Weight className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Quantity</span>
                                        </div>
                                        <p className="font-bold text-slate-800 text-lg">{parsedData.quantity || <span className="text-red-400 italic text-sm">Missing</span>}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Location</span>
                                        </div>
                                        <p className="font-bold text-slate-800 text-lg capitalize truncate">{parsedData.location || <span className="text-red-400 italic text-sm">Missing</span>}</p>
                                    </div>
                                </div>

                                {aiRecommendedPrice !== null && (
                                    <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                                <CircleDollarSign className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-green-800">Mandi Price Recommendation</p>
                                                <p className="text-xs font-medium text-green-600 truncate">Based on real-time market data</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-1 text-green-700">
                                            <span className="text-2xl font-black">₹{aiRecommendedPrice}</span>
                                            <span className="font-bold uppercase tracking-wider text-[10px] mt-1">/kg</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setParsedData(null)}
                                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        Edit Details
                                    </button>
                                    <button
                                        onClick={() => handleSubmit(true)}
                                        disabled={isSubmitting || !parsedData.crop || !parsedData.quantity || !parsedData.location}
                                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                        Confirm & Sell
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Manual Mode */}
                {activeTab === 'manual' && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Create Listing Manually</h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Crop</label>
                                    <select
                                        value={crop}
                                        onChange={(e) => setCrop(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
                                    >
                                        <option value="">Choose a crop...</option>
                                        {CROP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Quantity (e.g. 500kg)</label>
                                    <input
                                        type="text"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="Enter quantity"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Market / Drop-off Location</label>
                                    <PlacesAutocomplete
                                        defaultValue={location}
                                        onSelect={setLocation}
                                        placeholder="Search for your nearest Mandi or city..."
                                    />
                                </div>
                            </div>

                            {manualRecommendedPrice !== null && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                            <CircleDollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-green-800">Mandi Price Recommendation</p>
                                            <p className="text-xs font-medium text-green-600">Based on real-time market data for {crop} around {location.split(',')[0]}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-1 text-green-700">
                                        <span className="text-2xl font-black">₹{manualRecommendedPrice}</span>
                                        <span className="font-bold uppercase tracking-wider text-[10px] mt-1">/kg</span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => handleSubmit(false)}
                                    disabled={isSubmitting || !crop || !quantity || !location}
                                    className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-700 transition-shadow hover:shadow-lg hover:shadow-green-600/20 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                    Publish Listing
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* My Listings Mode */}
                {activeTab === 'listings' && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800">Your Active Crops for Sale</h3>
                            <button
                                onClick={loadListings}
                                className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                            >
                                {isLoadingListings ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
                            </button>
                        </div>

                        {isLoadingListings ? (
                            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-100">
                                <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-4" />
                                <p className="text-slate-500 font-medium">Loading your listings...</p>
                            </div>
                        ) : myListings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                    <Store className="w-10 h-10 text-slate-300" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">No Active Listings</h4>
                                <p className="text-slate-500 max-w-sm mx-auto mb-8">You haven't listed any crops for sale yet. Go back to AI Assistant or Manual Entry to create one.</p>
                                <button
                                    onClick={() => setActiveTab('ai')}
                                    className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                                >
                                    Sell a Crop using AI
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {myListings.map(listing => (
                                    <div key={listing.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-400 to-emerald-600"></div>

                                        <div className="flex items-start justify-between mb-6 pl-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-xl font-black text-slate-800 capitalize">{listing.crop}</h4>
                                                    {listing.isAIGenerated && (
                                                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider">
                                                            AI
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <MapPin className="w-3.5 h-3.5 mt-0.5" />
                                                    <span className="truncate max-w-[200px]">{listing.location}</span>
                                                </div>
                                            </div>
                                            <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">{listing.status || 'Active'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pl-4 border-t border-slate-50 pt-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Quantity Available</p>
                                                <p className="font-bold text-slate-700 text-lg">{listing.quantity}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Asking Price</p>
                                                <p className="font-bold text-slate-700 text-lg flex items-baseline gap-1">
                                                    {listing.price ? `₹${listing.price}` : <span className="text-slate-400 text-sm">Market Rate</span>}
                                                    {listing.price && <span className="text-xs text-slate-400">/kg</span>}
                                                </p>
                                            </div>
                                        </div>

                                        {listing.createdAt && (
                                            <div className="mt-6 pl-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                Listed on {new Date(listing.createdAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
