-- Grid + podbloky: parent_id, cell_index; koreň = grid, deti = heading | text_block
-- Spusti v Supabase SQL po aktualizácii kódu.
--
-- Ak si predtým použil supabase-upgrade-content-blocks.sql, tabuľka má ešte starý
-- CHECK iba pre heading/text_block — PostgreSQL ho často volá content_blocks_block_type_check.
-- Kategórie mazať netreba; ide len o túto tabuľku.

alter table content_blocks drop constraint if exists content_blocks_block_type_check;
alter table content_blocks drop constraint if exists content_blocks_block_role;
alter table content_blocks drop constraint if exists content_blocks_parent_scope;
alter table content_blocks drop constraint if exists content_blocks_block_type_builtin;
alter table content_blocks drop constraint if exists content_blocks_parent;

alter table content_blocks
  add column if not exists parent_id uuid references content_blocks(id) on delete cascade;

alter table content_blocks
  add column if not exists cell_index integer not null default 0;

alter table content_blocks add constraint content_blocks_parent_scope check (
  (category_id is not null and subcategory_id is null) or
  (category_id is null and subcategory_id is not null)
);

alter table content_blocks add constraint content_blocks_block_role check (
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
);

create index if not exists idx_content_blocks_parent_id on content_blocks(parent_id);
