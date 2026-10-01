import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ensureProfile } from '@/services/supabase/profiles';

const demoUser = {
  id: 'demo-user',
  email: 'demo@tradejournal.com',
  user_metadata: { full_name: 'Demo Trader' },
};

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
}

/**
 * Sign up a new user
 */
export async function signUp(credentials: AuthCredentials): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    if (credentials.email && credentials.password) {
      return { success: true, user: { ...demoUser, email: credentials.email, user_metadata: { full_name: credentials.fullName || 'Demo Trader' } } };
    }
    return { success: false, error: 'Email and password are required' };
  }

  try {
    const { data, error } = await supabase!.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.fullName,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Signup completed but no user was returned' };
    }

    const profileResult = await ensureProfile({
      id: data.user.id,
      email: data.user.email || credentials.email,
      full_name: credentials.fullName || data.user.user_metadata?.full_name || 'Trader',
      avatar_url: data.user.user_metadata?.avatar_url,
    });

    if (!profileResult.success) {
      return { success: false, error: profileResult.error || 'Signup succeeded but profile creation failed' };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || credentials.email,
        user_metadata: {
          full_name: data.user.user_metadata?.full_name || credentials.fullName,
          avatar_url: data.user.user_metadata?.avatar_url,
        },
      },
    };
  } catch {
    return { success: false, error: 'An error occurred during signup' };
  }
}

/**
 * Sign in a user
 */
export async function signIn(credentials: Pick<AuthCredentials, 'email' | 'password'>): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    if (credentials.email === 'demo@tradejournal.com' && credentials.password === 'demo123456') {
      return { success: true, user: demoUser };
    }

    if (credentials.email && credentials.password) {
      return { success: true, user: { ...demoUser, email: credentials.email, user_metadata: { full_name: credentials.email.split('@')[0] } } };
    }

    return { success: false, error: 'Email and password are required' };
  }

  try {
    const { data, error } = await supabase!.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Login succeeded but no user was returned' };
    }

    const profileResult = await ensureProfile({
      id: data.user.id,
      email: data.user.email || credentials.email,
      full_name: data.user.user_metadata?.full_name || credentials.email.split('@')[0],
      avatar_url: data.user.user_metadata?.avatar_url,
    });

    if (!profileResult.success) {
      return { success: false, error: profileResult.error || 'Login succeeded but profile sync failed' };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || credentials.email,
        user_metadata: {
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
        },
      },
    };
  } catch {
    return { success: false, error: 'An error occurred during signin' };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase!.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'An error occurred during signout' };
  }
}

/**
 * Get the current session
 */
export async function getCurrentSession() {
  if (!isSupabaseConfigured) {
    return { session: null, error: null };
  }

  try {
    const { data, error } = await supabase!.auth.getSession();

    if (error) {
      return { session: null, error: error.message };
    }

    return { session: data.session, error: null };
  } catch {
    return { session: null, error: 'Failed to get session' };
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    return { user: demoUser, error: null };
  }

  try {
    const { data, error } = await supabase!.auth.getUser();

    if (error) {
      return { user: null, error: error.message };
    }

    return {
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email || undefined,
            user_metadata: {
              full_name: data.user.user_metadata?.full_name,
              avatar_url: data.user.user_metadata?.avatar_url,
            },
          }
        : null,
      error: null,
    };
  } catch {
    return { user: null, error: 'Failed to get user' };
  }
}

/**
 * Listen to auth changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  if (!isSupabaseConfigured) {
    callback(demoUser);
    return () => undefined;
  }

  const { data: authListener } = supabase!.auth.onAuthStateChange(async (_event, session) => {
    callback(
      session?.user
        ? {
            id: session.user.id,
            email: session.user.email || undefined,
            user_metadata: {
              full_name: session.user.user_metadata?.full_name,
              avatar_url: session.user.user_metadata?.avatar_url,
            },
          }
        : null
    );
  });

  return authListener?.subscription.unsubscribe;
}
