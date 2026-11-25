-- Provide safe defaults for the trusted payment RPC and platform settings UI.
INSERT INTO public.platform_settings (key, value)
VALUES
  ('default_commission_rate', to_jsonb(0.10::numeric)),
  ('max_active_contests_per_organizer', to_jsonb(4)),
  ('maintenance_mode', to_jsonb(false))
ON CONFLICT (key) DO NOTHING;
