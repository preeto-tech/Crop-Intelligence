import { useState } from 'react';
import {
    Truck,
    Plus,
    Search,
    MapPin,
    Calendar,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Package,
    ArrowRight,
    User,
    Phone
} from 'lucide-react';

export function TransportPage({ user }: { user?: any }) {
    const [showBookingModal, setShowBookingModal] = useState(false);

    const bookings = [
        { id: 'T-8821', crop: 'Wheat', weight: '12 Tons', route: 'Nagpur → Mumbai Mandi', date: 'Mar 15, 2026', status: 'In Transit', driver: 'Karan Singh' },
        { id: 'T-8794', crop: 'Rice', weight: '8 Tons', route: 'Nagpur → Pune Mandi', date: 'Mar 10, 2026', status: 'Delivered', driver: 'Suresh Raina' },
        { id: 'T-8752', crop: 'Tomatoes', weight: '2 Tons', route: 'Nagpur → local Market', date: 'Mar 08, 2026', status: 'Delivered', driver: 'Amit Pal' },
        { id: 'T-8845', crop: 'Cotton', weight: '5 Tons', route: 'Amravati → Mumbai', date: 'Mar 20, 2026', status: 'Pending', driver: '--' },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'In Transit': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                        Logistics & Transport
                    </h2>
                    <p className="text-sm md:text-base text-slate-600 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-green-600" />
                        Manage your shipments
                    </p>
                </div>

                <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Book Transport
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: 'Active', value: '3', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Delivered', value: '24', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Pending', value: '1', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Cancelled', value: '0', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4 md:p-6 shadow-sm">
                        <div className={`w-8 h-8 md:w-10 md:h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                            <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <p className="text-[10px] md:text-sm font-medium text-slate-500 truncate">{stat.label}</p>
                        <p className="text-xl md:text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Tracking & Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shipment Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="px-6 md:px-8 py-4 md:py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="font-bold text-slate-900">Recent Bookings</h3>
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full sm:w-auto pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-8 py-4">Booking ID</th>
                                        <th className="px-4 py-4">Crop & Weight</th>
                                        <th className="px-4 py-4">Route</th>
                                        <th className="px-4 py-4">Status</th>
                                        <th className="px-8 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5 font-bold text-slate-900">{booking.id}</td>
                                            <td className="px-4 py-5">
                                                <p className="font-medium text-slate-800">{booking.crop}</p>
                                                <p className="text-xs text-slate-500">{booking.weight}</p>
                                            </td>
                                            <td className="px-4 py-5">
                                                <p className="text-sm text-slate-700">{booking.route}</p>
                                                <p className="text-xs text-slate-500">{booking.date}</p>
                                            </td>
                                            <td className="px-4 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="p-2 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Live Tracker Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Truck size={120} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-6">Live Tracking</h3>

                        <div className="space-y-8 relative">
                            <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100"></div>

                            <div className="flex gap-6 relative z-10">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-4 border-white shadow-md">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">08:30 AM</p>
                                    <p className="text-sm font-bold text-slate-900">Crop Loaded</p>
                                    <p className="text-xs text-slate-500">Warehouse Nagpur Sector 4</p>
                                </div>
                            </div>

                            <div className="flex gap-6 relative z-10">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center border-4 border-white shadow-md">
                                    <Truck className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">11:45 AM</p>
                                    <p className="text-sm font-bold text-slate-900">En Route</p>
                                    <p className="text-xs text-slate-500">Passing NH-44 Toll Plaza</p>
                                </div>
                            </div>

                            <div className="flex gap-6 relative z-10">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Est. 04:00 PM</p>
                                    <p className="text-sm font-bold text-slate-400">Mumbai Mandi Arrival</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-slate-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">Karan Singh</p>
                                    <p className="text-xs text-slate-500">Verified Driver</p>
                                </div>
                                <button className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors">
                                    <Phone className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal (Simplified) */}
            {showBookingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setShowBookingModal(false)}
                    ></div>
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">Request Transportation</h3>
                            <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Crop Type</label>
                                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none">
                                        <option>Wheat</option>
                                        <option>Rice</option>
                                        <option>Cotton</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Weight (Tons)</label>
                                    <input type="number" placeholder="e.g. 5" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Destination</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" placeholder="Select Mandi or enter address" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none" />
                                </div>
                            </div>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                            >
                                Submit Booking Request
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
