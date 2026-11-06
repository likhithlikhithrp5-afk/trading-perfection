import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAppStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-green-500 dark:border-slate-700 dark:border-t-green-500" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Restoring your session...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />;
}
