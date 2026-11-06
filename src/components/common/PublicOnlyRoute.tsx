import { Navigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, isLoading } = useAppStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-green-500 dark:border-slate-700 dark:border-t-green-500" />
      </div>
    );
  }

  return user ? <Navigate to="/" replace /> : <>{children}</>;
}
