import { TABLES, supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Watchlist } from '@/types';
import { normalizeSupabaseError, requireUserId } from '@/services/supabase/common';

export async function listWatchlist(userId: string): Promise<{ success: boolean; data?: Watchlist[]; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: [] };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.WATCHLIST)
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to load watchlist') };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load watchlist') };
  }
}

export async function addToWatchlist(userId: string, symbol: string): Promise<{ success: boolean; data?: Watchlist; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: { id: `demo-watch-${Date.now()}`, user_id: userId, symbol } as Watchlist };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.WATCHLIST)
      .upsert({ user_id: userId, symbol }, { onConflict: 'user_id,symbol' })
      .select()
      .single();

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to save watchlist symbol') };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to save watchlist symbol') };
  }
}

export async function removeFromWatchlist(userId: string, symbol: string): Promise<{ success: boolean; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from(TABLES.WATCHLIST)
      .delete()
      .eq('user_id', userId)
      .eq('symbol', symbol);

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to remove watchlist symbol') };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to remove watchlist symbol') };
  }
}
