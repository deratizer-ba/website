import type { SupabaseClient } from "@supabase/supabase-js"
import type { ManagedImageScopeType } from "@/lib/types"

export const IMAGE_BUCKET = "images"

/** Minimálny typ klienta; neodkazuje na `lib/supabase/server` kvôli client bundle. */
type SupabaseLike = SupabaseClient

export type ManagedImageSyncInput = {
  scopeType: ManagedImageScopeType
  scopeId: string
  fieldName: string
  imageUrl: string | null | undefined
  uploadSource: string
  categoryId?: string | null
  subcategoryId?: string | null
  sectionId?: string | null
  blogPostId?: string | null
  blockType?: string | null
}

type StorageLocation = {
  bucket: string
  path: string
}

function normalizeUrl(url: string | null | undefined): string | null {
  const value = String(url ?? "").trim()
  return value || null
}

export function getStorageLocationFromUrl(
  imageUrl: string | null | undefined
): StorageLocation | null {
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
      bucket: decodeURIComponent(bucket),
      path: decodeURIComponent(parts.join("/")),
    }
  } catch {
    return null
  }
}

async function cleanupStorageObjectIfUnused(
  supabase: SupabaseLike,
  location: StorageLocation | null
) {
  if (!location?.bucket || !location.path) return

  const { count, error } = await supabase
    .from("managed_images")
    .select("id", { count: "exact", head: true })
    .eq("storage_bucket", location.bucket)
    .eq("storage_path", location.path)

  if (error) throw new Error(error.message)
  if ((count ?? 0) > 0) return

  const { error: removeError } = await supabase.storage
    .from(location.bucket)
    .remove([location.path])

  if (removeError) {
    throw new Error(removeError.message)
  }
}

export async function syncManagedImageReference(
  supabase: SupabaseLike,
  input: ManagedImageSyncInput
) {
  const normalizedUrl = normalizeUrl(input.imageUrl)
  const { data: existing, error: fetchError } = await supabase
    .from("managed_images")
    .select("*")
    .eq("scope_type", input.scopeType)
    .eq("scope_id", input.scopeId)
    .eq("field_name", input.fieldName)
    .maybeSingle()

  if (fetchError) throw new Error(fetchError.message)

  const previousLocation = getStorageLocationFromUrl(existing?.image_url)

  if (!normalizedUrl) {
    if (existing) {
      const { error: deleteError } = await supabase
        .from("managed_images")
        .delete()
        .eq("id", existing.id)

      if (deleteError) throw new Error(deleteError.message)
      await cleanupStorageObjectIfUnused(supabase, previousLocation)
    }
    return
  }

  const nextLocation = getStorageLocationFromUrl(normalizedUrl)
  const now = new Date().toISOString()

  const payload = {
    scope_type: input.scopeType,
    scope_id: input.scopeId,
    field_name: input.fieldName,
    image_url: normalizedUrl,
    storage_bucket: nextLocation?.bucket ?? null,
    storage_path: nextLocation?.path ?? null,
    upload_source: input.uploadSource,
    category_id: input.categoryId ?? null,
    subcategory_id: input.subcategoryId ?? null,
    section_id: input.sectionId ?? null,
    blog_post_id: input.blogPostId ?? null,
    block_type: input.blockType ?? null,
    updated_at: now,
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from("managed_images")
      .update(payload)
      .eq("id", existing.id)

    if (updateError) throw new Error(updateError.message)
  } else {
    const { error: insertError } = await supabase.from("managed_images").insert({
      ...payload,
      created_at: now,
    })

    if (insertError) throw new Error(insertError.message)
  }

  if (
    previousLocation &&
    (!nextLocation ||
      previousLocation.bucket !== nextLocation.bucket ||
      previousLocation.path !== nextLocation.path)
  ) {
    await cleanupStorageObjectIfUnused(supabase, previousLocation)
  }
}

export async function removeManagedImageReference(
  supabase: SupabaseLike,
  scopeType: ManagedImageScopeType,
  scopeId: string,
  fieldName: string
) {
  await syncManagedImageReference(supabase, {
    scopeType,
    scopeId,
    fieldName,
    imageUrl: null,
    uploadSource: "removed",
  })
}

export async function removeAllManagedImagesForScope(
  supabase: SupabaseLike,
  scopeType: ManagedImageScopeType,
  scopeId: string
) {
  const { data, error } = await supabase
    .from("managed_images")
    .select("id, image_url")
    .eq("scope_type", scopeType)
    .eq("scope_id", scopeId)

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) return

  const locations = data
    .map((row) => getStorageLocationFromUrl(row.image_url))
    .filter((row): row is StorageLocation => Boolean(row))

  const { error: deleteError } = await supabase
    .from("managed_images")
    .delete()
    .eq("scope_type", scopeType)
    .eq("scope_id", scopeId)

  if (deleteError) throw new Error(deleteError.message)

  for (const location of locations) {
    await cleanupStorageObjectIfUnused(supabase, location)
  }
}
