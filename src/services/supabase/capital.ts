import { supabase, TABLES, isSupabaseConfigured } from '@/lib/supabase';
import type { CapitalSettings } from '@/types';
import { normalizeSupabaseError } from '@/services/supabase/common';

export async function getCapitalSettings(userId: string): Promise<{ success: boolean; data?: CapitalSettings | null; error?: string }> {
  if (!userId) return { success: false, error: 'A user is required to load capital settings.' };
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured. Capital settings are unavailable.' };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.CAPITAL_SETTINGS)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return { success: false, error: normalizeSupabaseError(error, 'Failed to load capital settings') };
    return { success: true, data: data as CapitalSettings | null };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load capital settings') };
  }
}
