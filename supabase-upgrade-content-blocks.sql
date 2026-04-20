-- Po tejto migrácii spusti ešte supabase-content-blocks-grid-nesting.sql
-- (grid = koreň, podbloky = heading | text_block s parent_id).
--
-- ============================================
-- Upgrade: content_blocks (nová schéma) + migrácia z text_blocks
-- Spusti celý súbor raz v Supabase → SQL Editor.
-- Je idempotentné kde sa dá (IF NOT EXISTS, DROP IF EXISTS).
-- ============================================

create extension if not exists "uuid-ossp";

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Nová tabuľka (ak už existuje, preskočí sa)
create table if not exists content_blocks (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references categories(id) on delete cascade,
  subcategory_id uuid references subcategories(id) on delete cascade,
  block_type text not null check (
    block_type in (
      'heading',
      'text_block',
      'icon_heading_text',
      'image_heading_text_centered',
      'heading_text_image_right',
      'media_left_text_right'
    )
  ),
  data jsonb not null default '{}',
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint content_blocks_parent check (
    (category_id is not null and subcategory_id is null) or
    (category_id is null and subcategory_id is not null)
  )
);

drop trigger if exists content_blocks_updated_at on content_blocks;
create trigger content_blocks_updated_at
  before update on content_blocks
  for each row execute function update_updated_at();

-- RLS pre content_blocks
alter table content_blocks enable row level security;

drop policy if exists "Public read content_blocks" on content_blocks;
drop policy if exists "Admin manage content_blocks" on content_blocks;

create policy "Public read content_blocks"
  on content_blocks for select using (true);

create policy "Admin manage content_blocks"
  on content_blocks for all to authenticated using (true) with check (true);

-- Indexy
create index if not exists idx_content_blocks_category_id on content_blocks(category_id);
create index if not exists idx_content_blocks_subcategory_id on content_blocks(subcategory_id);
create index if not exists idx_content_blocks_display_order on content_blocks(display_order);

-- Migrácia: len ak ešte existuje stará tabuľka text_blocks
do $$
begin
  if to_regclass('public.text_blocks') is not null then
    insert into public.content_blocks (
      id, category_id, subcategory_id, block_type, data, display_order, created_at, updated_at
    )
    select
      id,
      category_id,
      subcategory_id,
      'text_block',
      jsonb_build_object(
        'heading', heading,
        'content', coalesce(content, '')
      ),
      display_order,
      created_at,
      updated_at
    from public.text_blocks
    on conflict (id) do nothing;

    drop policy if exists "Public read text_blocks" on public.text_blocks;
    drop policy if exists "Admin manage text_blocks" on public.text_blocks;
    drop trigger if exists text_blocks_updated_at on public.text_blocks;
    drop table if exists public.text_blocks;

    drop index if exists public.idx_text_blocks_category_id;
    drop index if exists public.idx_text_blocks_subcategory_id;
  end if;
end $$;
