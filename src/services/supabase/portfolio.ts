import { TABLES, supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Portfolio } from '@/types';
import { normalizeSupabaseError, requireUserId } from '@/services/supabase/common';

export async function listPortfolio(userId: string): Promise<{ success: boolean; data?: Portfolio[]; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: [] };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.PORTFOLIO)
      .select('*')
      .eq('user_id', userId)
      .order('symbol', { ascending: true });

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to load portfolio') };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load portfolio') };
  }
}

export async function upsertHolding(userId: string, holding: Partial<Portfolio>): Promise<{ success: boolean; data?: Portfolio; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: { id: `demo-holding-${Date.now()}`, user_id: userId, symbol: holding.symbol || '', quantity: holding.quantity || 0, average_price: holding.average_price || 0, current_price: holding.current_price || 0 } as Portfolio };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.PORTFOLIO)
      .upsert(
        {
          user_id: userId,
          symbol: holding.symbol,
          quantity: holding.quantity ?? 0,
          average_price: holding.average_price ?? 0,
          current_price: holding.current_price ?? 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,symbol' }
      )
      .select()
      .single();

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to save portfolio holding') };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to save portfolio holding') };
  }
}

export async function deleteHolding(userId: string, symbol: string): Promise<{ success: boolean; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from(TABLES.PORTFOLIO)
      .delete()
      .eq('user_id', userId)
      .eq('symbol', symbol);

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to delete holding') };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to delete holding') };
  }
}
