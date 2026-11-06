import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { getCurrentSession, onAuthStateChange, type AuthUser } from '@/services/supabase/auth';
import { getTrades } from '@/services/supabase/trades';
import { getCapitalSettings } from '@/services/supabase/capital';

import Dashboard from '@/pages/Dashboard';
import DailyDiary from '@/pages/DailyDiary';
import Analytics from '@/pages/Analytics';
import Portfolio from '@/pages/Portfolio';
import Watchlist from '@/pages/Watchlist';
import Orders from '@/pages/Orders';
import Dividends from '@/pages/Dividends';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import PublicOnlyRoute from '@/components/common/PublicOnlyRoute';
import Header from '@/components/common/Header';

function toStoreUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url,
  };
}

function App() {
  const { setUser, setTrades, setCapitalSettings, isLoading, setIsLoading, error, setError } = useAppStore();

  useEffect(() => {
    let active = true;
    let loadedUserId: string | null | undefined;

    const loadUserTrades = async (authUser: AuthUser | null) => {
      const userId = authUser?.id || null;
      if (loadedUserId === userId) return;
      loadedUserId = userId;

      if (!authUser) {
        setTrades([]);
        setCapitalSettings(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      const [result, capitalResult] = await Promise.all([
        getTrades(authUser.id),
        getCapitalSettings(authUser.id),
      ]);
      if (!active) return;

      const loadErrors: string[] = [];
      if (result.success) {
        setTrades(result.data || []);
      } else {
        setTrades([]);
        loadErrors.push(`Could not load your trades: ${result.error || 'Unknown database error'}`);
      }
      if (capitalResult.success) {
        setCapitalSettings(capitalResult.data || null);
      } else {
        setCapitalSettings(null);
        loadErrors.push(`Could not load capital settings: ${capitalResult.error || 'Unknown database error'}`);
      }
      setError(loadErrors.length ? loadErrors.join(' ') : null);
      setIsLoading(false);
    };

    const unsubscribe = onAuthStateChange((authUser) => {
      if (!active) return;
      setUser(authUser ? toStoreUser(authUser) : null);
      queueMicrotask(() => {
        if (active) void loadUserTrades(authUser);
      });
    });

    const restoreSession = async () => {
      const { session, error: sessionError } = await getCurrentSession();
      if (!active) return;
      if (sessionError) setError(sessionError);
      if (session) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || undefined,
          user_metadata: {
            full_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
          },
        };
        setUser(toStoreUser(authUser));
        await loadUserTrades(authUser);
      } else {
        setUser(null);
        setTrades([]);
        setIsLoading(false);
      }
    };

    void restoreSession();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [setCapitalSettings, setError, setIsLoading, setTrades, setUser]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-green-500 dark:border-slate-700 dark:border-t-green-500" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your journal...</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const diaryToday = `/diary/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
                <Header />
                {error && (
                  <div role="alert" className="mx-auto mt-4 w-full max-w-7xl px-4 text-sm text-loss sm:px-6 lg:px-8">
                    {error}
                  </div>
                )}
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/diary" element={<Navigate to={diaryToday} replace />} />
                    <Route path="/diary/:year/:month/:day" element={<DailyDiary />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/dividends" element={<Dividends />} />
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
