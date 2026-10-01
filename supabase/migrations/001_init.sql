-- Trade Journal AI Database Schema
-- This file contains all necessary tables and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Capital Settings
CREATE TABLE IF NOT EXISTS public.capital_settings (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_capital NUMERIC NOT NULL,
  current_capital NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Strategies
CREATE TABLE IF NOT EXISTS public.strategies (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  win_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trades
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_date DATE NOT NULL,
  trade_time TIME,
  symbol TEXT NOT NULL,
  instrument TEXT,
  exchange TEXT,
  order_type TEXT NOT NULL CHECK (order_type IN ('BUY', 'SELL')),
  quantity NUMERIC NOT NULL,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC NOT NULL,
  gross_pnl NUMERIC NOT NULL,
  brokerage NUMERIC DEFAULT 0,
  government_charges NUMERIC DEFAULT 0,
  other_charges NUMERIC DEFAULT 0,
  net_pnl NUMERIC NOT NULL,
  order_type_detail TEXT,
  strategy_id UUID REFERENCES public.strategies(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trading Days (Aggregated)
CREATE TABLE IF NOT EXISTS public.trading_days (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_gross_pnl NUMERIC NOT NULL,
  total_brokerage NUMERIC NOT NULL,
  total_government_charges NUMERIC NOT NULL,
  total_other_charges NUMERIC NOT NULL,
  total_net_pnl NUMERIC NOT NULL,
  trade_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Diary Entries
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Daily Checklists
CREATE TABLE IF NOT EXISTS public.daily_checklists (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  trending_or_ranging TEXT,
  continuation_or_reversal TEXT,
  high_or_low_volatility TEXT,
  clean_or_choppy TEXT,
  liquidity_location TEXT,
  invalidation TEXT,
  risk_reward TEXT,
  following_strategy BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Psychology Entries
CREATE TABLE IF NOT EXISTS public.psychology_entries (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  confidence_before INTEGER,
  fear_before INTEGER,
  greed_before INTEGER,
  focus_before INTEGER,
  discipline_before INTEGER,
  emotional_state_after TEXT,
  biggest_mistake TEXT,
  lesson_learned TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Trade Images
CREATE TABLE IF NOT EXISTS public.trade_images (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trading_day_id UUID REFERENCES public.trading_days(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI Conversations
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI Messages
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  chart_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI Trade Analyses
CREATE TABLE IF NOT EXISTS public.ai_trade_analyses (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  trade_setup_details JSONB,
  score NUMERIC NOT NULL,
  reasoning TEXT,
  warnings TEXT[],
  similar_trades_count INTEGER,
  similar_trades_win_rate NUMERIC,
  rules_passed INTEGER,
  rules_failed INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, symbol)
);

-- Portfolio
CREATE TABLE IF NOT EXISTS public.portfolio (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  average_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, symbol)
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('BUY', 'SELL')),
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dividends
CREATE TABLE IF NOT EXISTS public.dividends (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  dividend_per_share NUMERIC NOT NULL,
  total_dividend NUMERIC NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('received', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_trades_user_id_date ON public.trades(user_id, trade_date);
CREATE INDEX idx_trades_user_id_symbol ON public.trades(user_id, symbol);
CREATE INDEX idx_trades_user_id_strategy ON public.trades(user_id, strategy_id);
CREATE INDEX idx_trading_days_user_id_date ON public.trading_days(user_id, date);
CREATE INDEX idx_diary_entries_user_id_date ON public.diary_entries(user_id, date);
CREATE INDEX idx_checklists_user_id_date ON public.daily_checklists(user_id, date);
CREATE INDEX idx_psychology_user_id_date ON public.psychology_entries(user_id, date);
CREATE INDEX idx_trade_images_user_id_date ON public.trade_images(user_id, date);
CREATE INDEX idx_ai_messages_conversation ON public.ai_messages(conversation_id);
CREATE INDEX idx_ai_analyses_user_id_date ON public.ai_trade_analyses(user_id, date);

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychology_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_trade_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividends ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Capital Settings RLS
CREATE POLICY "Users can view their own capital settings"
  ON public.capital_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own capital settings"
  ON public.capital_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own capital settings"
  ON public.capital_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trades RLS
CREATE POLICY "Users can view their own trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trades"
  ON public.trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
  ON public.trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
  ON public.trades FOR DELETE
  USING (auth.uid() = user_id);

-- Trading Days RLS
CREATE POLICY "Users can view their own trading days"
  ON public.trading_days FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trading days"
  ON public.trading_days FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trading days"
  ON public.trading_days FOR UPDATE
  USING (auth.uid() = user_id);

-- Diary Entries RLS
CREATE POLICY "Users can view their own diary entries"
  ON public.diary_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diary entries"
  ON public.diary_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diary entries"
  ON public.diary_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diary entries"
  ON public.diary_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Daily Checklists RLS
CREATE POLICY "Users can view their own checklists"
  ON public.daily_checklists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checklists"
  ON public.daily_checklists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklists"
  ON public.daily_checklists FOR UPDATE
  USING (auth.uid() = user_id);

-- Psychology Entries RLS
CREATE POLICY "Users can view their own psychology entries"
  ON public.psychology_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own psychology entries"
  ON public.psychology_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own psychology entries"
  ON public.psychology_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Trade Images RLS
CREATE POLICY "Users can view their own trade images"
  ON public.trade_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own trade images"
  ON public.trade_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trade images"
  ON public.trade_images FOR DELETE
  USING (auth.uid() = user_id);

-- AI Conversations RLS
CREATE POLICY "Users can view their own conversations"
  ON public.ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- AI Messages RLS
CREATE POLICY "Users can view their own messages"
  ON public.ai_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
  ON public.ai_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- AI Trade Analyses RLS
CREATE POLICY "Users can view their own analyses"
  ON public.ai_trade_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses"
  ON public.ai_trade_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Watchlist RLS
CREATE POLICY "Users can view their own watchlist"
  ON public.watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watchlist"
  ON public.watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlist"
  ON public.watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- Portfolio RLS
CREATE POLICY "Users can view their own portfolio"
  ON public.portfolio FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio"
  ON public.portfolio FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio"
  ON public.portfolio FOR UPDATE
  USING (auth.uid() = user_id);

-- Orders RLS
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- Dividends RLS
CREATE POLICY "Users can view their own dividends"
  ON public.dividends FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dividends"
  ON public.dividends FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Strategies RLS
CREATE POLICY "Users can view their own strategies"
  ON public.strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own strategies"
  ON public.strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies"
  ON public.strategies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategies"
  ON public.strategies FOR DELETE
  USING (auth.uid() = user_id);
