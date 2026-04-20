import { createClient } from "@/lib/supabase/server"
import { ReusableSectionsManager } from "@/components/admin/content-structure/reusable-sections-manager"
import type { ReusableSection, SiteRegionItem } from "@/lib/types"

export default async function AdminReusableSectionsPage() {
  const supabase = await createClient()

  const [sectionsRes, afterHeroRes, beforeFooterRes] = await Promise.all([
    supabase.from("reusable_sections").select("*").order("updated_at", {
      ascending: false,
    }),
    supabase
      .from("site_region_items")
      .select("*")
      .eq("region_key", "after_hero")
      .order("display_order", { ascending: true }),
    supabase
      .from("site_region_items")
      .select("*")
      .eq("region_key", "before_footer")
      .order("display_order", { ascending: true }),
  ])

  const sections = (sectionsRes.data ?? []) as ReusableSection[]
  const afterHeroItems = (afterHeroRes.data ?? []) as SiteRegionItem[]
  const beforeFooterItems = (beforeFooterRes.data ?? []) as SiteRegionItem[]

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Globálne bloky</h1>
      <ReusableSectionsManager
        sections={sections}
        afterHeroItems={afterHeroItems}
        beforeFooterItems={beforeFooterItems}
      />
    </div>
  )
}
