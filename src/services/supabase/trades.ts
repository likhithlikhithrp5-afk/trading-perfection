import { supabase, TABLES, isSupabaseConfigured } from '@/lib/supabase';
import { Trade, TradingDay } from '@/types';
import { calculateDailyPerformance, calculateNetPnL, calculateGrossPnL } from '@/services/calculations';

/**
 * Create a new trade
 */
export async function createTrade(userId: string, trade: Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'gross_pnl' | 'net_pnl'>): Promise<{ success: boolean; data?: Trade; error?: string }> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured. Using demo mode for trade creation.');
    return { success: true, data: { ...trade, id: crypto.randomUUID(), user_id: userId, gross_pnl: calculateGrossPnL({ ...trade, id: crypto.randomUUID(), user_id: userId, gross_pnl: 0, net_pnl: 0 } as Trade), net_pnl: calculateNetPnL({ ...trade, id: crypto.randomUUID(), user_id: userId, gross_pnl: 0, net_pnl: 0 } as Trade) } as Trade };
  }

  try {
    console.log('📝 Creating trade for user:', userId);
    const grossPnL = calculateGrossPnL(trade as Trade);
    const netPnL = calculateNetPnL({ ...trade, gross_pnl: grossPnL } as Trade);

    const insertPayload = {
      ...trade,
      user_id: userId,
      gross_pnl: grossPnL,
      net_pnl: netPnL,
    };

    console.log('📤 Supabase insert payload:', insertPayload);

    const { data, error } = await supabase!
      .from(TABLES.TRADES)
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error.message, error.code, error.details);
      return { success: false, error: `Database error: ${error.message}` };
    }

    console.log('✅ Trade created successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Unexpected error during trade creation:', err);
    return { success: false, error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}` };
  }
}

/**
 * Get all trades for a user
 */
export async function getTrades(userId: string): Promise<{ success: boolean; data?: Trade[]; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true, data: [] };
  }

  try {
    const { data, error } = await supabase!
      .from(TABLES.TRADES)
      .select('*')
      .eq('user_id', userId)
      .order('trade_date', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch {
    return { success: false, error: 'Failed to get trades' };
  }
}

/**
 * Get trades for a specific date
 */
export async function getTradesForDate(userId: string, date: string): Promise<{ success: boolean; data?: Trade[]; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true, data: [] };
  }

  try {
    const { data, error } = await supabase!
      .from(TABLES.TRADES)
      .select('*')
      .eq('user_id', userId)
      .eq('trade_date', date)
      .order('trade_time', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch {
    return { success: false, error: 'Failed to get trades for date' };
  }
}

/**
 * Update a trade
 */
export async function updateTrade(userId: string, tradeId: string, updates: Partial<Trade>): Promise<{ success: boolean; data?: Trade; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true, data: { ...(updates as Trade), id: tradeId, user_id: userId } };
  }

  try {
    let grossPnL = updates.gross_pnl;
    let netPnL = updates.net_pnl;

    if (updates.entry_price !== undefined || updates.exit_price !== undefined || updates.order_type !== undefined || updates.quantity !== undefined) {
      const { data: existingTrade } = await supabase!
        .from(TABLES.TRADES)
        .select('*')
        .eq('id', tradeId)
        .eq('user_id', userId)
        .single();

      if (existingTrade) {
        const merged = { ...existingTrade, ...updates } as Trade;
        grossPnL = calculateGrossPnL(merged);
        netPnL = calculateNetPnL(merged);
      }
    }

    const { data, error } = await supabase!
      .from(TABLES.TRADES)
      .update({
        ...updates,
        gross_pnl: grossPnL,
        net_pnl: netPnL,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tradeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch {
    return { success: false, error: 'Failed to update trade' };
  }
}

/**
 * Delete a trade
 */
export async function deleteTrade(userId: string, tradeId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase!
      .from(TABLES.TRADES)
      .delete()
      .eq('id', tradeId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete trade' };
  }
}

/**
 * Update or create trading day summary
 */
export async function updateTradingDay(userId: string, date: string, trades: Trade[]): Promise<{ success: boolean; data?: TradingDay; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true, data: { id: `demo-${date}`, user_id: userId, date, total_gross_pnl: trades.reduce((sum, t) => sum + Number(t.gross_pnl || 0), 0), total_brokerage: trades.reduce((sum, t) => sum + Number(t.brokerage || 0), 0), total_government_charges: trades.reduce((sum, t) => sum + Number(t.government_charges || 0), 0), total_other_charges: trades.reduce((sum, t) => sum + Number(t.other_charges || 0), 0), total_net_pnl: trades.reduce((sum, t) => sum + Number(t.net_pnl || 0), 0), trade_count: trades.length } };
  }

  try {
    const performance = calculateDailyPerformance(trades);

    const { data: existingDay } = await supabase!
      .from(TABLES.TRADING_DAYS)
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (existingDay) {
      const { data, error } = await supabase!
        .from(TABLES.TRADING_DAYS)
        .update({
          ...performance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDay.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } else {
      const { data, error } = await supabase!
        .from(TABLES.TRADING_DAYS)
        .insert([
          {
            user_id: userId,
            date,
            ...performance,
          },
        ])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    }
  } catch {
    return { success: false, error: 'Failed to update trading day' };
  }
}

/**
 * Get trading day data
 */
export async function getTradingDay(userId: string, date: string): Promise<{ success: boolean; data?: TradingDay; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true, data: undefined };
  }

  try {
    const { data, error } = await supabase!
      .from(TABLES.TRADING_DAYS)
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || undefined };
  } catch {
    return { success: false, error: 'Failed to get trading day' };
  }
}
