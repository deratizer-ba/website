"use server"

import { createClient } from "@/lib/supabase/server"
import {
  removeAllManagedImagesForScope,
  syncManagedImageReference,
} from "@/lib/managed-images"
import { removeBackgroundFromImageUrl } from "@/lib/replicate/remove-bg"
import { revalidatePath, revalidateTag } from "next/cache"
import sharp from "sharp"
import type { PriceListItem, SiteRegionKey } from "@/lib/types"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const IMAGE_SITE_SETTING_KEYS = new Set(["homepage_cover_image"])

function revalidateImageAdmin() {
  revalidatePath("/admin/obrazky")
}

function revalidatePriceList() {
  revalidatePath("/cennik")
  revalidatePath("/admin/cennik")
  revalidateImageAdmin()
}

function asOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const normalized = value.trim()
  return normalized || null
}

async function syncContentBlockManagedImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: {
    id: string
    block_type: string
    category_id: string | null
    subcategory_id: string | null
    data: Record<string, unknown>
  }
) {
  const imageUrl = asOptionalString(row.data.image_url)
  const iconUrl = asOptionalString(row.data.icon_url)

  await syncManagedImageReference(supabase, {
    scopeType: "content_block",
    scopeId: row.id,
    fieldName: "image_url",
    imageUrl,
    uploadSource: "content_block_image",
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    blockType: row.block_type,
  })
  await syncManagedImageReference(supabase, {
    scopeType: "content_block",
    scopeId: row.id,
    fieldName: "icon_url",
    imageUrl: iconUrl,
    uploadSource: "content_block_icon",
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    blockType: row.block_type,
  })
}

async function syncReusableSectionNodeManagedImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: {
    id: string
    section_id: string
    block_type: string
    data: Record<string, unknown>
  }
) {
  const imageUrl = asOptionalString(row.data.image_url)
  const iconUrl = asOptionalString(row.data.icon_url)

  await syncManagedImageReference(supabase, {
    scopeType: "reusable_section_node",
    scopeId: row.id,
    fieldName: "image_url",
    imageUrl,
    uploadSource: "reusable_section_image",
    sectionId: row.section_id,
    blockType: row.block_type,
  })
  await syncManagedImageReference(supabase, {
    scopeType: "reusable_section_node",
    scopeId: row.id,
    fieldName: "icon_url",
    imageUrl: iconUrl,
    uploadSource: "reusable_section_icon",
    sectionId: row.section_id,
    blockType: row.block_type,
  })
}

async function syncPriceListItemManagedImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: {
    id: string
    category_id: string | null
    subcategory_id: string | null
    image_url: string | null
  }
) {
  await syncManagedImageReference(supabase, {
    scopeType: "price_list_item",
    scopeId: row.id,
    fieldName: "image_url",
    imageUrl: row.image_url,
    uploadSource: "price_list_item",
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
  })
}

