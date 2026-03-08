import { useState, useEffect } from 'react';
import { Sidebar } from './components/sidebar';
import { Navbar } from './components/navbar';
import { WeatherCard } from './components/weather-card';
import { MandiPricesCard } from './components/mandi-prices-card';
import { CommunityCard } from './components/community-card';
import { TransportCard } from './components/transport-card';
import { MandiPricesPage } from './components/mandi-prices-page';
import { CommunityPage } from './components/community-page';
import { CropLibraryPage } from './components/crop-library-page';
import { WeatherPage } from './components/weather-page';
import { TransportPage } from './components/transport-page';
import { LoginPage } from './components/login-page';
import { SignupPage } from './components/signup-page';
import { ProfilePage } from './components/profile-page';
import { Sparkles } from 'lucide-react';
import { AIInsightsModal } from './components/ai-insights-modal';
import { LandingPage } from './components/landing-page';
import { DashboardPage } from './components/dashboard-page';
import { ExpertDashboardPage } from './components/expert-dashboard-page';
import { TransporterDashboardPage } from './components/transporter-dashboard-page';
import { GlobalChatWidget } from './components/global-chat-widget';
import { SellCropsPage } from './components/sell-crops-page';
import { BuyerDashboardPage } from './components/buyer-dashboard-page';
import { AIAssistantPage } from './components/ai-assistant-page';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // default to landing page
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(!!token);

  useEffect(() => {
    if (token && !user) {
      setIsAuthorizing(true);
      fetch('http://localhost:5001/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Not logged in');
          return res.json();
        })
        .then(data => {
          setUser(data);
          // Auto-redirect if on generic views
          const isGenericView = currentView === 'landing' || currentView === 'login' || currentView === 'signup';
          if (isGenericView) {
            if (data.role === 'expert') setCurrentView('expert-dashboard');
            else if (data.role === 'transporter') setCurrentView('transporter-dashboard');
            else setCurrentView('dashboard');
          }
        })
        .catch((err) => {
          console.error('Session expired', err);
          handleLogout();
        })
        .finally(() => {
          setIsAuthorizing(false);
        });
    } else if (!token) {
      setIsAuthorizing(false);
    }
  }, [token]);

  // Force role-based view enforcement
  useEffect(() => {
    if (user) {
      if (user.role === 'expert' && !['expert-dashboard', 'profile'].includes(currentView)) {
        setCurrentView('expert-dashboard');
      } else if (user.role === 'transporter' && !['transporter-dashboard', 'profile'].includes(currentView)) {
        setCurrentView('transporter-dashboard');
      } else if (user.role === 'buyer' && !['buyer-dashboard', 'profile'].includes(currentView)) {
        setCurrentView('buyer-dashboard');
      } else if (user.role === 'farmer' && (currentView === 'expert-dashboard' || currentView === 'transporter-dashboard' || currentView === 'buyer-dashboard')) {
        setCurrentView('dashboard');
      }
    }
  }, [user, currentView]);

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    if (newUser?.role === 'expert') {
      setCurrentView('expert-dashboard');
    } else if (newUser?.role === 'transporter') {
      setCurrentView('transporter-dashboard');
    } else if (newUser?.role === 'buyer') {
      setCurrentView('buyer-dashboard');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentView('landing');
  };

  const handleGetStarted = () => {
    if (token && user) {
      if (user.role === 'expert') {
        setCurrentView('expert-dashboard');
      } else if (user.role === 'transporter') {
        setCurrentView('transporter-dashboard');
      } else if (user.role === 'buyer') {
        setCurrentView('buyer-dashboard');
      } else {
        setCurrentView('dashboard');
      }
    } else {
      setCurrentView('login');
    }
  };

  const isAuthView = currentView === 'login' || currentView === 'signup' || currentView === 'landing';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/40 flex">
      {!isAuthView && user?.role === 'farmer' && (
        <Sidebar
          activeView={currentView}
          onViewChange={(view) => {
            setCurrentView(view);
            setIsSidebarOpen(false);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && !isAuthView && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {isAuthorizing ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/50 backdrop-blur-md">
            <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mb-4 shadow-lg shadow-green-600/10"></div>
            <p className="text-slate-600 font-bold animate-pulse tracking-wide uppercase text-xs">Syncing your profile...</p>
          </div>
        ) : (
          <>
            {!isAuthView && user?.role === 'farmer' && (
              <Navbar
                profileImage={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Achintya Singh'}`}
                onMenuClick={() => setIsSidebarOpen(true)}
                onProfileClick={() => setCurrentView('profile')}
                isLoggedIn={!!token}
                user={user}
              />
            )}

            <main className="flex-1 overflow-y-auto">
              {currentView === 'dashboard' ? (
                <DashboardPage
                  user={user}
                  onNavigate={setCurrentView}
                  onOpenAI={() => setIsAIModalOpen(true)}
                />
              ) : currentView === 'mandi' ? (
                <MandiPricesPage />
              ) : currentView === 'community' ? (
                <CommunityPage user={user} />
              ) : currentView === 'crops' ? (
                <CropLibraryPage />
              ) : currentView === 'weather' ? (
                <WeatherPage />
              ) : currentView === 'sell' ? (
                <SellCropsPage user={user!} />
              ) : currentView === 'transport' ? (
                <TransportPage user={user} />
              ) : currentView === 'landing' ? (
                <LandingPage onGetStarted={handleGetStarted} />
              ) : currentView === 'login' ? (
                <LoginPage onNavigate={setCurrentView} onLoginSuccess={handleLoginSuccess} />
              ) : currentView === 'signup' ? (
                <SignupPage onNavigate={setCurrentView} onLoginSuccess={handleLoginSuccess} />
              ) : currentView === 'profile' ? (
                <ProfilePage token={token} onLogout={handleLogout} onNavigate={setCurrentView} />
              ) : currentView === 'expert-dashboard' ? (
                <ExpertDashboardPage user={user} onLogout={handleLogout} />
              ) : currentView === 'transporter-dashboard' ? (
                <TransporterDashboardPage user={user} onLogout={handleLogout} />
              ) : currentView === 'buyer-dashboard' ? (
                <BuyerDashboardPage user={user!} onLogout={handleLogout} />
              ) : currentView === 'ai-assistant' ? (
                <AIAssistantPage user={user!} />
              ) : (
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-slate-500">
                  <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-xl font-medium">This module is coming soon!</p>
                  <button
                    onClick={() => {
                      if (user?.role === 'expert') setCurrentView('expert-dashboard');
                      else if (user?.role === 'transporter') setCurrentView('transporter-dashboard');
                      else setCurrentView('dashboard');
                    }}
                    className="mt-4 text-green-600 font-semibold hover:underline"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </main>
          </>
        )}
      </div>

      <AIInsightsModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      <GlobalChatWidget currentUser={user} />
    </div>
  );
}


