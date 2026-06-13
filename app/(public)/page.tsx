import { createClient } from "@/lib/supabase/server"
import { HomeHero } from "@/components/public/home-hero"
import { AfterHeroRegion } from "@/components/public/after-hero-region"
import { JsonLd } from "@/components/public/json-ld"
import type { Category, Subcategory } from "@/lib/types"
import type { Metadata } from "next"
import { getCompanyPublicInfoCached } from "@/lib/get-company-settings-cached"
import { buildHomepageJsonLd } from "@/lib/seo/homepage-json-ld"
import { buildHomepageMetadata } from "@/lib/seo/homepage-metadata"
import {
  DEFAULT_HOMEPAGE_H1,
  getHomepageSettingsCached,
} from "@/lib/seo/load-homepage-settings"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getHomepageSettingsCached()
  return buildHomepageMetadata(settings)
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: categories }, settings, company] = await Promise.all([
    supabase
      .from("categories")
      .select("*, subcategories(*)")
      .order("display_order")
      .order("display_order", { referencedTable: "subcategories" }),
    getHomepageSettingsCached(),
    getCompanyPublicInfoCached(),
  ])

  const typedCategories = (categories ?? []) as (Category & {
    subcategories: Subcategory[]
  })[]

  const jsonLd = buildHomepageJsonLd({ settings, company })

  return (
    <>
      <JsonLd data={jsonLd} />
      <HomeHero
        title={settings.h1 || DEFAULT_HOMEPAGE_H1}
        description={settings.description}
        imageUrl={settings.coverImage || null}
        topCategories={typedCategories}
      />
      <AfterHeroRegion />
    </>
  )
}
