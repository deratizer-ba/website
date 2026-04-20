-- ============================================
-- Reusable sections (single source of truth)
-- ============================================

create extension if not exists "uuid-ossp";

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists reusable_sections (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reusable_section_nodes (
  id uuid primary key default uuid_generate_v4(),
  section_id uuid not null references reusable_sections(id) on delete cascade,
  parent_id uuid references reusable_section_nodes(id) on delete cascade,
  cell_index integer not null default 0,
  block_type text not null,
  data jsonb not null default '{}',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reusable_section_nodes_role_check check (
    (parent_id is null and block_type = 'grid') or
    (
      parent_id is not null and block_type in (
        'heading',
        'text_block',
        'icon_heading_text',
        'image_heading_text_centered',
        'heading_text_image_right',
        'media_left_text_right'
      )
    )
  )
);

create table if not exists site_region_items (
  id uuid primary key default uuid_generate_v4(),
  region_key text not null,
  section_id uuid not null references reusable_sections(id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_region_items_region_key_check check (
    region_key in ('after_hero', 'before_footer')
  )
);

create unique index if not exists uniq_site_region_items_region_section
  on site_region_items(region_key, section_id);

create index if not exists idx_reusable_section_nodes_section
  on reusable_section_nodes(section_id, display_order, cell_index);
create index if not exists idx_reusable_section_nodes_parent
  on reusable_section_nodes(parent_id);
create index if not exists idx_site_region_items_region_order
  on site_region_items(region_key, display_order);

drop trigger if exists reusable_sections_updated_at on reusable_sections;
create trigger reusable_sections_updated_at
before update on reusable_sections
for each row execute function update_updated_at();

drop trigger if exists reusable_section_nodes_updated_at on reusable_section_nodes;
create trigger reusable_section_nodes_updated_at
before update on reusable_section_nodes
for each row execute function update_updated_at();

drop trigger if exists site_region_items_updated_at on site_region_items;
create trigger site_region_items_updated_at
before update on site_region_items
for each row execute function update_updated_at();

alter table reusable_sections enable row level security;
alter table reusable_section_nodes enable row level security;
alter table site_region_items enable row level security;

drop policy if exists "Public read reusable_sections" on reusable_sections;
drop policy if exists "Public read reusable_section_nodes" on reusable_section_nodes;
drop policy if exists "Public read site_region_items" on site_region_items;
drop policy if exists "Admin manage reusable_sections" on reusable_sections;
drop policy if exists "Admin manage reusable_section_nodes" on reusable_section_nodes;
drop policy if exists "Admin manage site_region_items" on site_region_items;

create policy "Public read reusable_sections"
  on reusable_sections for select using (true);
create policy "Public read reusable_section_nodes"
  on reusable_section_nodes for select using (true);
create policy "Public read site_region_items"
  on site_region_items for select using (true);

create policy "Admin manage reusable_sections"
  on reusable_sections for all to authenticated using (true) with check (true);
create policy "Admin manage reusable_section_nodes"
  on reusable_section_nodes for all to authenticated using (true) with check (true);
create policy "Admin manage site_region_items"
  on site_region_items for all to authenticated using (true) with check (true);
