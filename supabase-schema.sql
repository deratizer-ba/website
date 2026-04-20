-- ============================================
-- Deratizeri - Supabase SQL Schema
-- Copy this entire file into Supabase SQL Editor and run it
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================
-- TABLES
-- ============================================

-- Site Settings (key-value for homepage etc.)
create table site_settings (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  value text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger site_settings_updated_at before update on site_settings
  for each row execute function update_updated_at();

-- Categories
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  cover_image_url text,
  icon_svg text,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger categories_updated_at before update on categories
  for each row execute function update_updated_at();

-- Subcategories
create table subcategories (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references categories(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  description text,
  cover_image_url text,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger subcategories_updated_at before update on subcategories
  for each row execute function update_updated_at();

-- Content blocks: koreň = grid; vnútro bunky = heading | text_block
create table content_blocks (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references categories(id) on delete cascade,
  subcategory_id uuid references subcategories(id) on delete cascade,
  parent_id uuid references content_blocks(id) on delete cascade,
  cell_index integer not null default 0,
  block_type text not null,
  data jsonb not null default '{}',
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint content_blocks_parent_scope check (
    (category_id is not null and subcategory_id is null) or
    (category_id is null and subcategory_id is not null)
  ),
  constraint content_blocks_block_role check (
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

create trigger content_blocks_updated_at before update on content_blocks
  for each row execute function update_updated_at();

-- Blog Posts
create table blog_posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  content text,
  cover_image_url text,
  youtube_url text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger blog_posts_updated_at before update on blog_posts
  for each row execute function update_updated_at();

-- Blog Images (additional images for blog posts)
create table blog_images (
  id uuid default uuid_generate_v4() primary key,
  blog_post_id uuid references blog_posts(id) on delete cascade not null,
  image_url text not null,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- Price list items
create table price_list_items (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references categories(id) on delete cascade,
  subcategory_id uuid references subcategories(id) on delete cascade,
  name text not null,
  price text not null,
  image_url text,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint price_list_items_scope_check check (
    (category_id is not null and subcategory_id is null) or
    (category_id is null and subcategory_id is not null)
  )
);

create trigger price_list_items_updated_at before update on price_list_items
  for each row execute function update_updated_at();

-- ============================================
-- DEFAULT DATA
-- ============================================

insert into site_settings (key, value) values
  ('homepage_h1', 'Profesionálna deratizácia'),
  ('homepage_description', 'Spoľahlivé služby deratizácie, dezinfekcie a dezinsekcie'),
  ('homepage_cover_image', ''),
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
  ('company_facebook_url', '');

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table site_settings enable row level security;
alter table categories enable row level security;
alter table subcategories enable row level security;
alter table content_blocks enable row level security;
alter table blog_posts enable row level security;
alter table blog_images enable row level security;
alter table price_list_items enable row level security;

-- Public read access
create policy "Public read site_settings" on site_settings for select using (true);
create policy "Public read categories" on categories for select using (true);
create policy "Public read subcategories" on subcategories for select using (true);
create policy "Public read content_blocks" on content_blocks for select using (true);
create policy "Public read published blog_posts" on blog_posts for select using (published = true);
create policy "Public read blog_images" on blog_images for select using (true);
create policy "Public read price_list_items" on price_list_items for select using (true);

-- Admin full access (authenticated users)
create policy "Admin manage site_settings" on site_settings for all to authenticated using (true) with check (true);
create policy "Admin manage categories" on categories for all to authenticated using (true) with check (true);
create policy "Admin manage subcategories" on subcategories for all to authenticated using (true) with check (true);
create policy "Admin manage content_blocks" on content_blocks for all to authenticated using (true) with check (true);
create policy "Admin manage blog_posts" on blog_posts for all to authenticated using (true) with check (true);
create policy "Admin manage blog_images" on blog_images for all to authenticated using (true) with check (true);
create policy "Admin manage price_list_items" on price_list_items for all to authenticated using (true) with check (true);

-- ============================================
-- INDEXES
-- ============================================

create index idx_categories_display_order on categories(display_order);
create index idx_subcategories_category_id on subcategories(category_id);
create index idx_subcategories_display_order on subcategories(display_order);
create index idx_content_blocks_category_id on content_blocks(category_id);
create index idx_content_blocks_subcategory_id on content_blocks(subcategory_id);
create index idx_content_blocks_parent_id on content_blocks(parent_id);
create index idx_content_blocks_display_order on content_blocks(display_order);
create index idx_blog_posts_published on blog_posts(published);
create index idx_blog_posts_slug on blog_posts(slug);
create index idx_blog_images_blog_post_id on blog_images(blog_post_id);
create index idx_price_list_items_category_id on price_list_items(category_id);
create index idx_price_list_items_subcategory_id on price_list_items(subcategory_id);
create index idx_price_list_items_display_order on price_list_items(display_order);

-- ============================================
-- MIGRÁCIA: text_blocks → content_blocks (existujúca DB so starou schémou)
-- Spusti súbor supabase-migrate-text-blocks-to-content-blocks.sql
-- ============================================

-- ============================================
-- STORAGE
-- After running this SQL, go to Supabase Dashboard -> Storage:
-- 1. Create a new bucket called "images" and set it to PUBLIC
-- 2. Add a policy for SELECT (public read): allow all
-- 3. Add a policy for INSERT/UPDATE/DELETE: allow authenticated users only
-- ============================================
