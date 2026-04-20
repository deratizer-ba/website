create table if not exists public.price_list_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete cascade,
  subcategory_id uuid references public.subcategories(id) on delete cascade,
  name text not null,
  price text not null,
  image_url text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint price_list_items_scope_check check (
    (category_id is not null and subcategory_id is null) or
    (category_id is null and subcategory_id is not null)
  )
);

create trigger price_list_items_updated_at
before update on public.price_list_items
for each row execute function update_updated_at();

alter table public.price_list_items enable row level security;

drop policy if exists "Public read price_list_items" on public.price_list_items;
create policy "Public read price_list_items"
  on public.price_list_items for select using (true);

drop policy if exists "Admin manage price_list_items" on public.price_list_items;
create policy "Admin manage price_list_items"
  on public.price_list_items
  for all
  to authenticated
  using (true)
  with check (true);

create index if not exists idx_price_list_items_category_id
  on public.price_list_items(category_id);

create index if not exists idx_price_list_items_subcategory_id
  on public.price_list_items(subcategory_id);

create index if not exists idx_price_list_items_display_order
  on public.price_list_items(display_order);

alter table public.managed_images
  drop constraint if exists managed_images_scope_type_check;

alter table public.managed_images
  add constraint managed_images_scope_type_check
  check (
    scope_type in (
      'category',
      'subcategory',
      'content_block',
      'reusable_section_node',
      'price_list_item',
      'blog_post',
      'blog_image',
      'site_setting'
    )
  );