async function persistManagedImageChange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  managedImageId: string,
  nextImageUrl: string | null
) {
  const normalizedUrl = asOptionalString(nextImageUrl)
  const { data: managed, error: managedError } = await supabase
    .from("managed_images")
    .select("*")
    .eq("id", managedImageId)
    .maybeSingle()

  if (managedError) throw new Error(managedError.message)
  if (!managed) throw new Error("Záznam obrázka sa nenašiel")

  if (managed.scope_type === "category") {
    const { error } = await supabase
      .from("categories")
      .update({ cover_image_url: normalizedUrl })
      .eq("id", managed.scope_id)
    if (error) throw new Error(error.message)
    await syncManagedImageReference(supabase, {
      scopeType: "category",
      scopeId: managed.scope_id,
      fieldName: managed.field_name,
      imageUrl: normalizedUrl,
      uploadSource: "category_cover",
      categoryId: managed.scope_id,
    })
  } else if (managed.scope_type === "subcategory") {
    const { data: row, error: updateError } = await supabase
      .from("subcategories")
      .update({ cover_image_url: normalizedUrl })
      .eq("id", managed.scope_id)
      .select("id, category_id")
      .single()
    if (updateError) throw new Error(updateError.message)
    await syncManagedImageReference(supabase, {
      scopeType: "subcategory",
      scopeId: managed.scope_id,
      fieldName: managed.field_name,
      imageUrl: normalizedUrl,
      uploadSource: "subcategory_cover",
      categoryId: row.category_id,
      subcategoryId: managed.scope_id,
    })
  } else if (managed.scope_type === "blog_post") {
    const { error } = await supabase
      .from("blog_posts")
      .update({ cover_image_url: normalizedUrl })
      .eq("id", managed.scope_id)
    if (error) throw new Error(error.message)
    await syncManagedImageReference(supabase, {
      scopeType: "blog_post",
      scopeId: managed.scope_id,
      fieldName: managed.field_name,
      imageUrl: normalizedUrl,
      uploadSource: "blog_cover",
      blogPostId: managed.scope_id,
    })
  } else if (managed.scope_type === "blog_image") {
    if (!normalizedUrl) {
      await removeAllManagedImagesForScope(supabase, "blog_image", managed.scope_id)
      const { error } = await supabase
        .from("blog_images")
        .delete()
        .eq("id", managed.scope_id)
      if (error) throw new Error(error.message)
    } else {
      const { data: row, error: updateError } = await supabase
        .from("blog_images")
        .update({ image_url: normalizedUrl })
        .eq("id", managed.scope_id)
        .select("id, blog_post_id")
        .single()
      if (updateError) throw new Error(updateError.message)
      await syncManagedImageReference(supabase, {
        scopeType: "blog_image",
        scopeId: managed.scope_id,
        fieldName: managed.field_name,
        imageUrl: normalizedUrl,
        uploadSource: "blog_gallery",
        blogPostId: row.blog_post_id,
      })
    }
  } else if (managed.scope_type === "site_setting") {
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key: managed.scope_id, value: normalizedUrl ?? "" },
        { onConflict: "key" }
      )
    if (error) throw new Error(error.message)
    await syncManagedImageReference(supabase, {
      scopeType: "site_setting",
      scopeId: managed.scope_id,
      fieldName: managed.field_name,
      imageUrl: normalizedUrl,
      uploadSource: managed.upload_source,
    })
  } else if (managed.scope_type === "content_block") {
    const { data: row, error: fetchError } = await supabase
      .from("content_blocks")
      .select("id, block_type, category_id, subcategory_id, data")
      .eq("id", managed.scope_id)
      .single()
    if (fetchError) throw new Error(fetchError.message)
    const nextData = { ...(row.data ?? {}) } as Record<string, unknown>
    if (normalizedUrl) nextData[managed.field_name] = normalizedUrl
    else delete nextData[managed.field_name]
    const { data: updated, error: updateError } = await supabase
      .from("content_blocks")
      .update({ data: nextData })
      .eq("id", managed.scope_id)
      .select("id, block_type, category_id, subcategory_id, data")
      .single()
    if (updateError) throw new Error(updateError.message)
    await syncContentBlockManagedImages(supabase, updated)
  } else if (managed.scope_type === "reusable_section_node") {
    const { data: row, error: fetchError } = await supabase
      .from("reusable_section_nodes")
      .select("id, section_id, block_type, data")
      .eq("id", managed.scope_id)
      .single()
    if (fetchError) throw new Error(fetchError.message)
    const nextData = { ...(row.data ?? {}) } as Record<string, unknown>
    if (normalizedUrl) nextData[managed.field_name] = normalizedUrl
    else delete nextData[managed.field_name]
    const { data: updated, error: updateError } = await supabase
      .from("reusable_section_nodes")
      .update({ data: nextData })
      .eq("id", managed.scope_id)
      .select("id, section_id, block_type, data")
      .single()
    if (updateError) throw new Error(updateError.message)
    await syncReusableSectionNodeManagedImages(supabase, updated)
  } else if (managed.scope_type === "price_list_item") {
    const { data: updated, error: updateError } = await supabase
      .from("price_list_items")
      .update({ image_url: normalizedUrl })
      .eq("id", managed.scope_id)
      .select("id, category_id, subcategory_id, image_url")
      .single()
    if (updateError) throw new Error(updateError.message)
    await syncPriceListItemManagedImage(supabase, updated)
  } else {
    throw new Error("Nepodporovaný typ obrázka")
  }

  revalidateTag("site-settings", "max")
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
  revalidatePath("/admin/content/globalne-bloky")
  revalidatePath("/admin/homepage")
  revalidatePath("/admin/blog")
  revalidatePriceList()
}

export async function replaceManagedImage(
  managedImageId: string,
  imageUrl: string
) {
  const supabase = await createClient()
  await persistManagedImageChange(supabase, managedImageId, imageUrl)
}

export async function removeManagedImage(managedImageId: string) {
  const supabase = await createClient()
  await persistManagedImageChange(supabase, managedImageId, null)
}

