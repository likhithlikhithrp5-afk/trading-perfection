ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS result TEXT
    CHECK (result IN ('positive', 'negative')),
  ADD COLUMN IF NOT EXISTS risk_reward TEXT
    CHECK (risk_reward IS NULL OR risk_reward ~ '^[0-9]+([.][0-9]+)?:[0-9]+([.][0-9]+)?$');
