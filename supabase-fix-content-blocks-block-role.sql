-- Repair for content_blocks_block_role constraint.
-- Run in Supabase SQL editor when inserting sub-blocks fails with:
-- "new row for relation content_blocks violates check constraint content_blocks_block_role"

alter table content_blocks drop constraint if exists content_blocks_block_role;
alter table content_blocks drop constraint if exists content_blocks_parent_scope;

alter table content_blocks
  add constraint content_blocks_parent_scope check (
    (category_id is not null and subcategory_id is null) or
    (category_id is null and subcategory_id is not null)
  );

alter table content_blocks
  add constraint content_blocks_block_role check (
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
