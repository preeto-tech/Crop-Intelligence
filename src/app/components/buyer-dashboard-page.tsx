import { useState, useEffect } from 'react';
import { Store, MapPin, Search, Loader2, MessageSquare, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { User, marketAPI, MarketListing, MarketOrder } from '../services/api';

export function BuyerDashboardPage({ user, onLogout }: { user: User; onLogout: () => void }) {
    const [listings, setListings] = useState<MarketListing[]>([]);
    const [orders, setOrders] = useState<MarketOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isInitiating, setIsInitiating] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'marketplace' | 'my-orders'>('marketplace');

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [listingsData, ordersData] = await Promise.all([
                marketAPI.getAllActiveListings(),
                marketAPI.getMyOrders()
            ]);
            setListings(listingsData);
            setOrders(ordersData);
        } catch (error) {
            console.error('Error fetching market data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredListings = listings.filter(l =>
        l.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInitiatePurchase = async (listingId: string) => {
        setIsInitiating(listingId);
        try {
            // Initiate the order, which creates a chat room
            const order = await marketAPI.initiateOrder(listingId);

            // Dispatch a custom event to open the GlobalChatWidget automatically
            const event = new CustomEvent('open-chat', {
                detail: {
                    requestId: order.id,
                    type: 'market',
                    otherUserName: order.farmerName,
                    cropName: order.crop
                }
            });
            window.dispatchEvent(event);

            // Switch to My Orders tab to see the new order
            setActiveTab('my-orders');
            // Refresh data to show the new order
            loadData();


        } catch (error) {
            console.error('Failed to initiate purchase:', error);
            alert('Failed to initiate purchase. Please try again.');
        } finally {
            setIsInitiating(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] font-[Inter,system-ui,sans-serif]">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <Store className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Marketplace</h1>
                                <p className="text-sm font-medium text-slate-500">Find the best crops directly from farmers</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-bold text-slate-900">{user.name}</span>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Buyer</span>
                            </div>
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}&backgroundColor=c0aede`}
                                alt="Profile"
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                            />
                            <button
                                onClick={onLogout}
                                className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors ml-2"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('marketplace')}
                        className={`pb-4 px-2 text-sm font-bold transition-colors relative ${activeTab === 'marketplace' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Marketplace
                        {activeTab === 'marketplace' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('my-orders')}
                        className={`pb-4 px-2 text-sm font-bold transition-colors relative flex items-center gap-2 ${activeTab === 'my-orders' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        My Orders
                        {orders.length > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'my-orders' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                {orders.length}
                            </span>
                        )}
                        {activeTab === 'my-orders' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
                        )}
                    </button>
                </div>

                {/* Search Bar (Only in Marketplace) */}
                {activeTab === 'marketplace' && (
                    <div className="mb-8 relative max-w-xl">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search crops or locations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Loading fresh market listings...</p>
                    </div>
                ) : activeTab === 'marketplace' ? (
                    filteredListings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <Store className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No crops found</h3>
                            <p className="text-slate-500 max-w-sm">We couldn't find any active listings matching your search. Please check back later.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredListings.map((listing) => (
                                <div key={listing.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group flex flex-col h-full relative overflow-hidden">

                                    {/* Badge */}
                                    {listing.isAIGenerated && (
                                        <div className="absolute top-4 right-4 px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-full z-10">
                                            AI Verified
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4 mb-6 relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <span className="text-2xl font-black text-blue-600">{listing.crop.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 capitalize leading-tight mb-1">
                                                {listing.crop}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span className="truncate max-w-[150px]">{listing.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4 mb-6 flex-grow relative z-10">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Available Qty</p>
                                            <p className="text-lg font-black text-slate-800">{listing.quantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Price</p>
                                            <p className="text-lg font-black text-slate-800">
                                                {listing.price ? `₹${listing.price}` : <span className="text-slate-500 text-base">Market Rate</span>}
                                                {listing.price && <span className="text-xs text-slate-500">/kg</span>}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-50 relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Listed By</span>
                                            <span className="text-sm font-bold text-slate-900">{listing.farmerName}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleInitiatePurchase(listing.id!)}
                                        disabled={isInitiating === listing.id}
                                        className="w-full relative z-10 mt-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                    >
                                        {isInitiating === listing.id ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                <MessageSquare className="w-4 h-4" />
                                                Contact Farmer
                                                <ArrowRight className="w-4 h-4 opacity-50 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all" />
                                            </>
                                        )}
                                    </button>

                                    {/* Background decoration */}
                                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl -z-0"></div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    // MY ORDERS TAB
                    orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <MessageSquare className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No orders yet</h3>
                            <p className="text-slate-500 max-w-sm">Browse the marketplace and contact farmers to start purchasing.</p>
                            <button
                                onClick={() => setActiveTab('marketplace')}
                                className="mt-6 px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors"
                            >
                                Browse Marketplace
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group flex flex-col h-full relative overflow-hidden">
                                    <div className="flex items-start gap-4 mb-6 relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <span className="text-2xl font-black text-blue-600">{order.crop.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-xl font-black text-slate-900 capitalize leading-tight mb-1">
                                                    {order.crop}
                                                </h3>
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    <Clock className="w-3 h-3" />
                                                    Negotiating
                                                </div>
                                            </div>
                                            <div className="mt-2 text-sm font-medium text-slate-500 flex flex-col gap-1">
                                                <span className="text-slate-700 pr-1">Seller: <span className="font-bold">{order.farmerName}</span></span>
                                                <span className="text-xs text-slate-400">Ord. {new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            const event = new CustomEvent('open-chat', {
                                                detail: {
                                                    requestId: order.id,
                                                    type: 'market',
                                                    otherUserName: order.farmerName,
                                                    cropName: order.crop
                                                }
                                            });
                                            window.dispatchEvent(event);
                                        }}
                                        className="w-full relative z-10 mt-auto flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white py-3.5 rounded-xl font-bold text-sm transition-all group/btn"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Resume Chat
                                        <ArrowRight className="w-4 h-4 opacity-50 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>
        </div>
    );
}
