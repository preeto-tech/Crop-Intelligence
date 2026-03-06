import { Search, Bell, Globe, Menu } from 'lucide-react';
import { setTranslationLanguage, getCurrentLanguage, LanguageCode } from '../utils/translation';

interface NavbarProps {
  profileImage: string;
  onMenuClick?: () => void;
  onProfileClick?: () => void;
  isLoggedIn?: boolean;
  user?: any;
}

export function Navbar({ profileImage, onMenuClick, onProfileClick, isLoggedIn, user }: NavbarProps) {
  const currentLang = getCurrentLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTranslationLanguage(e.target.value as LanguageCode);
  };

  return (
    <header className="h-16 md:h-20 bg-white/70 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-10 w-full">
      <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 md:h-5 md:w-5 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 lg:ml-8">
          <div className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <Globe className="w-4 h-4 text-slate-600" />
            <select
              value={currentLang}
              onChange={handleLanguageChange}
              className="bg-transparent text-xs md:text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>

          <button className="relative p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {isLoggedIn ? (
            <button
              onClick={onProfileClick}
              className="flex items-center gap-2 md:gap-3 pl-2 pr-2 md:pl-3 md:pr-4 py-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-all"
            >
              <img
                src={user?.avatar || profileImage}
                alt="Profile"
                className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-cover"
              />
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-slate-900">{user?.name || 'Rajesh Kumar'}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role || 'Farmer'}</p>
              </div>
            </button>
          ) : (
            <button
              onClick={onProfileClick} // Will pass it 'profile' which will redirect to login if not authenticated or we can handle differently. Wait, if not logged in, it shouldn't show profile.
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
