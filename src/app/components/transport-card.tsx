import { Truck, MapPin, Clock, Phone, Plus, ArrowRight, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';
import { transportAPI } from '../services/api';

interface TransportCardProps {
  onViewAll?: () => void;
  user?: any;
}

export function TransportCard({ onViewAll, user }: TransportCardProps) {
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestBooking();
  }, []);

  const fetchLatestBooking = async () => {
    try {
      setLoading(true);
      const bookings = await transportAPI.getMyRequests();
      if (bookings && bookings.length > 0) {
        setActiveBooking(bookings[0]);
      }
    } catch (err) {
      console.error('Failed to fetch active booking:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/50 shadow-sm hover:shadow-xl transition-all duration-500 group">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Logistics</h3>
          <p className="text-sm text-slate-500 font-medium">Vehicle & Shipments</p>
        </div>
        <button
          onClick={onViewAll}
          className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-slate-900/10"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Fleet...</p>
        </div>
      ) : activeBooking ? (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Truck size={100} className="text-white" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${activeBooking.status === 'Accepted' ? 'bg-green-500 text-white' :
                  activeBooking.status === 'In Transit' ? 'bg-blue-500 text-white' :
                    'bg-amber-500 text-white'
                  }`}>
                  {activeBooking.status}
                </span>
                <span className="text-white/40 text-[10px] font-bold">#{activeBooking.id?.slice(-6)}</span>
              </div>

              <h4 className="text-xl font-black text-white mb-1">{activeBooking.crop}</h4>
              <p className="text-white/60 text-sm font-medium mb-6">{activeBooking.quantity} Tons — {activeBooking.destination || 'Selected Mandi'}</p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-xs font-bold tracking-tight">{activeBooking.driverName || 'Finding Driver...'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-4 bg-slate-50 text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all border border-slate-100 flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" /> Call
            </button>
            <button
              onClick={onViewAll}
              className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
            >
              Track Live <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="py-12 border-2 border-dashed border-slate-100 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
            <Truck className="w-8 h-8 text-slate-200" />
          </div>
          <div>
            <p className="font-black text-slate-900">No shipments yet</p>
            <p className="text-xs text-slate-400 font-medium px-8">Book reliable transport for your crops today.</p>
          </div>
          <button
            onClick={onViewAll}
            className="px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-600/10 hover:shadow-green-600/30 transition-all"
          >
            Start Booking
          </button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex -space-x-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden ring-2 ring-slate-50">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=driver${i}`} alt="driver" />
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-white bg-green-50 text-green-600 flex items-center justify-center text-[10px] font-black ring-2 ring-green-50/20">
            +12
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Drivers Nearby</p>
      </div>
    </div>
  );
}