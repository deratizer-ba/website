import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

function normalizeUrl(value) {
  const text = String(value ?? "").trim()
  return text || null
}

function getStorageLocationFromUrl(imageUrl) {
  const normalized = normalizeUrl(imageUrl)
  if (!normalized) return null

  try {
    const url = new URL(normalized)
    const marker = "/storage/v1/object/public/"
    const markerIndex = url.pathname.indexOf(marker)
    if (markerIndex < 0) return null
    const rest = url.pathname.slice(markerIndex + marker.length)
    const [bucket, ...parts] = rest.split("/")
    if (!bucket || parts.length === 0) return null
    return {
      storage_bucket: decodeURIComponent(bucket),
      storage_path: decodeURIComponent(parts.join("/")),
    }
  } catch {
    return null
  }
}

async function upsertManagedImage(row) {
  const normalized = normalizeUrl(row.image_url)
  if (!normalized) return

  const storage = getStorageLocationFromUrl(normalized)
  const payload = {
    ...row,
    image_url: normalized,
    storage_bucket: storage?.storage_bucket ?? null,
    storage_path: storage?.storage_path ?? null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("managed_images").upsert(payload, {
    onConflict: "scope_type,scope_id,field_name",
  })
  if (error) throw error
}

async function main() {
  const [
    categoriesRes,
    subcategoriesRes,
    contentBlocksRes,
    reusableNodesRes,
    blogPostsRes,
    blogImagesRes,
    siteSettingsRes,
  ] = await Promise.all([
    supabase.from("categories").select("id, cover_image_url"),
    supabase.from("subcategories").select("id, category_id, cover_image_url"),
    supabase.from("content_blocks").select("id, block_type, category_id, subcategory_id, data"),
    supabase.from("reusable_section_nodes").select("id, section_id, block_type, data"),
    supabase.from("blog_posts").select("id, cover_image_url"),
    supabase.from("blog_images").select("id, blog_post_id, image_url"),
    supabase.from("site_settings").select("key, value").eq("key", "homepage_cover_image"),
  ])

  for (const res of [
    categoriesRes,
    subcategoriesRes,
    contentBlocksRes,
    reusableNodesRes,
    blogPostsRes,
    blogImagesRes,
    siteSettingsRes,
  ]) {
    if (res.error) throw res.error
  }

  for (const row of categoriesRes.data ?? []) {
    await upsertManagedImage({
      scope_type: "category",
      scope_id: row.id,
      field_name: "cover_image_url",
      image_url: row.cover_image_url,
      upload_source: "category_cover",
      category_id: row.id,
    })
  }

  for (const row of subcategoriesRes.data ?? []) {
    await upsertManagedImage({
      scope_type: "subcategory",
      scope_id: row.id,
      field_name: "cover_image_url",
      image_url: row.cover_image_url,
      upload_source: "subcategory_cover",
      category_id: row.category_id,
      subcategory_id: row.id,
    })
  }

  for (const row of contentBlocksRes.data ?? []) {
    const data = row.data ?? {}
    await upsertManagedImage({
      scope_type: "content_block",
      scope_id: row.id,
      field_name: "image_url",
      image_url: data.image_url,
      upload_source: "content_block_image",
      category_id: row.category_id,
      subcategory_id: row.subcategory_id,
      block_type: row.block_type,
    })
    await upsertManagedImage({
      scope_type: "content_block",
      scope_id: row.id,
      field_name: "icon_url",
      image_url: data.icon_url,
      upload_source: "content_block_icon",
      category_id: row.category_id,
      subcategory_id: row.subcategory_id,
      block_type: row.block_type,
    })
  }

  for (const row of reusableNodesRes.data ?? []) {
    const data = row.data ?? {}
    await upsertManagedImage({
      scope_type: "reusable_section_node",
      scope_id: row.id,
      field_name: "image_url",
      image_url: data.image_url,
      upload_source: "reusable_section_image",
      section_id: row.section_id,
      block_type: row.block_type,
    })
    await upsertManagedImage({
      scope_type: "reusable_section_node",
      scope_id: row.id,
      field_name: "icon_url",
      image_url: data.icon_url,
      upload_source: "reusable_section_icon",
      section_id: row.section_id,
      block_type: row.block_type,
    })
  }

  for (const row of blogPostsRes.data ?? []) {
    await upsertManagedImage({
      scope_type: "blog_post",
      scope_id: row.id,
      field_name: "cover_image_url",
      image_url: row.cover_image_url,
      upload_source: "blog_cover",
      blog_post_id: row.id,
    })
  }

  for (const row of blogImagesRes.data ?? []) {
    await upsertManagedImage({
      scope_type: "blog_image",
      scope_id: row.id,
      field_name: "image_url",
      image_url: row.image_url,
      upload_source: "blog_gallery",
      blog_post_id: row.blog_post_id,
    })
  }

  for (const row of siteSettingsRes.data ?? []) {
    await upsertManagedImage({
      scope_type: "site_setting",
      scope_id: row.key,
      field_name: "value",
      image_url: row.value,
      upload_source: row.key,
    })
  }

  console.log("Managed images backfill completed.")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
