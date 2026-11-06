-- Keep trade journal fields compatible with both the original schema and
-- deployments where the optional trade-result migration has not been applied.
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS result TEXT,
  ADD COLUMN IF NOT EXISTS risk_reward TEXT,
  ADD COLUMN IF NOT EXISTS strategy TEXT;

ALTER TABLE public.trades
  DROP CONSTRAINT IF EXISTS trades_result_allowed,
  ADD CONSTRAINT trades_result_allowed
    CHECK (result IS NULL OR result IN ('positive', 'negative')),
  DROP CONSTRAINT IF EXISTS trades_risk_reward_allowed,
  ADD CONSTRAINT trades_risk_reward_allowed
    CHECK (risk_reward IS NULL OR risk_reward ~ '^[0-9]+([.][0-9]+)?:[0-9]+([.][0-9]+)?$');

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can create their own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can update their own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can delete their own trades" ON public.trades;

CREATE POLICY "Users can view their own trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trades"
  ON public.trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
  ON public.trades FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
  ON public.trades FOR DELETE
  USING (auth.uid() = user_id);

-- A trusted trigger creates profiles at signup so the browser does not need
-- an INSERT policy on profile records.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
      NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
      'Trader'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

INSERT INTO public.profiles (id, full_name)
SELECT
  users.id,
  COALESCE(
    NULLIF(users.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(split_part(COALESCE(users.email, ''), '@', 1), ''),
    'Trader'
  )
FROM auth.users AS users
ON CONFLICT (id) DO NOTHING;
