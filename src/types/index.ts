export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface CapitalSettings {
  id: string;
  user_id: string;
  base_capital: number;
  current_capital: number;
  created_at?: string;
  updated_at?: string;
}

export type OrderType = 'BUY' | 'SELL';
export type InstrumentType = 'STOCK' | 'OPTION' | 'FUTURE' | 'INDEX';
export type ExchangeType = 'NSE' | 'BSE' | 'MCX' | 'NCDEX';

export interface Trade {
  id: string;
  user_id: string;
  trade_date: string;
  trade_time?: string;
  symbol: string;
  instrument?: InstrumentType;
  exchange?: ExchangeType;
  order_type: OrderType;
  quantity: number;
  entry_price: number;
  exit_price: number;
  gross_pnl: number;
  brokerage: number;
  government_charges: number;
  other_charges: number;
  net_pnl: number;
  order_type_detail?: string;
  strategy_id?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TradingDay {
  id: string;
  user_id: string;
  date: string;
  total_gross_pnl: number;
  total_brokerage: number;
  total_government_charges: number;
  total_other_charges: number;
  total_net_pnl: number;
  trade_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  date: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyChecklist {
  id: string;
  user_id: string;
  date: string;
  trending_or_ranging?: string;
  continuation_or_reversal?: string;
  high_or_low_volatility?: string;
  clean_or_choppy?: string;
  liquidity_location?: string;
  invalidation?: string;
  risk_reward?: string;
  following_strategy?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PsychologyEntry {
  id: string;
  user_id: string;
  date: string;
  confidence_before?: number;
  fear_before?: number;
  greed_before?: number;
  focus_before?: number;
  discipline_before?: number;
  emotional_state_after?: string;
  biggest_mistake?: string;
  lesson_learned?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TradeImage {
  id: string;
  user_id: string;
  trading_day_id: string;
  storage_path: string;
  uploaded_at?: string;
}

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  win_rate?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  chart_image_url?: string;
  created_at?: string;
}

export interface AITradeAnalysis {
  id: string;
  user_id: string;
  date: string;
  trade_setup_details: {
    trending_or_ranging?: string;
    continuation_or_reversal?: string;
    high_or_low_volatility?: string;
    clean_or_choppy?: string;
    liquidity_location?: string;
    invalidation?: string;
    risk_reward?: string;
    following_strategy?: boolean;
  };
  score: number;
  reasoning: string;
  warnings: string[];
  similar_trades_count: number;
  similar_trades_win_rate: number;
  rules_passed: number;
  rules_failed: number;
  created_at?: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  symbol: string;
  added_at?: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  average_price: number;
  current_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_id: string;
  symbol: string;
  order_type: OrderType;
  quantity: number;
  price: number;
  status: 'open' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface Dividend {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  dividend_per_share: number;
  total_dividend: number;
  date: string;
  status: 'received' | 'pending';
  created_at?: string;
}
