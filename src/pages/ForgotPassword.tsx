import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isSupabaseConfigured } from '@/lib/supabase';
import { sendPasswordReset } from '@/services/supabase/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const response = await sendPasswordReset(email);
    setLoading(false);

    if (!response.success) {
      setError(response.error || 'Unable to send the reset email. Please try again.');
      return;
    }
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <h1 className="mb-2 text-2xl font-bold">Reset your password</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">Enter the email address associated with your account.</p>
        {error && <div role="alert" className="mb-4 rounded-lg border border-loss/30 bg-loss/10 p-3 text-sm text-loss">{error}</div>}
        {sent ? (
          <div role="status" className="rounded-lg border border-profit/30 bg-profit/10 p-4 text-sm text-profit">
            If an account exists for that address, a password reset link is on its way. Check your inbox and spam folder.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label htmlFor="reset-email" className="block text-sm font-medium">Email</label>
            <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 dark:border-slate-600 dark:bg-slate-700" placeholder="you@example.com" />
            {!isSupabaseConfigured && <p className="text-sm text-loss">Supabase environment variables are not configured.</p>}
            <button type="submit" disabled={loading || !isSupabaseConfigured} className="w-full rounded-lg bg-profit py-3 font-semibold text-white hover:bg-profit/90 disabled:opacity-50">{loading ? 'Sending...' : 'Send reset link'}</button>
          </form>
        )}
        <p className="mt-6 text-center text-sm"><Link to="/login" className="font-medium text-profit hover:underline">Back to sign in</Link></p>
      </div>
    </div>
  );
}
