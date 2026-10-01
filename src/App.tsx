import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { onAuthStateChange } from '@/services/supabase/auth';
import { getCurrentUser } from '@/services/supabase/auth';

// Pages
import Dashboard from '@/pages/Dashboard';
import DailyDiary from '@/pages/DailyDiary';
import Analytics from '@/pages/Analytics';
import Portfolio from '@/pages/Portfolio';
import Watchlist from '@/pages/Watchlist';
import Orders from '@/pages/Orders';
import Dividends from '@/pages/Dividends';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import AIAssistant from '@/pages/AIAssistant';

// Components
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Header from '@/components/common/Header';

function App() {
  const { setUser, isLoading, setIsLoading } = useAppStore();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const { user } = await getCurrentUser();
      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name,
          avatar_url: (user.user_metadata as { avatar_url?: string } | undefined)?.avatar_url,
        });
      }
      setIsLoading(false);
    };

    checkAuth();

    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name,
          avatar_url: (user.user_metadata as { avatar_url?: string } | undefined)?.avatar_url,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setUser, setIsLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-green-500 dark:border-slate-700 dark:border-t-green-500"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
                <Header />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/diary" element={<Navigate to={`/diary/${todayYear}/${todayMonth}/${todayDay}`} replace />} />
                    <Route path="/diary/:year/:month/:day" element={<DailyDiary />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/dividends" element={<Dividends />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
