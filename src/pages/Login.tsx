import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { signIn } from '@/services/supabase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setLoading(true);
    const response = await signIn({ email, password });
    setLoading(false);

    if (!response.success) {
      setError(response.error || 'Unable to sign in. Please try again.');
      return;
    }

    const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';
    navigate(destination, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-profit">Trade Journal AI</h1>
          <p className="text-slate-600 dark:text-slate-400">Trade. Record. Analyze. Improve.</p>
        </div>

        {!isSupabaseConfigured && (
          <div role="alert" className="mb-4 rounded-lg border border-amber-400/40 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
            Authentication needs Supabase configuration. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your local environment.
          </div>
        )}
        {error && <div role="alert" className="mb-4 rounded-lg border border-loss/30 bg-loss/10 p-3 text-sm text-loss">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-2 block text-sm font-medium">Email</label>
            <input id="login-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-profit dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="you@example.com" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium">Password</label>
              <Link to="/forgot-password" className="text-sm font-medium text-profit hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 focus:outline-none focus:ring-2 focus:ring-profit dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Your password" />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 text-slate-500">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading || !isSupabaseConfigured} className="w-full rounded-lg bg-profit py-3 font-semibold text-white transition-colors hover:bg-profit/90 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account? <Link to="/signup" className="font-medium text-profit hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
