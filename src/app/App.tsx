import { useState } from 'react';
import { Sidebar } from './components/sidebar';
import { Navbar } from './components/navbar';
import { WeatherCard } from './components/weather-card';
import { MandiPricesCard } from './components/mandi-prices-card';
import { CommunityCard } from './components/community-card';
import { TransportCard } from './components/transport-card';
import { MandiPricesPage } from './components/mandi-prices-page';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/40 flex">
      <Sidebar activeView={currentView} onViewChange={setCurrentView} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar profileImage="https://images.unsplash.com/photo-1595956481935-a9e254951d49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXIlMjBwcm9maWxlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNDcwMDUxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />

        <main className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' ? (
            <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Welcome Header */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Welcome back, Rajesh! 👋
                      </h1>
                    </div>
                    <p className="text-slate-600">
                      Here's what's happening with your farm today
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all">
                    <Sparkles className="w-5 h-5" />
                    Get AI Insights
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Total Crops</p>
                    <p className="text-2xl font-bold text-slate-900">8</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-slate-600 mb-1">Active Fields</p>
                    <p className="text-2xl font-bold text-green-600">3</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-slate-600 mb-1">Revenue (MTD)</p>
                    <p className="text-2xl font-bold text-blue-600">₹45.2K</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm text-slate-600 mb-1">Next Harvest</p>
                    <p className="text-2xl font-bold text-amber-600">12 days</p>
                  </div>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WeatherCard />
                <MandiPricesCard
                  onViewAll={() => setCurrentView('mandi')}
                  images={{
                    wheat: 'https://images.unsplash.com/photo-1721577756352-54505d771f0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGZpZWxkJTIwYWdyaWN1bHR1cmV8ZW58MXx8fHwxNzcyMzk4NTIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
                    rice: 'https://images.unsplash.com/photo-1603106116068-02fc27fe5131?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwcGFkZHklMjBjcm9wfGVufDF8fHx8MTc3MjQ3MDA1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
                    tomato: 'https://images.unsplash.com/photo-1560433802-62c9db426a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b21hdG8lMjB2ZWdldGFibGUlMjBmcmVzaHxlbnwxfHx8fDE3NzI0MjYyNjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
                  }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CommunityCard />
                <TransportCard />
              </div>
            </div>
          ) : currentView === 'mandi' ? (
            <MandiPricesPage />
          ) : (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-slate-500">
              <Sparkles className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-xl font-medium">This module is coming soon!</p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="mt-4 text-green-600 font-semibold hover:underline"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
