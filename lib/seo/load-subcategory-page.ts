import { createClient } from "@/lib/supabase/server"
import type { Category, Subcategory } from "@/lib/types"

export type SubcategoryPageData = {
  category: Category
  subcategory: Subcategory
  path: string
}

export async function loadSubcategoryPage(
  categorySlug: string,
  subcategorySlug: string
): Promise<SubcategoryPageData | null> {
  const supabase = await createClient()

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", categorySlug)
    .single()

  if (!category) return null

  const { data: subcategory } = await supabase
    .from("subcategories")
    .select("*")
    .eq("slug", subcategorySlug)
    .eq("category_id", category.id)
    .single()

  if (!subcategory) return null

  return {
    category: category as Category,
    subcategory: subcategory as Subcategory,
    path: `/${categorySlug}/${subcategorySlug}`,
  }
}
