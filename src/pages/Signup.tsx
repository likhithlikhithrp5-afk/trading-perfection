import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { signUp } from '@/services/supabase/auth';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (fullName.trim().length < 2) {
      setError('Enter your full name (at least 2 characters).');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Use at least one letter and one number in your password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const response = await signUp({ email, password, fullName: fullName.trim() });
    setLoading(false);

    if (!response.success) {
      setError(response.error || 'Unable to create your account. Please try again.');
      return;
    }
    if (response.requiresEmailConfirmation) {
      setSuccess('Your account was created. Check your email and confirm your address before signing in.');
      return;
    }

    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <div className="mb-7 text-center">
          <h1 className="mb-2 text-3xl font-bold text-profit">Create your account</h1>
          <p className="text-slate-600 dark:text-slate-400">Start building a clearer trading journal.</p>
        </div>
        {error && <div role="alert" className="mb-4 rounded-lg border border-loss/30 bg-loss/10 p-3 text-sm text-loss">{error}</div>}
        {success && <div role="status" className="mb-4 rounded-lg border border-profit/30 bg-profit/10 p-3 text-sm text-profit">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-name" className="mb-2 block text-sm font-medium">Full name</label>
            <input id="signup-name" type="text" autoComplete="name" required maxLength={100} value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 dark:border-slate-600 dark:bg-slate-700" placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="signup-email" className="mb-2 block text-sm font-medium">Email</label>
            <input id="signup-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 dark:border-slate-600 dark:bg-slate-700" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="signup-password" className="mb-2 block text-sm font-medium">Password</label>
            <div className="relative">
              <input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 dark:border-slate-600 dark:bg-slate-700" placeholder="At least 8 characters" />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 text-slate-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Use at least 8 characters, including a letter and a number.</p>
          </div>
          <div>
            <label htmlFor="signup-confirm-password" className="mb-2 block text-sm font-medium">Confirm password</label>
            <input id="signup-confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 dark:border-slate-600 dark:bg-slate-700" placeholder="Re-enter your password" />
          </div>
          {!isSupabaseConfigured && <p role="alert" className="text-sm text-loss">Set Supabase environment variables before creating an account.</p>}
          <button type="submit" disabled={loading || !isSupabaseConfigured} className="w-full rounded-lg bg-profit py-3 font-semibold text-white hover:bg-profit/90 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Creating account...' : 'Create account'}</button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already registered? <Link to="/login" className="font-medium text-profit hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
