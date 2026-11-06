import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; avatar_url?: string };
}

export interface AuthCredentials {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: AuthUser;
  requiresEmailConfirmation?: boolean;
}

function configurationError(): string {
  return 'Authentication is unavailable because Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
}

function toAuthUser(user: SupabaseUser): AuthUser {
  return {
    id: user.id,
    email: user.email || undefined,
    user_metadata: {
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url,
    },
  };
}

export async function signUp(credentials: AuthCredentials): Promise<AuthResponse> {
  if (!isSupabaseConfigured || !supabase) return { success: false, error: configurationError() };

  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email.trim(),
      password: credentials.password,
      options: {
        data: { full_name: credentials.fullName?.trim() || '' },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Supabase did not return an account. Please try again.' };

    return {
      success: true,
      user: toAuthUser(data.user),
      requiresEmailConfirmation: !data.session,
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to reach Supabase. Check your connection and try again.' };
  }
}

export async function signIn(credentials: Pick<AuthCredentials, 'email' | 'password'>): Promise<AuthResponse> {
  if (!isSupabaseConfigured || !supabase) return { success: false, error: configurationError() };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    });

    if (error) {
      const message = error.message.toLowerCase().includes('email not confirmed')
        ? 'Please verify your email address before signing in.'
        : error.message;
      return { success: false, error: message };
    }
    if (!data.user) return { success: false, error: 'Supabase did not return a user. Please try again.' };

    return { success: true, user: toAuthUser(data.user) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to reach Supabase. Check your connection and try again.' };
  }
}

export async function sendPasswordReset(email: string): Promise<AuthResponse> {
  if (!isSupabaseConfigured || !supabase) return { success: false, error: configurationError() };

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error ? { success: false, error: error.message } : { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to send the reset email. Check your connection and try again.' };
  }
}

export async function updatePassword(password: string): Promise<AuthResponse> {
  if (!isSupabaseConfigured || !supabase) return { success: false, error: configurationError() };

  try {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) return { success: false, error: error.message };
    return data.user ? { success: true, user: toAuthUser(data.user) } : { success: false, error: 'Supabase did not return a user.' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to update your password. Check your connection and try again.' };
  }
}

export async function signOut(): Promise<AuthResponse> {
  if (!isSupabaseConfigured || !supabase) return { success: false, error: configurationError() };

  try {
    const { error } = await supabase.auth.signOut();
    return error ? { success: false, error: error.message } : { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to sign out. Please try again.' };
  }
}

export async function getCurrentSession() {
  if (!isSupabaseConfigured || !supabase) return { session: null, error: configurationError() };

  try {
    const { data, error } = await supabase.auth.getSession();
    return error ? { session: null, error: error.message } : { session: data.session, error: null };
  } catch (error) {
    return { session: null, error: error instanceof Error ? error.message : 'Unable to restore the Supabase session.' };
  }
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
  if (!isSupabaseConfigured || !supabase) return () => undefined;

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? toAuthUser(session.user) : null);
  });

  return () => subscription.unsubscribe();
}
