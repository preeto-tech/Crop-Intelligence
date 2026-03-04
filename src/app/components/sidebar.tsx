import {
  LayoutDashboard,
  Sprout,
  Users,
  TrendingUp,
  CloudSun,
  Truck
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Sprout, label: 'Crop Library', id: 'crops' },
  { icon: Users, label: 'Community', id: 'community' },
  { icon: TrendingUp, label: 'Mandi Prices', id: 'mandi' },
  { icon: CloudSun, label: 'Weather', id: 'weather' },
  { icon: Truck, label: 'Transport Booking', id: 'transport' },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900">Crop Intelligence</h1>
            <p className="text-xs text-slate-500">AgriTech Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/30'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm font-medium text-slate-900 mb-1">Need Help?</p>
          <p className="text-xs text-slate-600 mb-3">Contact our support team</p>
          <button className="w-full bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Get Support
          </button>
        </div>
      </div>
    </aside>
  );
}