// ============================================
// IMAGE UPLOAD
// ============================================

const MAX_IMAGE_DIMENSION = 2400
const WEBP_QUALITY = 85

function isSvgFile(file: File): boolean {
  if (file.name.toLowerCase().endsWith(".svg")) return true
  const t = file.type.toLowerCase()
  return t === "image/svg+xml" || t === "image/svg"
}

async function optimizeRasterBufferToWebp(
  input: ArrayBuffer | Buffer
): Promise<Buffer> {
  const inputBuffer = Buffer.isBuffer(input)
    ? input
    : Buffer.from(new Uint8Array(input))

  return sharp(inputBuffer)
    .rotate()
    .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: WEBP_QUALITY,
      alphaQuality: 100,
      effort: 4,
    })
    .toBuffer()
}

async function uploadFileToImagesBucket(file: File): Promise<string> {
  const supabase = await createClient()
  const isSvg = isSvgFile(file)
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${
    isSvg ? "svg" : "webp"
  }`

  const fileBody = isSvg
    ? file
    : await optimizeRasterBufferToWebp(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from("images")
    .upload(fileName, fileBody, {
      contentType: isSvg ? file.type || "image/svg+xml" : "image/webp",
    })

  if (error) throw new Error(error.message)

  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(fileName)

  return publicUrl
}

export async function uploadImage(formData: FormData): Promise<string> {
  const file = formData.get("file") as File

  if (!file || file.size === 0) throw new Error("Žiadny súbor")

  return uploadFileToImagesBucket(file)
}

/** Nahratie coveru pre kategóriu/podkategóriu: Replicate remove-bg → PNG do storage (SVG len priamy upload). */
export async function uploadCategoryCoverImage(formData: FormData): Promise<string> {
  const supabase = await createClient()
  const file = formData.get("file") as File

  if (!file || file.size === 0) throw new Error("Žiadny súbor")

  if (isSvgFile(file)) {
    return uploadFileToImagesBucket(file)
  }

  if (!process.env.REPLICATE_TOKEN) {
    throw new Error("Chýba REPLICATE_TOKEN v prostredí")
  }

  const fileExt = file.name.split(".").pop() || "jpg"
  const tempName = `tmp-replicate-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

  const { error: upErr } = await supabase.storage
    .from("images")
    .upload(tempName, file)

  if (upErr) throw new Error(upErr.message)

  const {
    data: { publicUrl: tempPublicUrl },
  } = supabase.storage.from("images").getPublicUrl(tempName)

  try {
    const outputUrl = await removeBackgroundFromImageUrl(tempPublicUrl)

    const imgRes = await fetch(outputUrl)
    if (!imgRes.ok) {
      throw new Error("Nepodarilo sa stiahnuť spracovaný obrázok")
    }

    const optimized = await optimizeRasterBufferToWebp(await imgRes.arrayBuffer())
    const finalName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`

    const { error: finalErr } = await supabase.storage
      .from("images")
      .upload(finalName, optimized, { contentType: "image/webp" })

    if (finalErr) throw new Error(finalErr.message)

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(finalName)

    return publicUrl
  } finally {
    await supabase.storage.from("images").remove([tempName])
  }
}

// ============================================
// SITE SETTINGS
// ============================================

export async function updateSiteSetting(key: string, value: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value }, { onConflict: "key" })

  if (error) throw new Error(error.message)
  if (IMAGE_SITE_SETTING_KEYS.has(key)) {
    await syncManagedImageReference(supabase, {
      scopeType: "site_setting",
      scopeId: key,
      fieldName: "value",
      imageUrl: value,
      uploadSource: key,
    })
  }
  revalidateTag("site-settings", "max")
  revalidatePath("/")
  revalidatePath("/", "layout")
  revalidatePath("/admin/homepage")
  revalidatePath("/admin/firma")
  revalidateImageAdmin()
}

// ============================================
// CATEGORIES
// ============================================

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const cover_image_url = formData.get("cover_image_url") as string
  const icon_svg = ((formData.get("icon_svg") as string) || "").trim()
  const display_order = parseInt(formData.get("display_order") as string) || 0

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      slug: slugify(name),
      description: description || null,
      cover_image_url: cover_image_url || null,
      icon_svg: icon_svg || null,
      display_order,
    })
    .select("id")
    .single()

  if (error) throw new Error(error.message)
  await syncManagedImageReference(supabase, {
    scopeType: "category",
    scopeId: data.id,
    fieldName: "cover_image_url",
    imageUrl: cover_image_url,
    uploadSource: "category_cover",
    categoryId: data.id,
  })
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
  revalidateImageAdmin()
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const cover_image_url = formData.get("cover_image_url") as string
  const icon_svg = ((formData.get("icon_svg") as string) || "").trim()
  const display_order = parseInt(formData.get("display_order") as string) || 0

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug: slugify(name),
      description: description || null,
      cover_image_url: cover_image_url || null,
      icon_svg: icon_svg || null,
      display_order,
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
  await syncManagedImageReference(supabase, {
    scopeType: "category",
    scopeId: id,
    fieldName: "cover_image_url",
    imageUrl: cover_image_url,
    uploadSource: "category_cover",
    categoryId: id,
  })
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
  revalidateImageAdmin()
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  await removeAllManagedImagesForScope(supabase, "category", id)
  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
  revalidateImageAdmin()
}

/** Nastaví `display_order` podľa poradia ID (0, 1, 2, …). */
export async function reorderCategories(orderedIds: string[]) {
  const supabase = await createClient()
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("categories")
      .update({ display_order: i })
      .eq("id", orderedIds[i])
    if (error) throw new Error(error.message)
  }
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
}

// ============================================
// SUBCATEGORIES
// ============================================

export async function createSubcategory(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get("name") as string
  const category_id = formData.get("category_id") as string
  const description = formData.get("description") as string
  const cover_image_url = formData.get("cover_image_url") as string
  const display_order = parseInt(formData.get("display_order") as string) || 0

  const { data, error } = await supabase
    .from("subcategories")
    .insert({
      name,
      slug: slugify(name),
      category_id,
      description: description || null,
      cover_image_url: cover_image_url || null,
      display_order,
    })
    .select("id")
    .single()

  if (error) throw new Error(error.message)
  await syncManagedImageReference(supabase, {
    scopeType: "subcategory",
    scopeId: data.id,
    fieldName: "cover_image_url",
    imageUrl: cover_image_url,
    uploadSource: "subcategory_cover",
    categoryId: category_id,
    subcategoryId: data.id,
  })
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
  revalidateImageAdmin()
}

export async function updateSubcategory(id: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get("name") as string
  const category_id = formData.get("category_id") as string
  const description = formData.get("description") as string
  const cover_image_url = formData.get("cover_image_url") as string
  const display_order = parseInt(formData.get("display_order") as string) || 0

  const { error } = await supabase
    .from("subcategories")
    .update({
      name,
      slug: slugify(name),
      category_id,
      description: description || null,
      cover_image_url: cover_image_url || null,
      display_order,
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
  await syncManagedImageReference(supabase, {
    scopeType: "subcategory",
    scopeId: id,
    fieldName: "cover_image_url",
    imageUrl: cover_image_url,
    uploadSource: "subcategory_cover",
    categoryId: category_id,
    subcategoryId: id,
  })
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
  revalidateImageAdmin()
}

export async function deleteSubcategory(id: string) {
  const supabase = await createClient()

  await removeAllManagedImagesForScope(supabase, "subcategory", id)
  const { error } = await supabase
    .from("subcategories")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
  revalidateImageAdmin()
}

/** Poradie podkategórií v rámci jednej kategórie (`display_order` 0, 1, …). */
export async function reorderSubcategories(
  categoryId: string,
  orderedIds: string[]
) {
  const supabase = await createClient()
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("subcategories")
      .update({ display_order: i })
      .eq("id", orderedIds[i])
      .eq("category_id", categoryId)
    if (error) throw new Error(error.message)
  }
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
}

// ============================================
// PRICE LIST
// ============================================

function normalizePriceListScope(formData: FormData) {
  const categoryId = String(formData.get("category_id") ?? "").trim() || null
  const subcategoryId =
    String(formData.get("subcategory_id") ?? "").trim() || null

  if ((categoryId && subcategoryId) || (!categoryId && !subcategoryId)) {
    throw new Error("Riadok cenníka musí patriť buď ku kategórii alebo podkategórii")
  }

  return {
    categoryId,
    subcategoryId,
  }
}

export async function createPriceListItem(
  formData: FormData
): Promise<PriceListItem> {
  const supabase = await createClient()
  const { categoryId, subcategoryId } = normalizePriceListScope(formData)
  const name = String(formData.get("name") ?? "").trim()
  const price = String(formData.get("price") ?? "").trim()
  const imageUrl = asOptionalString(formData.get("image_url"))

  if (!name) throw new Error("Zadajte názov produktu")

  let query = supabase
    .from("price_list_items")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)

  query = categoryId
    ? query.eq("category_id", categoryId).is("subcategory_id", null)
    : query.is("category_id", null).eq("subcategory_id", subcategoryId)

  const { data: lastItem, error: lastItemError } = await query.maybeSingle()
  if (lastItemError) throw new Error(lastItemError.message)

  const displayOrder = (lastItem?.display_order ?? -1) + 1
  const { data: inserted, error } = await supabase
    .from("price_list_items")
    .insert({
      category_id: categoryId,
      subcategory_id: subcategoryId,
      name,
      price,
      image_url: imageUrl,
      display_order: displayOrder,
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  await syncPriceListItemManagedImage(supabase, inserted)
  revalidatePriceList()
  return inserted as PriceListItem
}

export async function updatePriceListItem(
  id: string,
  formData: FormData
): Promise<PriceListItem> {
  const supabase = await createClient()
  const name = String(formData.get("name") ?? "").trim()
  const price = String(formData.get("price") ?? "").trim()
  const imageUrl = asOptionalString(formData.get("image_url"))

  if (!name) throw new Error("Zadajte názov produktu")

  const { data: updated, error } = await supabase
    .from("price_list_items")
    .update({
      name,
      price,
      image_url: imageUrl,
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  await syncPriceListItemManagedImage(supabase, updated)
  revalidatePriceList()
  return updated as PriceListItem
}

export async function deletePriceListItem(id: string) {
  const supabase = await createClient()
  await removeAllManagedImagesForScope(supabase, "price_list_item", id)
  const { error } = await supabase.from("price_list_items").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePriceList()
}

export async function reorderPriceListItems(formData: FormData) {
  const supabase = await createClient()
  const { categoryId, subcategoryId } = normalizePriceListScope(formData)
  const raw = String(formData.get("ordered_ids") ?? "[]")

  let orderedIds: string[]
  try {
    orderedIds = JSON.parse(raw) as string[]
  } catch {
    throw new Error("Neplatné poradie")
  }

  for (let i = 0; i < orderedIds.length; i++) {
    let query = supabase
      .from("price_list_items")
      .update({ display_order: i })
      .eq("id", orderedIds[i])

    query = categoryId
      ? query.eq("category_id", categoryId).is("subcategory_id", null)
      : query.is("category_id", null).eq("subcategory_id", subcategoryId)

    const { error } = await query
    if (error) throw new Error(error.message)
  }

  revalidatePriceList()
}

// ============================================
// CONTENT BLOCKS (grid na stránke + podbloky v bunkách)
// ============================================

export async function createContentBlock(formData: FormData) {
  const supabase = await createClient()
  const block_type = formData.get("block_type") as string
  const parent_id_raw = formData.get("parent_id") as string | null
  const parent_id =
    parent_id_raw && String(parent_id_raw).trim() !== ""
      ? String(parent_id_raw)
      : null
  const cell_index =
    parseInt(String(formData.get("cell_index") ?? "0"), 10) || 0
  const category_id = (formData.get("category_id") as string) || ""
  const subcategory_id = (formData.get("subcategory_id") as string) || ""
  const dataRaw = formData.get("data") as string

  let data: Record<string, unknown>
  try {
    data = JSON.parse(dataRaw || "{}") as Record<string, unknown>
  } catch {
    throw new Error("Neplatné dáta bloku")
  }

  if (parent_id) {
    if (
      block_type !== "heading" &&
      block_type !== "text_block" &&
      block_type !== "icon_heading_text" &&
      block_type !== "image_heading_text_centered" &&
      block_type !== "heading_text_image_right" &&
      block_type !== "media_left_text_right"
    ) {
      throw new Error("Neplatný typ podbloku")
    }

    const { data: parentRow, error: pErr } = await supabase
      .from("content_blocks")
      .select("id, category_id, subcategory_id")
      .eq("id", parent_id)
      .maybeSingle()

    if (pErr) throw new Error(pErr.message)
    if (!parentRow) throw new Error("Rodičovský grid sa nenašiel")

    const { data: lastSibling } = await supabase
      .from("content_blocks")
      .select("display_order")
      .eq("parent_id", parent_id)
      .eq("cell_index", cell_index)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle()

    const display_order = (lastSibling?.display_order ?? -1) + 1

    const { data: inserted, error } = await supabase
      .from("content_blocks")
      .insert({
        block_type,
        data,
        parent_id,
        cell_index,
        category_id: parentRow.category_id,
        subcategory_id: parentRow.subcategory_id,
        display_order,
      })
      .select("id, block_type, category_id, subcategory_id, data")
      .single()

    if (error) throw new Error(error.message)
    await syncContentBlockManagedImages(supabase, inserted)
  } else {
    if (block_type !== "grid") {
      throw new Error("Na stránku patrí len grid — použite Nový grid.")
    }

    const layout = data.layout
    if (typeof layout !== "string") {
      throw new Error("Chýba rozloženie gridu")
    }

    let rootQuery = supabase
      .from("content_blocks")
      .select("display_order")
      .is("parent_id", null)
      .order("display_order", { ascending: false })
      .limit(1)

    if (category_id) {
      rootQuery = rootQuery
        .eq("category_id", category_id)
        .is("subcategory_id", null)
    } else if (subcategory_id) {
      rootQuery = rootQuery.eq("subcategory_id", subcategory_id)
    } else {
      throw new Error("Chýba kategória alebo podkategória")
    }

    const { data: lastRoot, error: lrErr } = await rootQuery.maybeSingle()
    if (lrErr) throw new Error(lrErr.message)

    const display_order = (lastRoot?.display_order ?? -1) + 1

    const { error } = await supabase.from("content_blocks").insert({
      block_type: "grid",
      data,
      parent_id: null,
      cell_index: 0,
      category_id: category_id || null,
      subcategory_id: subcategory_id || null,
      display_order,
    })

    if (error) throw new Error(error.message)
  }

  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
  revalidateImageAdmin()
}

export async function reorderContentGrids(formData: FormData) {
  const supabase = await createClient()
  const raw = formData.get("ordered_ids") as string
  let orderedIds: string[]
  try {
    orderedIds = JSON.parse(raw) as string[]
  } catch {
    throw new Error("Neplatné poradie")
  }

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("content_blocks")
      .update({ display_order: i })
      .eq("id", orderedIds[i])
      .is("parent_id", null)

    if (error) throw new Error(error.message)
  }

  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
}

export async function updateContentBlock(id: string, formData: FormData) {
  const supabase = await createClient()
  const display_order = parseInt(formData.get("display_order") as string) || 0
  const dataRaw = formData.get("data") as string

  let data: Record<string, unknown>
  try {
    data = JSON.parse(dataRaw || "{}") as Record<string, unknown>
  } catch {
    throw new Error("Neplatné dáta bloku")
  }

  const { data: updated, error } = await supabase
    .from("content_blocks")
    .update({ data, display_order })
    .eq("id", id)
    .select("id, block_type, category_id, subcategory_id, data")
    .single()

  if (error) throw new Error(error.message)
  await syncContentBlockManagedImages(supabase, updated)
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
  revalidateImageAdmin()
}

export async function deleteContentBlock(id: string) {
  const supabase = await createClient()

  const { data: row, error: fetchErr } = await supabase
    .from("content_blocks")
    .select("id, block_type, parent_id")
    .eq("id", id)
    .maybeSingle()

  if (fetchErr) throw new Error(fetchErr.message)
  if (!row) throw new Error("Blok sa nenašiel")

  if (row.parent_id === null && row.block_type === "grid") {
    const { count, error: cErr } = await supabase
      .from("content_blocks")
      .select("id", { count: "exact", head: true })
      .eq("parent_id", id)

    if (cErr) throw new Error(cErr.message)
    if (count !== null && count > 0) {
      throw new Error(
        "Grid s obsahom nie je možné zmazať. Najprv odstráňte všetky podbloky."
      )
    }
  }

  await removeAllManagedImagesForScope(supabase, "content_block", id)
  const { error } = await supabase.from("content_blocks").delete().eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
  revalidateImageAdmin()
}

// ============================================
// REUSABLE SECTIONS (single source of truth)
// ============================================

export async function createReusableSection(formData: FormData) {
  const supabase = await createClient()
  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()

  if (!name) throw new Error("Zadajte názov sekcie")

  const slugBase = slugify(name) || `sekcia-${Date.now()}`
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`

  const { error } = await supabase.from("reusable_sections").insert({
    name,
    slug,
    description: description || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
}

export async function assignSectionToRegion(
  regionKey: SiteRegionKey,
  sectionId: string,
  displayOrder: number
) {
  const supabase = await createClient()
  const { error } = await supabase.from("site_region_items").upsert(
    {
      region_key: regionKey,
      section_id: sectionId,
      display_order: displayOrder,
    },
    { onConflict: "region_key,section_id" }
  )
  if (error) throw new Error(error.message)
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
}

export async function removeSectionFromRegion(
  regionKey: SiteRegionKey,
  sectionId: string
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("site_region_items")
    .delete()
    .eq("region_key", regionKey)
    .eq("section_id", sectionId)
  if (error) throw new Error(error.message)
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
}

export async function createReusableSectionNode(formData: FormData) {
  const supabase = await createClient()
  const section_id = String(formData.get("section_id") ?? "")
  const block_type = String(formData.get("block_type") ?? "")
  const parent_id_raw = formData.get("parent_id") as string | null
  const parent_id =
    parent_id_raw && String(parent_id_raw).trim() !== ""
      ? String(parent_id_raw)
      : null
  const cell_index = parseInt(String(formData.get("cell_index") ?? "0"), 10) || 0
  const dataRaw = String(formData.get("data") ?? "{}")

  if (!section_id) throw new Error("Chýba sekcia")

  let data: Record<string, unknown>
  try {
    data = JSON.parse(dataRaw) as Record<string, unknown>
  } catch {
    throw new Error("Neplatné dáta bloku")
  }

  if (parent_id) {
    if (
      block_type !== "heading" &&
      block_type !== "text_block" &&
      block_type !== "icon_heading_text" &&
      block_type !== "image_heading_text_centered" &&
      block_type !== "heading_text_image_right" &&
      block_type !== "media_left_text_right"
    ) {
      throw new Error("Neplatný typ podbloku")
    }

    const { data: parentRow, error: pErr } = await supabase
      .from("reusable_section_nodes")
      .select("id, section_id")
      .eq("id", parent_id)
      .maybeSingle()
    if (pErr) throw new Error(pErr.message)
    if (!parentRow || parentRow.section_id !== section_id) {
      throw new Error("Rodičovský grid sa nenašiel")
    }

    const { data: lastSibling } = await supabase
      .from("reusable_section_nodes")
      .select("display_order")
      .eq("section_id", section_id)
      .eq("parent_id", parent_id)
      .eq("cell_index", cell_index)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle()

    const display_order = (lastSibling?.display_order ?? -1) + 1
    const { data: inserted, error } = await supabase
      .from("reusable_section_nodes")
      .insert({
        section_id,
        block_type,
        data,
        parent_id,
        cell_index,
        display_order,
      })
      .select("id, section_id, block_type, data")
      .single()
    if (error) throw new Error(error.message)
    await syncReusableSectionNodeManagedImages(supabase, inserted)
  } else {
    if (block_type !== "grid") {
      throw new Error("Na sekciu patrí ako root len grid")
    }
    const { data: lastRoot } = await supabase
      .from("reusable_section_nodes")
      .select("display_order")
      .eq("section_id", section_id)
      .is("parent_id", null)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle()

    const display_order = (lastRoot?.display_order ?? -1) + 1
    const { error } = await supabase.from("reusable_section_nodes").insert({
      section_id,
      block_type: "grid",
      data,
      parent_id: null,
      cell_index: 0,
      display_order,
    })
    if (error) throw new Error(error.message)
  }

  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
  revalidateImageAdmin()
}

export async function updateReusableSectionNode(id: string, formData: FormData) {
  const supabase = await createClient()
  const display_order = parseInt(String(formData.get("display_order") ?? "0"), 10) || 0
  const dataRaw = String(formData.get("data") ?? "{}")
  let data: Record<string, unknown>
  try {
    data = JSON.parse(dataRaw) as Record<string, unknown>
  } catch {
    throw new Error("Neplatné dáta bloku")
  }
  const { data: updated, error } = await supabase
    .from("reusable_section_nodes")
    .update({ data, display_order })
    .eq("id", id)
    .select("id, section_id, block_type, data")
    .single()
  if (error) throw new Error(error.message)
  await syncReusableSectionNodeManagedImages(supabase, updated)
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
  revalidateImageAdmin()
}

export async function deleteReusableSectionNode(id: string) {
  const supabase = await createClient()
  const { data: row, error: fetchErr } = await supabase
    .from("reusable_section_nodes")
    .select("id, block_type, parent_id")
    .eq("id", id)
    .maybeSingle()
  if (fetchErr) throw new Error(fetchErr.message)
  if (!row) throw new Error("Blok sa nenašiel")

  if (row.parent_id === null && row.block_type === "grid") {
    const { count, error: cErr } = await supabase
      .from("reusable_section_nodes")
      .select("id", { count: "exact", head: true })
      .eq("parent_id", id)
    if (cErr) throw new Error(cErr.message)
    if (count !== null && count > 0) {
      throw new Error("Grid s obsahom nie je možné zmazať.")
    }
  }

  await removeAllManagedImagesForScope(supabase, "reusable_section_node", id)
  const { error } = await supabase
    .from("reusable_section_nodes")
    .delete()
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
  revalidateImageAdmin()
}

export async function reorderReusableSectionGrids(formData: FormData) {
  const supabase = await createClient()
  const section_id = String(formData.get("section_id") ?? "")
  const raw = String(formData.get("ordered_ids") ?? "[]")
  if (!section_id) throw new Error("Chýba sekcia")
  let orderedIds: string[]
  try {
    orderedIds = JSON.parse(raw) as string[]
  } catch {
    throw new Error("Neplatné poradie")
  }
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("reusable_section_nodes")
      .update({ display_order: i })
      .eq("section_id", section_id)
      .eq("id", orderedIds[i])
      .is("parent_id", null)
    if (error) throw new Error(error.message)
  }
  revalidatePath("/", "layout")
  revalidatePath("/admin/content")
}

// ============================================
// BLOG POSTS
// ============================================

export async function createBlogPost(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const cover_image_url = formData.get("cover_image_url") as string
  const youtube_url = formData.get("youtube_url") as string
  const published = formData.get("published") === "true"

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title,
      slug: slugify(title),
      content: content || null,
      cover_image_url: cover_image_url || null,
      youtube_url: youtube_url || null,
      published,
    })
    .select("id")
    .single()

  if (error) throw new Error(error.message)
  await syncManagedImageReference(supabase, {
    scopeType: "blog_post",
    scopeId: data.id,
    fieldName: "cover_image_url",
    imageUrl: cover_image_url,
    uploadSource: "blog_cover",
    blogPostId: data.id,
  })
  revalidatePath("/blog")
  revalidatePath("/admin/blog")
  revalidateImageAdmin()
}

