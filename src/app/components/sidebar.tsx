import { X, Store } from 'lucide-react';
import { Element4, Book1, Chart, MessageText, Cloud, Truck, Setting2 } from 'iconsax-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { id: 'dashboard', icon: Element4, label: 'Dashboard' },
  { id: 'sell', icon: Store, label: 'Sell Crops' },
  { id: 'crops', icon: Book1, label: 'Crop Library' },
  { id: 'mandi', icon: Chart, label: 'Mandi Prices' },
  { id: 'community', icon: MessageText, label: 'Community' },
  { id: 'weather', icon: Cloud, label: 'Weather' },
  { id: 'transport', icon: Truck, label: 'Transport' },
  { id: 'settings', icon: Setting2, label: 'Settings' },
];

export function Sidebar({ activeView, onViewChange, isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`
      w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:sticky lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="FarmIQ" className="h-8 w-auto" />
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Farm<span className="text-green-500">IQ</span>
          </h1>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(74,222,128,0.1)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} variant={isActive ? "Bold" : "Outline"} className={isActive ? 'text-green-400' : ''} />
                <span className="font-medium text-[0.95rem]">{item.label}</span>
              </div>
              {item.id === 'community' && (
                <div className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
              )}
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
