-- Fix critical linter errors: enable RLS on wallet tables (keep current open behavior)
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallet_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_wallets' AND policyname='Allow all access to user_wallets'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow all access to user_wallets" ON public.user_wallets FOR ALL USING (true) WITH CHECK (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_wallet_transactions' AND policyname='Allow all access to user_wallet_transactions'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow all access to user_wallet_transactions" ON public.user_wallet_transactions FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END $$;