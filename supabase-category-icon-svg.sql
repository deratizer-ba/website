-- Inline SVG ikona pre kategóriu (admin vkladá zdrojový kód SVG).
alter table public.categories
  add column if not exists icon_svg text;

comment on column public.categories.icon_svg is 'Voliteľný inline SVG kód (ikona kategórie)';
