import { TABLES, supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Dividend } from '@/types';
import { normalizeSupabaseError, requireUserId } from '@/services/supabase/common';

export async function listDividends(userId: string): Promise<{ success: boolean; data?: Dividend[]; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: [] };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.DIVIDENDS)
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to load dividends') };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load dividends') };
  }
}

export async function createDividend(userId: string, dividend: Partial<Dividend>): Promise<{ success: boolean; data?: Dividend; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: { id: `demo-dividend-${Date.now()}`, user_id: userId, symbol: dividend.symbol || '', quantity: dividend.quantity || 0, dividend_per_share: dividend.dividend_per_share || 0, total_dividend: dividend.total_dividend || 0, date: dividend.date || new Date().toISOString().slice(0, 10), status: dividend.status || 'pending' } as Dividend };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.DIVIDENDS)
      .insert([
        {
          user_id: userId,
          symbol: dividend.symbol || '',
          quantity: dividend.quantity || 0,
          dividend_per_share: dividend.dividend_per_share || 0,
          total_dividend: dividend.total_dividend || 0,
          date: dividend.date || new Date().toISOString().slice(0, 10),
          status: dividend.status || 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to create dividend record') };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to create dividend record') };
  }
}

export async function updateDividend(userId: string, dividendId: string, updates: Partial<Dividend>): Promise<{ success: boolean; data?: Dividend; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: { id: dividendId, user_id: userId, symbol: updates.symbol || '', quantity: updates.quantity || 0, dividend_per_share: updates.dividend_per_share || 0, total_dividend: updates.total_dividend || 0, date: updates.date || new Date().toISOString().slice(0, 10), status: updates.status || 'pending' } as Dividend };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.DIVIDENDS)
      .update({ ...updates })
      .eq('id', dividendId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to update dividend record') };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to update dividend record') };
  }
}

export async function deleteDividend(userId: string, dividendId: string): Promise<{ success: boolean; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from(TABLES.DIVIDENDS)
      .delete()
      .eq('id', dividendId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to delete dividend record') };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to delete dividend record') };
  }
}
