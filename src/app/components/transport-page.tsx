import { useState, useEffect } from 'react';
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
    Phone,
    X,
    Navigation,
    Weight,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { transportAPI, Vehicle } from '../services/api';
import { PlacesAutocomplete } from './places-autocomplete';

export function TransportPage({ user }: { user?: any }) {
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    const [nearbyVehicles, setNearbyVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [bookingStep, setBookingStep] = useState(1);
    const [nearVehiclesLoading, setNearVehiclesLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        crop: '',
        quantity: '',
        pickupLocation: user?.location || '',
        destination: '',
        preferredDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            const [myBookings, vehicles] = await Promise.all([
                transportAPI.getMyRequests(),
                transportAPI.getNearbyVehicles(user?.location)
            ]);
            setBookings(myBookings);
            setNearbyVehicles(vehicles);
        } catch (err) {
            console.error('Failed to fetch transport data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBooking = async () => {
        try {
            setIsLoading(true);
            await transportAPI.bookTransport({
                ...formData,
                farmerName: user?.name,
                phone: user?.phone || '',
                pickupLocation: formData.pickupLocation,
                preferredDate: formData.preferredDate,
                quantity: formData.quantity
            });
            setShowBookingModal(false);
            setBookingStep(1);
            fetchInitialData();
        } catch (err) {
            console.error('Booking failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Accepted': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'In Transit': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
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
                        <Navigation className="w-4 h-4 text-green-600" />
                        Book and track your crop shipments
                    </p>
                </div>

                <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    New Shipment Request
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: 'Active', value: bookings.filter(b => b.status === 'In Transit').length, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Delivered', value: bookings.filter(b => b.status === 'Delivered').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Pending Approval', value: bookings.filter(b => b.status === 'Pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Transporters Nearby', value: nearbyVehicles.length, icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] md:text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-xl md:text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="px-6 md:px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="font-bold text-slate-900 text-lg">My Shipments</h3>
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Order ID / Crop..."
                                    className="w-full sm:w-auto pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5">Shipment Details</th>
                                        <th className="px-4 py-5">Destination</th>
                                        <th className="px-4 py-5">Transporter</th>
                                        <th className="px-4 py-5">Status</th>
                                        <th className="px-8 py-5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-2" />
                                                <p className="text-sm text-slate-500 font-medium">Syncing shipments...</p>
                                            </td>
                                        </tr>
                                    ) : bookings.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Truck className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="text-slate-900 font-bold mb-1">No bookings found</p>
                                                <p className="text-sm text-slate-500 mb-6">Start by requesting a new transport</p>
                                                <button
                                                    onClick={() => setShowBookingModal(true)}
                                                    className="px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-600/20"
                                                >
                                                    Book Now
                                                </button>
                                            </td>
                                        </tr>
                                    ) : (
                                        bookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-slate-50/80 transition-all group cursor-pointer border-l-4 border-transparent hover:border-green-500">
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-slate-900 flex items-center gap-2 mb-1 uppercase tracking-tight">
                                                        #{booking.id?.slice(-6)} <ArrowRight className="w-3 h-3 text-slate-300" /> {booking.crop}
                                                    </p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                                                        <Weight className="w-3 h-3" /> {booking.quantity} tons
                                                    </p>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <p className="text-sm font-bold text-slate-700">{booking.destination || booking.pickupLocation}</p>
                                                    <p className="text-xs text-slate-400 font-medium">{new Date(booking.preferredDate).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-4 py-6">
                                                    {booking.driverName ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                                <User className="w-4 h-4 text-indigo-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-900">{booking.driverName}</p>
                                                                <p className="text-[10px] text-slate-500">{booking.vehicleNumber}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Matching...</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-6 text-center">
                                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border ${getStatusStyle(booking.status)} shadow-sm`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    {booking.status === 'Accepted' && booking.driverName ? (
                                                        <div className="flex items-center gap-1.5 justify-end text-green-600 font-bold text-[10px] uppercase tracking-wider">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Booked
                                                        </div>
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-green-500 transition-colors ml-auto" />
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Transporters Nearby Section */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-xl shadow-slate-900/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Navigation size={180} />
                        </div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="font-bold text-xl">Nearby Fleet</h3>
                                <p className="text-slate-400 text-sm">Real-time availability</p>
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Truck className="w-6 h-6 text-green-400" />
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {nearbyVehicles.length === 0 ? (
                                <div className="py-10 text-center border-2 border-dashed border-white/10 rounded-2xl">
                                    <p className="text-slate-500 text-sm font-medium">Scanning area...</p>
                                </div>
                            ) : (
                                nearbyVehicles.map((v, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 cursor-pointer group/item">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                            <Truck className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold">{v.type}</p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{v.capacity} tons • {v.currentLocation}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-green-400 mb-1">
                                                <ShieldCheck className="w-3 h-3" /> VERIFIED
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-mono">{v.vehicleNumber}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8 relative z-10">
                            <button
                                onClick={() => setShowBookingModal(true)}
                                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-green-400 hover:text-white transition-all shadow-lg"
                            >
                                Book Express Dispatch
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-8 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            Safe-Transit Guarantee
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            Every transporter on our platform is verified. Your crops are insured during transit for peace of mind.
                        </p>
                    </div>
                </div>
            </div>

            {/* Premium Multi-step Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setShowBookingModal(false)}
                    ></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-slate-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Schedule Transport</h3>
                                <p className="text-slate-500 text-sm font-medium">Step {bookingStep} of 2</p>
                            </div>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all font-bold"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1 bg-slate-50">
                            <div
                                className="h-full bg-green-500 transition-all duration-500 ease-out"
                                style={{ width: `${(bookingStep / 2) * 100}%` }}
                            />
                        </div>

                        <div className="p-10">
                            {bookingStep === 1 ? (
                                <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Crop Type</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['Wheat', 'Rice', 'Cotton', 'Sugarcane'].map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setFormData({ ...formData, crop: type })}
                                                        className={`py-4 rounded-2xl border-2 font-bold transition-all ${formData.crop === type
                                                            ? 'border-green-500 bg-green-50 text-green-700'
                                                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-green-200'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-3 flex flex-col justify-end">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Est. Weight (Tons)</label>
                                            <div className="relative">
                                                <Weight className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                                <input
                                                    type="number"
                                                    value={formData.quantity}
                                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                                    placeholder="0.00"
                                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-green-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Preferred Pickup Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                            <input
                                                type="date"
                                                value={formData.preferredDate}
                                                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-green-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        disabled={!formData.crop || !formData.quantity}
                                        onClick={() => setBookingStep(2)}
                                        className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-lg hover:shadow-2xl hover:shadow-slate-900/30 transition-all active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3"
                                    >
                                        Next Component <ArrowRight className="w-6 h-6" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pickup Information</label>
                                            <PlacesAutocomplete
                                                onSelect={(address) => setFormData({ ...formData, pickupLocation: address })}
                                                defaultValue={formData.pickupLocation}
                                                placeholder="Enter pickup address"
                                                className="group"
                                                icon={<MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />}
                                                inputClassName="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-green-400 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Drop-off Destination</label>
                                            <PlacesAutocomplete
                                                onSelect={(address) => setFormData({ ...formData, destination: address })}
                                                defaultValue={formData.destination}
                                                placeholder="Mandi or City name"
                                                className="group"
                                                icon={<MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />}
                                                inputClassName="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-green-400 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-orange-50 p-6 rounded-[2rem] border-2 border-orange-100 flex gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            <Truck className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-orange-900">Broadcast Request</p>
                                            <p className="text-sm text-orange-700 font-medium">Your request will be visible to {nearbyVehicles.length} transporters nearby.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setBookingStep(1)}
                                            className="px-8 py-5 bg-slate-50 text-slate-400 rounded-3xl font-black hover:bg-slate-100 transition-all active:scale-95"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleBooking}
                                            disabled={isLoading || !formData.destination}
                                            className="flex-1 py-5 bg-green-600 text-white rounded-3xl font-black text-lg hover:bg-green-700 hover:shadow-2xl hover:shadow-green-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Broadcast Shipment'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

