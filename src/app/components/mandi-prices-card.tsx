import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { mandiAPI, MandiData } from '../services/api';

interface PriceItem {
  name: string;
  price: number;
  change: number;
  unit: string;
  image: string;
}

interface MandiPricesCardProps {
  onViewAll?: () => void;
  images: {
    wheat: string;
    rice: string;
    tomato: string;
  };
}

export function MandiPricesCard({ images, onViewAll }: MandiPricesCardProps) {
  const [mandiData, setMandiData] = useState<MandiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Pune');

  useEffect(() => {
    fetchMandiData();
  }, []);

  const fetchMandiData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mandiAPI.getData();
      setMandiData(data);
    } catch (err) {
      setError('Failed to fetch mandi prices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCropImage = (cropName: string): string => {
    const lower = cropName.toLowerCase();
    if (lower.includes('wheat')) return images.wheat;
    if (lower.includes('rice')) return images.rice;
    if (lower.includes('tomato')) return images.tomato;
    return images.wheat; // default
  };

  const calculateChange = (cropName: string): number => {
    if (!mandiData?.trends[cropName]) return 0;
    const trend = mandiData.trends[cropName];
    if (trend.length < 2) return 0;
    const current = trend[trend.length - 1];
    const previous = trend[trend.length - 2];
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mandiData) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg">
        <p className="text-red-600">{error || 'No mandi data available'}</p>
        <button
          onClick={fetchMandiData}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Get top 3 crops for display
  const topCrops = mandiData?.crops?.slice(0, 3) || [];
  const displayPrices: PriceItem[] = topCrops.map(cropName => ({
    name: cropName,
    price: mandiData?.priceTable?.[selectedDistrict]?.[cropName] || 0,
    change: calculateChange(cropName),
    unit: '/quintal',
    image: getCropImage(cropName),
  }));

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Mandi Prices</h3>
          <p className="text-sm text-slate-500">Today's rates - {selectedDistrict}</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          View All →
        </button>
      </div>

      <div className="space-y-4">
        {displayPrices.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">{item.name}</h4>
              <p className="text-xs text-slate-500">{item.unit}</p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">₹{item.price.toLocaleString()}</p>
              <div className="flex items-center gap-1 justify-end">
                {item.change > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">
                      +{item.change.toFixed(1)}%
                    </span>
                  </>
                ) : item.change < 0 ? (
                  <>
                    <TrendingDown className="w-3 h-3 text-red-600" />
                    <span className="text-xs font-medium text-red-600">
                      {item.change.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <Minus className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-medium text-slate-400">
                      0%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}