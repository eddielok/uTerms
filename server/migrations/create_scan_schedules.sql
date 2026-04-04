-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.scan_schedules (
  user_id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  url             text NOT NULL,
  interval_months integer NOT NULL CHECK (interval_months IN (1, 3, 6, 12)),
  enabled         boolean NOT NULL DEFAULT true,
  next_scan_at    timestamptz NOT NULL,
  last_scan_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- RLS: enabled. Authenticated users can only read their own row.
-- The backend uses the service_role key which bypasses RLS entirely.
ALTER TABLE public.scan_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own schedule"
  ON public.scan_schedules
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- If the table already exists and RLS was disabled, re-enable it:
-- ALTER TABLE public.scan_schedules ENABLE ROW LEVEL SECURITY;
