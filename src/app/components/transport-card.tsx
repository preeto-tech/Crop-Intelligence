import { Truck, MapPin, Clock, Phone, Plus } from 'lucide-react';
import { useState } from 'react';
import { transportAPI, TransportRequest } from '../services/api';

interface TransportCardProps {
  onViewAll?: () => void;
}

export function TransportCard({ onViewAll }: TransportCardProps) {
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<TransportRequest>({
    farmerName: 'Rajesh Kumar',
    crop: '',
    quantity: '',
    pickupLocation: '',
    phone: '',
    preferredDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await transportAPI.bookTransport(formData);
      console.log('Transport booked:', response);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowBooking(false);
        setFormData({
          farmerName: 'Rajesh Kumar',
          crop: '',
          quantity: '',
          pickupLocation: '',
          phone: '',
          preferredDate: '',
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to book transport:', err);
      alert('Failed to book transport. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (showBooking) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Book Transport</h3>
            <p className="text-sm text-slate-500">Fill in the details</p>
          </div>
          <button
            onClick={() => setShowBooking(false)}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2">Booking Successful!</h4>
            <p className="text-sm text-slate-600">Your transport request has been submitted.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Crop</label>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select crop</option>
                <option value="Wheat">Wheat</option>
                <option value="Rice">Rice</option>
                <option value="Tomato">Tomato</option>
                <option value="Cotton">Cotton</option>
                <option value="Sugarcane">Sugarcane</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g., 50 quintals"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Location</label>
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                placeholder="Full address"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date</label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Transport Booking</h3>
          <p className="text-sm text-slate-500">Book reliable transport</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
          >
            View History →
          </button>
          <button
            onClick={() => setShowBooking(true)}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Book Now
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 mb-1">Sample Transport</h4>
            <p className="text-sm text-slate-600 mb-3">50 quintals to Mumbai Mandi</p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Pune → Mumbai (85 km)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Expected arrival: 2:30 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" />
            Call Driver
          </button>
          <button className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all">
            Track Live
          </button>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Booking ID:</span>
            <span className="font-mono font-semibold text-slate-900">#TRN-2845</span>
          </div>
        </div>
      </div>
    </div>
  );
}