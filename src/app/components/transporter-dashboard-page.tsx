import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    LogOut,
    Bell,
    TrendingUp,
    Truck,
    MapPin,
    Plus,
    Trash2,
    Clock,
    Search,
    ChevronRight,
    Map as MapIcon,
    Package,
    CheckCircle2
} from 'lucide-react';
import { vehicleAPI, communityAPI, transportAPI, User, Vehicle, Post } from '../services/api';
import { PlacesAutocomplete } from './places-autocomplete';

export function TransporterDashboardPage({ user, onLogout }: { user: User, onLogout: () => void }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [availableRequests, setAvailableRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
        type: 'Small Truck',
        vehicleNumber: '',
        capacity: '500kg',
        currentLocation: '',
        availableTime: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [vData, rData] = await Promise.all([
                vehicleAPI.getMyVehicles(),
                transportAPI.getAllRequests()
            ]);
            setVehicles(vData);
            // Let transporters see pending requests, and requests they have accepted
            setAvailableRequests(rData.filter((r: any) => r.status === 'Pending' || (r.status === 'Accepted' && r.driverId === user._id)));
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await vehicleAPI.add(newVehicle as Vehicle);
            setShowAddModal(false);
            setNewVehicle({ type: 'Small Truck', vehicleNumber: '', capacity: '500kg', currentLocation: '', availableTime: '' });
            fetchData();
        } catch (err) {
            alert('Failed to add vehicle');
        }
    };

    const handleDeleteVehicle = async (id: string) => {
        if (!confirm('Are you sure you want to remove this vehicle?')) return;
        try {
            await vehicleAPI.delete(id);
            fetchData();
        } catch (err) {
            alert('Failed to remove vehicle');
        }
    };

    const handleAcceptJob = async (id: string) => {
        if (vehicles.length === 0) {
            alert("You must add at least one vehicle to your fleet before accepting jobs.");
            return;
        }

        try {
            await transportAPI.acceptRequest(id);
            fetchData(); // Refresh list immediately
        } catch (err: any) {
            alert(err.message || 'Failed to accept job');
        }
    };

    if (!user) return null;

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                            <Truck className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-800">
                            Agri<span className="text-orange-600">Logistics</span>
                        </h1>
                    </div>

                    <nav className="space-y-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-700 rounded-xl font-bold transition-all shadow-sm">
                            <LayoutDashboard className="w-5 h-5" />
                            Fleet Overview
                        </button>

                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white overflow-hidden shadow-sm">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 font-medium truncate uppercase tracking-widest">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-24 min-h-[96px] border-b border-slate-100 flex items-center justify-between px-10 bg-white">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Transporter Dashboard</h2>
                        <p className="text-sm text-slate-500 font-medium italic">Manage your fleet and find transport jobs</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-slate-900/10"
                        >
                            <Plus className="w-4 h-4" />
                            Add Vehicle
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                    {/* My Vehicles Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-xs flex items-center gap-3">
                                <Truck className="w-4 h-4 text-orange-600" />
                                My Active Fleet ({vehicles.length})
                            </h3>
                        </div>

                        {vehicles.length === 0 && !loading ? (
                            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Truck className="w-8 h-8 text-slate-300" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800">No vehicles added yet</h4>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">Add your truck or tractor details to start seeing local transport requests.</p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="px-6 py-3 bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-widest"
                                >
                                    Add Your First Vehicle
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {loading ? (
                                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-slate-100"></div>)
                                ) : (
                                    vehicles.map((v) => (
                                        <div key={v._id || (v as any).id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all group">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                                                    <Truck className="w-6 h-6 text-orange-600" />
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteVehicle((v._id || (v as any).id))}
                                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-black text-slate-900">{v.type}</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{v.vehicleNumber}</p>
                                            </div>
                                            <div className="mt-6 flex items-center gap-4 pt-4 border-t border-slate-50">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                                                    {v.capacity}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                                    {v.currentLocation || 'Not Set'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </section>

                    {/* Available Requests Section */}
                    <section>
                        <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-xs flex items-center gap-3 mb-6">
                            <Clock className="w-4 h-4 text-blue-600" />
                            Pending Jobs ({availableRequests.length})
                        </h3>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            {availableRequests.length === 0 ? (
                                <div className="p-12 text-center opacity-40">
                                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-sm font-bold">No pending transport requests in your area</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {availableRequests.map((req) => (
                                        <div key={req.id} className="p-8 hover:bg-slate-50/50 transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-8">
                                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                                                    <Package className="w-8 h-8 text-blue-600" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-xl font-black text-slate-900">{req.crop} Transport</h4>
                                                    <div className="flex items-center gap-6 text-sm font-bold text-slate-500">
                                                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-500" /> {req.pickupLocation}</span>
                                                        <span className="flex items-center gap-1.5 italic">⚖️ {req.quantity}</span>
                                                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" /> {req.preferredDate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right mr-4">
                                                    <p className="text-xs font-bold text-slate-400 uppercase">Farmer</p>
                                                    <p className="text-sm font-black text-slate-800">{req.farmerName}</p>
                                                </div>
                                                {req.status === 'Pending' ? (
                                                    <button
                                                        onClick={() => handleAcceptJob(req.id)}
                                                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all"
                                                    >
                                                        Accept Job
                                                    </button>
                                                ) : (
                                                    <div className="px-6 py-3 bg-green-50 text-green-700 rounded-2xl font-black text-xs uppercase tracking-widest border border-green-200">
                                                        Accepted - Use Chat Widget
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {/* Add Vehicle Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Add New Vehicle</h2>
                            <button onClick={() => setShowAddModal(false)} className="bg-slate-50 p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-all">✕</button>
                        </div>
                        <form onSubmit={handleAddVehicle} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Type</label>
                                    <select
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20"
                                        value={newVehicle.type}
                                        onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value })}
                                    >
                                        <option>Small Truck</option>
                                        <option>Large Truck</option>
                                        <option>Tractor</option>
                                        <option>Pickup Van</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Number</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="MH-12-AB-1234"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20"
                                        value={newVehicle.vehicleNumber}
                                        onChange={e => setNewVehicle({ ...newVehicle, vehicleNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Capacity</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 2 Tons"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20"
                                        value={newVehicle.capacity}
                                        onChange={e => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Current Location</label>
                                    <PlacesAutocomplete
                                        onSelect={(address) => setNewVehicle({ ...newVehicle, currentLocation: address })}
                                        defaultValue={newVehicle.currentLocation}
                                        placeholder="City/Area"
                                        className="group"
                                    />
                                </div>
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-slate-900 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                                >
                                    Register Vehicle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}


