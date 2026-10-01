import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type ServiceResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export function ensureSupabaseConfigured(): ServiceResult<null> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured. Demo mode is active.' };
  }

  return { success: true, data: null };
}

export function normalizeSupabaseError(error: unknown, fallback: string): string {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    const maybeError = error as { message?: string; details?: string; hint?: string };
    if (maybeError.message) return maybeError.message;
    if (maybeError.details) return maybeError.details;
    if (maybeError.hint) return maybeError.hint;
  }

  return fallback;
}

export function requireUserId(userId?: string): ServiceResult<null> {
  if (!userId) {
    return { success: false, error: 'A user is required for this operation.' };
  }

  return { success: true, data: null };
}

export function getSupabaseClient() {
  return supabase;
}

export function toDateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}
