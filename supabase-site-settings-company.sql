-- Firemné / fakturačné údaje a kontakt (site_settings)
-- Spustite v Supabase SQL editore na existujúcej databáze.

insert into site_settings (key, value) values
  ('company_display_name', ''),
  ('company_tagline', ''),
  ('company_street', ''),
  ('company_city', ''),
  ('company_zip', ''),
  ('company_country', ''),
  ('company_ico', ''),
  ('company_dic', ''),
  ('company_ic_dph', ''),
  ('company_iban', ''),
  ('company_phone', ''),
  ('company_email', ''),
  ('company_instagram_url', ''),
  ('company_facebook_url', '')
on conflict (key) do nothing;
