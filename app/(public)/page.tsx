import { createClient } from "@/lib/supabase/server"
import { HomeHero } from "@/components/public/home-hero"
import { AfterHeroRegion } from "@/components/public/after-hero-region"
import type { Category, Subcategory } from "@/lib/types"

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: settings }, { data: categories }] = await Promise.all([
    supabase.from("site_settings").select("*"),
    supabase
      .from("categories")
      .select("*, subcategories(*)")
      .order("display_order")
      .order("display_order", { referencedTable: "subcategories" }),
  ])

  const getSetting = (key: string) =>
    settings?.find((s) => s.key === key)?.value ?? ""

  const h1 = getSetting("homepage_h1")
  const description = getSetting("homepage_description")
  const coverImage = getSetting("homepage_cover_image")

  const typedCategories = (categories ?? []) as (Category & {
    subcategories: Subcategory[]
  })[]

  return (
    <>
      <HomeHero
        title={h1 || "Profesionálna deratizácia"}
        description={description}
        imageUrl={coverImage || null}
        topCategories={typedCategories}
      />
      <AfterHeroRegion />
    </>
  )
}
