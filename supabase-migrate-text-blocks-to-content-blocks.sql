-- Run once in Supabase SQL Editor if you already have `text_blocks` from the old schema.
-- Creates `content_blocks`, copies rows as `text_block`, then drops `text_blocks`.

create table if not exists content_blocks (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references categories(id) on delete cascade,
  subcategory_id uuid references subcategories(id) on delete cascade,
  block_type text not null check (block_type in ('heading', 'text_block')),
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
create trigger content_blocks_updated_at before update on content_blocks
  for each row execute function update_updated_at();

insert into content_blocks (id, category_id, subcategory_id, block_type, data, display_order, created_at, updated_at)
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
from text_blocks
on conflict (id) do nothing;

alter table content_blocks enable row level security;

drop policy if exists "Public read content_blocks" on content_blocks;
drop policy if exists "Admin manage content_blocks" on content_blocks;
create policy "Public read content_blocks" on content_blocks for select using (true);
create policy "Admin manage content_blocks" on content_blocks for all to authenticated using (true) with check (true);

create index if not exists idx_content_blocks_category_id on content_blocks(category_id);
create index if not exists idx_content_blocks_subcategory_id on content_blocks(subcategory_id);
create index if not exists idx_content_blocks_display_order on content_blocks(display_order);

drop policy if exists "Public read text_blocks" on text_blocks;
drop policy if exists "Admin manage text_blocks" on text_blocks;
drop trigger if exists text_blocks_updated_at on text_blocks;
drop table if exists text_blocks;

drop index if exists idx_text_blocks_category_id;
drop index if exists idx_text_blocks_subcategory_id;
