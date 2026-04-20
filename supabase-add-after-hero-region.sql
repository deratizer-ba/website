alter table site_region_items
drop constraint if exists site_region_items_region_key_check;

alter table site_region_items
add constraint site_region_items_region_key_check
check (region_key in ('after_hero', 'before_footer'));
