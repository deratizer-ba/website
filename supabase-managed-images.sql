create table if not exists public.managed_images (
  id uuid primary key default gen_random_uuid(),
  scope_type text not null,
  scope_id text not null,
  field_name text not null,
  image_url text not null,
  storage_bucket text,
  storage_path text,
  upload_source text not null,
  category_id uuid,
  subcategory_id uuid,
  section_id uuid,
  blog_post_id uuid,
  block_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint managed_images_scope_type_check check (
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
  ),
  constraint managed_images_scope_unique unique (scope_type, scope_id, field_name)
);

create index if not exists managed_images_scope_idx
  on public.managed_images (scope_type, scope_id);

create index if not exists managed_images_category_idx
  on public.managed_images (category_id);

create index if not exists managed_images_subcategory_idx
  on public.managed_images (subcategory_id);

create index if not exists managed_images_section_idx
  on public.managed_images (section_id);

create index if not exists managed_images_blog_post_idx
  on public.managed_images (blog_post_id);

create index if not exists managed_images_storage_idx
  on public.managed_images (storage_bucket, storage_path);
