import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as { env?: { VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string } }).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as { env?: { VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string } }).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('⚠️ VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set in environment. Demo mode is active.');
  console.warn('   URL configured:', !!supabaseUrl);
  console.warn('   ANON_KEY configured:', !!supabaseAnonKey);
} else {
  console.log('✅ Supabase configured successfully. Using production mode.');
}

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const TABLES = {
  USERS: 'users',
  PROFILES: 'profiles',
  CAPITAL_SETTINGS: 'capital_settings',
  TRADES: 'trades',
  TRADING_DAYS: 'trading_days',
  DIARY_ENTRIES: 'diary_entries',
  DAILY_CHECKLISTS: 'daily_checklists',
  TRADE_IMAGES: 'trade_images',
  STRATEGIES: 'strategies',
  PSYCHOLOGY_ENTRIES: 'psychology_entries',
  AI_CONVERSATIONS: 'ai_conversations',
  AI_MESSAGES: 'ai_messages',
  AI_TRADE_ANALYSES: 'ai_trade_analyses',
  WATCHLIST: 'watchlist',
  PORTFOLIO: 'portfolio',
  HOLDINGS: 'holdings',
  ORDERS: 'orders',
  DIVIDENDS: 'dividends',
};

export const STORAGE_BUCKETS = {
  TRADE_IMAGES: 'trade-images',
};
