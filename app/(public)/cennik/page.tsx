import { createClient } from "@/lib/supabase/server"
import { buildPriceListSections } from "@/lib/price-list"
import {
  PriceListContent,
  PriceListWithContactGrid,
} from "@/components/public/price-list-section"
import type { Category, PriceListItem, Subcategory } from "@/lib/types"
import type { Metadata } from "next"
import { getCompanyPublicInfoCached } from "@/lib/get-company-settings-cached"

export const metadata: Metadata = {
  title: "Cenník | Deratizéri",
  description: "Prehľad služieb a cien podľa kategórií a podkategórií.",
}

export default async function PriceListPage() {
  const supabase = await createClient()

  const [categoriesRes, subcategoriesRes, itemsRes, company] = await Promise.all([
    supabase.from("categories").select("*").order("display_order"),
    supabase.from("subcategories").select("*").order("display_order"),
    supabase.from("price_list_items").select("*").order("display_order"),
    getCompanyPublicInfoCached(),
  ])

  const sections = buildPriceListSections(
    (categoriesRes.data as Category[]) ?? [],
    (subcategoriesRes.data as Subcategory[]) ?? [],
    (itemsRes.data as PriceListItem[]) ?? []
  )

  return (
    <div className="pb-16 pt-24 sm:pt-28 lg:pt-32">
      {sections.length === 0 ? (
        <PriceListWithContactGrid company={company}>
          <div className="rounded-2xl border bg-card px-6 py-10 text-sm text-muted-foreground shadow-sm">
            Cenník zatiaľ nie je vyplnený.
          </div>
        </PriceListWithContactGrid>
      ) : (
        <PriceListWithContactGrid company={company}>
          <div className="space-y-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cenník</h1>
              <p className="mt-2 text-muted-foreground">
                Prehľad služieb a cien podľa kategórií a podkategórií.
              </p>
            </div>
            <div className="space-y-12">
              {sections.map((section) => (
                <PriceListContent
                  key={section.category.id}
                  title={section.category.name}
                  items={section.items}
                  subcategories={section.subcategories.map(
                    ({ subcategory, items }) => ({
                      title: subcategory.name,
                      items,
                    })
                  )}
                />
              ))}
            </div>
          </div>
        </PriceListWithContactGrid>
      )}
    </div>
  )
}
