import { supabase, TABLES, isSupabaseConfigured } from '@/lib/supabase';
import type { Trade, TradingDay } from '@/types';
import { calculateDailyPerformance, calculateNetPnL, calculateGrossPnL } from '@/services/calculations';
import { normalizeSupabaseError, requireUserId } from '@/services/supabase/common';

type TradeInput = Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'gross_pnl' | 'net_pnl'>;
type TradeUpdates = Partial<TradeInput>;
type TradeResult<T> = { success: boolean; data?: T; error?: string };

function assertDatabaseReady(userId: string): string | undefined {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck.error;
  if (!isSupabaseConfigured || !supabase) {
    return 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before saving journal data.';
  }
  return undefined;
}

function calculateTradePnl(trade: TradeInput | Trade): Pick<Trade, 'gross_pnl' | 'net_pnl'> & { result: Trade['result'] } {
  const gross_pnl = calculateGrossPnL(trade as Trade);
  const net_pnl = calculateNetPnL({ ...trade, gross_pnl } as Trade);
  return {
    gross_pnl,
    net_pnl,
    result: trade.result ?? (net_pnl > 0 ? 'positive' : net_pnl < 0 ? 'negative' : null),
  };
}

export async function createTrade(userId: string, trade: TradeInput): Promise<TradeResult<Trade>> {
  const unavailable = assertDatabaseReady(userId);
  if (unavailable) return { success: false, error: unavailable };

  try {
    const pnl = calculateTradePnl(trade);
    const { data, error } = await supabase!
      .from(TABLES.TRADES)
      .insert({ ...trade, ...pnl, user_id: userId })
      .select()
      .single();

    if (error) return { success: false, error: normalizeSupabaseError(error, 'Failed to save trade') };
    return { success: true, data: data as Trade };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to save trade') };
  }
}

export async function getTrades(userId: string): Promise<TradeResult<Trade[]>> {
  const unavailable = assertDatabaseReady(userId);
  if (unavailable) return { success: false, error: unavailable };

  try {
    const { data, error } = await supabase!
      .from(TABLES.TRADES)
      .select('*')
      .eq('user_id', userId)
      .order('trade_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: normalizeSupabaseError(error, 'Failed to load trades') };
    return { success: true, data: (data || []) as Trade[] };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load trades') };
  }
}

export async function getTradesForDate(userId: string, date: string): Promise<TradeResult<Trade[]>> {
  const unavailable = assertDatabaseReady(userId);
  if (unavailable) return { success: false, error: unavailable };

  try {
    const { data, error } = await supabase!
      .from(TABLES.TRADES)
      .select('*')
      .eq('user_id', userId)
      .eq('trade_date', date)
      .order('trade_time', { ascending: true });

    if (error) return { success: false, error: normalizeSupabaseError(error, 'Failed to load trades for date') };
    return { success: true, data: (data || []) as Trade[] };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load trades for date') };
  }
}

export async function updateTrade(userId: string, tradeId: string, updates: TradeUpdates): Promise<TradeResult<Trade>> {
  const unavailable = assertDatabaseReady(userId);
  if (unavailable) return { success: false, error: unavailable };

  try {
    const { data: existing, error: lookupError } = await supabase!
      .from(TABLES.TRADES)
      .select('*')
      .eq('id', tradeId)
      .eq('user_id', userId)
      .single();

    if (lookupError) return { success: false, error: normalizeSupabaseError(lookupError, 'Could not find this trade') };

    const merged = { ...existing, ...updates } as Trade;
    const pnl = calculateTradePnl(merged);
    const { data, error } = await supabase!
      .from(TABLES.TRADES)
      .update({ ...updates, ...pnl, updated_at: new Date().toISOString() })
      .eq('id', tradeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return { success: false, error: normalizeSupabaseError(error, 'Failed to update trade') };
    return { success: true, data: data as Trade };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to update trade') };
  }
}

export async function deleteTrade(userId: string, tradeId: string): Promise<TradeResult<null>> {
  const unavailable = assertDatabaseReady(userId);
  if (unavailable) return { success: false, error: unavailable };

  try {
    const { data, error } = await supabase!
      .from(TABLES.TRADES)
      .delete()
      .eq('id', tradeId)
      .eq('user_id', userId)
      .select('id')
      .single();

    if (error) return { success: false, error: normalizeSupabaseError(error, 'Failed to delete trade') };
    if (!data) return { success: false, error: 'Trade was not found or you do not have permission to delete it.' };
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to delete trade') };
  }
}

export async function updateTradingDay(userId: string, date: string, trades: Trade[]): Promise<TradeResult<TradingDay>> {
  const unavailable = assertDatabaseReady(userId);
  if (unavailable) return { success: false, error: unavailable };

  try {
    const performance = calculateDailyPerformance(trades);
    const { data: existing, error: lookupError } = await supabase!
      .from(TABLES.TRADING_DAYS)
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (lookupError) return { success: false, error: normalizeSupabaseError(lookupError, 'Failed to load trading day') };
    const values = {
      user_id: userId,
      date,
      total_gross_pnl: performance.totalGrossPnL,
      total_brokerage: performance.totalBrokerage,
      total_government_charges: performance.totalGovernmentCharges,
      total_other_charges: performance.totalOtherCharges,
      total_net_pnl: performance.totalNetPnL,
      trade_count: performance.tradeCount,
      updated_at: new Date().toISOString(),
    };

    const query = existing
      ? supabase!.from(TABLES.TRADING_DAYS).update(values).eq('id', existing.id).eq('user_id', userId)
      : supabase!.from(TABLES.TRADING_DAYS).insert(values);
    const { data, error } = await query.select().single();
    if (error) return { success: false, error: normalizeSupabaseError(error, 'Failed to save trading day') };
    return { success: true, data: data as TradingDay };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to save trading day') };
  }
}

export async function getTradingDay(userId: string, date: string): Promise<TradeResult<TradingDay | undefined>> {
  const unavailable = assertDatabaseReady(userId);
  if (unavailable) return { success: false, error: unavailable };

  try {
    const { data, error } = await supabase!
      .from(TABLES.TRADING_DAYS)
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error) return { success: false, error: normalizeSupabaseError(error, 'Failed to load trading day') };
    return { success: true, data: (data || undefined) as TradingDay | undefined };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load trading day') };
  }
}
