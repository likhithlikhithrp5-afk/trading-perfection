import { TABLES, supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { DiaryEntry, TradingDay, Trade } from '@/types';
import { calculateDailyPerformance } from '@/services/calculations';
import { normalizeSupabaseError, requireUserId } from '@/services/supabase/common';

export async function getDailyDiary(userId: string, date: string): Promise<{ success: boolean; data?: DiaryEntry | null; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: null };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.DIARY_ENTRIES)
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to load daily diary') };
    }

    return { success: true, data: data || null };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load daily diary') };
  }
}

export async function createOrUpdateDailyDiary(
  userId: string,
  date: string,
  notes: string
): Promise<{ success: boolean; data?: DiaryEntry; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: { id: `demo-${date}`, user_id: userId, date, notes } as DiaryEntry };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.DIARY_ENTRIES)
      .upsert(
        {
          user_id: userId,
          date,
          notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to save diary entry') };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to save diary entry') };
  }
}

export async function getTradingDaySummary(userId: string, date: string): Promise<{ success: boolean; data?: TradingDay | null; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: null };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.TRADING_DAYS)
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to load trading day summary') };
    }

    return { success: true, data: data || null };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load trading day summary') };
  }
}

type TradingSummaryTrade = Partial<Trade>;

export function buildTradingDaySummary(date: string, userId: string, trades: TradingSummaryTrade[]): TradingDay {
  const performance = calculateDailyPerformance(trades as Trade[]);

  return {
    id: `summary-${userId}-${date}`,
    user_id: userId,
    date,
    total_gross_pnl: performance.totalGrossPnL,
    total_brokerage: performance.totalBrokerage,
    total_government_charges: performance.totalGovernmentCharges,
    total_other_charges: performance.totalOtherCharges,
    total_net_pnl: performance.totalNetPnL,
    trade_count: performance.tradeCount,
  };
}
