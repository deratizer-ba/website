export type SiteSetting = {
  id: string
  key: string
  value: string | null
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  cover_image_url: string | null
  /** Inline SVG z DB (voliteľná ikona). */
  icon_svg: string | null
  display_order: number
  created_at: string
  updated_at: string
  subcategories?: Subcategory[]
}

export type Subcategory = {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  cover_image_url: string | null
  display_order: number
  created_at: string
  updated_at: string
  category?: Category
}

export type PriceListItem = {
  id: string
  category_id: string | null
  subcategory_id: string | null
  name: string
  price: string
  image_url: string | null
  display_order: number
  created_at: string
  updated_at: string
}

/** Rozloženie koreňového gridu (počet buniek = cellCount). */
export type GridLayoutId = "1" | "2" | "3" | "4" | "2x2" | "3x3"

/** Podblok v bunke gridu. */
export type SubBlockType =
  | "heading"
  | "text_block"
  | "icon_heading_text"
  | "image_heading_text_centered"
  | "heading_text_image_right"
  | "media_left_text_right"

/** Koreňová stránka = `grid`, vnútro bunky = `heading` | `text_block`. */
export type ContentBlockType = "grid" | SubBlockType

export type ContentBlock = {
  id: string
  category_id: string | null
  subcategory_id: string | null
  /** Null = koreňový grid. */
  parent_id: string | null
  /** Index bunky v rámci rodičovského gridu (0 … cellCount-1). */
  cell_index: number
  block_type: ContentBlockType
  data: Record<string, unknown>
  display_order: number
  created_at: string
  updated_at: string
}

export type SiteRegionKey = "after_hero" | "before_footer"

export type ReusableSection = {
  id: string
  slug: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export type ReusableSectionNode = {
  id: string
  section_id: string
  parent_id: string | null
  cell_index: number
  block_type: ContentBlockType
  data: Record<string, unknown>
  display_order: number
  created_at: string
  updated_at: string
}

export type SiteRegionItem = {
  id: string
  region_key: SiteRegionKey
  section_id: string
  display_order: number
  created_at: string
  updated_at: string
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  content: string | null
  cover_image_url: string | null
  youtube_url: string | null
  published: boolean
  created_at: string
  updated_at: string
  blog_images?: BlogImage[]
}

export type BlogImage = {
  id: string
  blog_post_id: string
  image_url: string
  display_order: number
  created_at: string
}

export type ManagedImageScopeType =
  | "category"
  | "subcategory"
  | "content_block"
  | "reusable_section_node"
  | "price_list_item"
  | "blog_post"
  | "blog_image"
  | "site_setting"

export type ManagedImage = {
  id: string
  scope_type: ManagedImageScopeType
  scope_id: string
  field_name: string
  image_url: string
  storage_bucket: string | null
  storage_path: string | null
  upload_source: string
  category_id: string | null
  subcategory_id: string | null
  section_id: string | null
  blog_post_id: string | null
  block_type: string | null
  created_at: string
  updated_at: string
}
