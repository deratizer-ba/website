import { createClient } from "@/lib/supabase/server"
import type { Category } from "@/lib/types"

export type CategoryPageData = {
  category: Category
  path: string
}

export async function loadCategoryPage(
  categorySlug: string
): Promise<CategoryPageData | null> {
  const supabase = await createClient()

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", categorySlug)
    .single()

  if (!category) return null

  return {
    category: category as Category,
    path: `/${categorySlug}`,
  }
}
