-- CTA migracia pre content bloky (jsonb data)
-- Prida chybajuce kluce cta_label a cta_url do existujucich zaznamov.
-- Spusti raz v Supabase SQL editore.

update public.content_blocks
set data =
  jsonb_set(
    jsonb_set(data, '{cta_label}', to_jsonb(coalesce(data->>'cta_label', '')), true),
    '{cta_url}',
    to_jsonb(coalesce(data->>'cta_url', '')),
    true
  )
where block_type <> 'grid'
  and (
    not (data ? 'cta_label')
    or not (data ? 'cta_url')
  );

update public.reusable_section_nodes
set data =
  jsonb_set(
    jsonb_set(data, '{cta_label}', to_jsonb(coalesce(data->>'cta_label', '')), true),
    '{cta_url}',
    to_jsonb(coalesce(data->>'cta_url', '')),
    true
  )
where block_type <> 'grid'
  and (
    not (data ? 'cta_label')
    or not (data ? 'cta_url')
  );