export async function updateBlogPost(id: string, formData: FormData) {
  const supabase = await createClient()
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const cover_image_url = formData.get("cover_image_url") as string
  const youtube_url = formData.get("youtube_url") as string
  const published = formData.get("published") === "true"

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title,
      slug: slugify(title),
      content: content || null,
      cover_image_url: cover_image_url || null,
      youtube_url: youtube_url || null,
      published,
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
  await syncManagedImageReference(supabase, {
    scopeType: "blog_post",
    scopeId: id,
    fieldName: "cover_image_url",
    imageUrl: cover_image_url,
    uploadSource: "blog_cover",
    blogPostId: id,
  })
  revalidatePath("/blog")
  revalidatePath("/admin/blog")
  revalidateImageAdmin()
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient()

  const { data: galleryRows, error: galleryFetchError } = await supabase
    .from("blog_images")
    .select("id")
    .eq("blog_post_id", id)
  if (galleryFetchError) throw new Error(galleryFetchError.message)

  await removeAllManagedImagesForScope(supabase, "blog_post", id)
  for (const row of galleryRows ?? []) {
    await removeAllManagedImagesForScope(supabase, "blog_image", row.id)
  }
  const { error } = await supabase.from("blog_posts").delete().eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/blog")
  revalidatePath("/admin/blog")
  revalidateImageAdmin()
}

export async function addBlogImage(blogPostId: string, imageUrl: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("blog_images")
    .insert({
      blog_post_id: blogPostId,
      image_url: imageUrl,
    })
    .select("id")
    .single()

  if (error) throw new Error(error.message)
  await syncManagedImageReference(supabase, {
    scopeType: "blog_image",
    scopeId: data.id,
    fieldName: "image_url",
    imageUrl,
    uploadSource: "blog_gallery",
    blogPostId,
  })
  revalidatePath("/admin/blog")
  revalidateImageAdmin()
}

export async function deleteBlogImage(id: string) {
  const supabase = await createClient()

  await removeAllManagedImagesForScope(supabase, "blog_image", id)
  const { error } = await supabase.from("blog_images").delete().eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/admin/blog")
  revalidateImageAdmin()
}
