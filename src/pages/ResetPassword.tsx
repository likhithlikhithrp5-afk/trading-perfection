import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { getCurrentSession, updatePassword } from '@/services/supabase/auth';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    void getCurrentSession().then(({ session }) => {
      if (active) setHasRecoverySession(Boolean(session));
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Use at least 8 characters, including a letter and a number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const response = await updatePassword(password);
    setLoading(false);
    if (!response.success) {
      setError(response.error || 'Unable to update your password. Request a new reset link and try again.');
      return;
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <h1 className="mb-2 text-2xl font-bold">Choose a new password</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">Use at least 8 characters, including a letter and a number.</p>
        {error && <div role="alert" className="mb-4 rounded-lg border border-loss/30 bg-loss/10 p-3 text-sm text-loss">{error}</div>}
        {hasRecoverySession === false ? (
          <div className="space-y-4 text-sm">
            <p className="text-slate-600 dark:text-slate-400">This reset link is invalid or has expired. Request a new one to continue.</p>
            <Link to="/forgot-password" className="inline-block rounded-lg bg-profit px-4 py-2 font-semibold text-white">Request another link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-medium">New password</label>
              <div className="relative">
                <input id="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 dark:border-slate-600 dark:bg-slate-700" />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 text-slate-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-new-password" className="mb-2 block text-sm font-medium">Confirm new password</label>
              <input id="confirm-new-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 dark:border-slate-600 dark:bg-slate-700" />
            </div>
            <button type="submit" disabled={loading || hasRecoverySession === null} className="w-full rounded-lg bg-profit py-3 font-semibold text-white hover:bg-profit/90 disabled:opacity-50">{loading ? 'Updating...' : 'Update password'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
