import { TABLES, supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@/types';
import { normalizeSupabaseError } from '@/services/supabase/common';

export async function ensureProfile(user: User | { id: string; email?: string; full_name?: string; avatar_url?: string }) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: user };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .upsert(
        {
          id: user.id,
          full_name: user.full_name || user.email?.split('@')[0] || 'Trader',
          avatar_url: user.avatar_url || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to save profile') };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to save profile') };
  }
}

export async function getProfile(userId: string) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: null };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to load profile') };
    }

    return { success: true, data: data || null };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load profile') };
  }
}
