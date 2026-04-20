import { createClient } from "@/lib/supabase/server"
import type { Category, Subcategory } from "@/lib/types"
import { HeaderShell } from "@/components/public/header-shell"
import { Footer } from "@/components/public/footer"
import { ContentBlocksSection } from "@/components/public/content-blocks-section"
import { loadRegionBlocks } from "@/lib/reusable-sections"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("*, subcategories(*)")
    .order("display_order")
    .order("display_order", {
      referencedTable: "subcategories",
    })

  const typedCategories = (categories ?? []) as (Category & {
    subcategories: Subcategory[]
  })[]
  const beforeFooterBlocks = await loadRegionBlocks("before_footer")

  return (
    <>
      <HeaderShell categories={typedCategories} />
      <main className="min-h-screen">{children}</main>
      {beforeFooterBlocks.length > 0 ? (
        <ContentBlocksSection blocks={beforeFooterBlocks} compactSpacing />
      ) : null}
      <Footer categories={typedCategories} />
    </>
  )
}
