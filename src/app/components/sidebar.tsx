import { X, Store, LogOut } from 'lucide-react';
import { Element4, Book1, Chart, MessageText, Cloud, Truck, Setting2, MagicStar } from 'iconsax-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

const navItems = [
  { id: 'dashboard', icon: Element4, label: 'Dashboard' },
  { id: 'ai-assistant', icon: MagicStar, label: 'FarmIQ AI', isSpecial: true },
  { id: 'sell', icon: Store, label: 'Sell Crops' },
  { id: 'crops', icon: Book1, label: 'Crop Library' },
  { id: 'mandi', icon: Chart, label: 'Mandi Prices' },
  { id: 'community', icon: MessageText, label: 'Community' },
  { id: 'weather', icon: Cloud, label: 'Weather' },
  { id: 'transport', icon: Truck, label: 'Transport' },
];

export function Sidebar({ activeView, onViewChange, isOpen, onClose, onLogout }: SidebarProps) {
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

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Helper Shimmer CSS class since arbitrary animate tailwind classes might need strict definitions or we can just use inline styles if needed, but standard tailwind has no shimmer by default. Let's create an inline style for shimmer. */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes shimmer-effect {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer-effect 2.5s infinite linear;
          }
        `}} />

        {navItems.map((item) => {
          const isActive = activeView === item.id;

          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all relative overflow-hidden ${isActive
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] border border-green-400'
                  : 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20'
                  }`}
              >
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <item.icon size={20} variant={isActive ? "Bold" : "Bulk"} color={isActive ? "white" : "#4ade80"} />
                  <span className="font-bold text-[0.95rem] tracking-wide">{item.label}</span>
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive
                ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} variant={isActive ? "Bold" : "Outline"} className={isActive ? 'text-white' : ''} />
                <span className="font-medium text-[0.95rem]">{item.label}</span>
              </div>
              {item.id === 'community' && (
                <div className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-3">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 hidden">
          <p className="text-sm font-medium text-slate-900 mb-1">Need Help?</p>
          <p className="text-xs text-slate-600 mb-3">Contact our support team</p>
          <button className="w-full bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Get Support
          </button>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl font-medium hover:bg-red-100 transition-colors border border-red-100"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
