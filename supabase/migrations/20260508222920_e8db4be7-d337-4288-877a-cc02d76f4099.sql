-- 1) Drop daily quota columns
ALTER TABLE public.ai_credit_wallets DROP COLUMN IF EXISTS daily_quota_used_today;
ALTER TABLE public.ai_credit_wallets DROP COLUMN IF EXISTS daily_quota_date;

-- 2) Drop daily replenishment cron job if exists (Start plan)
DO $$
DECLARE jid bigint;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    FOR jid IN
      SELECT jobid FROM cron.job
      WHERE jobname IN (
        'replenish-daily-start-credits',
        'starter-daily-quota-reset',
        'reset-daily-start-quota'
      )
    LOOP
      PERFORM cron.unschedule(jid);
    END LOOP;
  END IF;
END $$;

-- 3) Drop RPC that backed daily replenishment, if any
DROP FUNCTION IF EXISTS public.replenish_daily_start_credits();
DROP FUNCTION IF EXISTS public.reset_daily_start_quota();

-- 4) Reset monthly free quota for existing user wallets so everyone can try the updated free pack
UPDATE public.ai_credit_wallets
SET free_quota_used_this_month = 0,
    free_quota_period_start = (date_trunc('month', now()))::date,
    updated_at = now()
WHERE owner_type = 'user';