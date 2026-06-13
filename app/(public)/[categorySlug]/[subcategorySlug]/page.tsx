import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ContentHero } from "@/components/public/content-hero"
import { ContentBlocksSection } from "@/components/public/content-blocks-section"
import { PriceListSection } from "@/components/public/price-list-section"
import { AfterHeroRegion } from "@/components/public/after-hero-region"
import { ContentContactCtaSection } from "@/components/public/content-contact-cta-section"
import { SnipframeSection } from "@/components/public/snipframe-section"
import { JsonLd } from "@/components/public/json-ld"
import type { Category, ContentBlock, PriceListItem, Subcategory } from "@/lib/types"
import type { Metadata } from "next"
import { buildPriceListSections } from "@/lib/price-list"
import { getCompanyPublicInfoCached } from "@/lib/get-company-settings-cached"
import { loadSubcategoryPage } from "@/lib/seo/load-subcategory-page"
import { buildSubcategoryMetadata } from "@/lib/seo/subcategory-metadata"
import { buildSubcategoryJsonLd } from "@/lib/seo/subcategory-json-ld"
import { joinWithPipe } from "@/lib/site-config"

type Props = {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params
  const page = await loadSubcategoryPage(categorySlug, subcategorySlug)
  if (!page) return {}
  return buildSubcategoryMetadata(page)
}

export default async function SubcategoryPage({ params }: Props) {
  const { categorySlug, subcategorySlug } = await params
  const page = await loadSubcategoryPage(categorySlug, subcategorySlug)
  if (!page) notFound()

  const { category, subcategory } = page
  const supabase = await createClient()

  const [{ data: contentBlocks }, { data: allPriceListItems }, company] =
    await Promise.all([
      supabase
        .from("content_blocks")
        .select("*")
        .eq("subcategory_id", subcategory.id)
        .order("display_order"),
      supabase.from("price_list_items").select("*").order("display_order"),
      getCompanyPublicInfoCached(),
    ])

  const priceListItems = ((allPriceListItems ?? []) as PriceListItem[]).filter(
    (item) =>
      item.category_id === category.id || item.subcategory_id === subcategory.id
  )

  const priceListSection = buildPriceListSections(
    [category as Category],
    [subcategory as Subcategory],
    priceListItems
  )[0]

  const heroTitle = joinWithPipe(subcategory.name, category.name)
  const jsonLd = buildSubcategoryJsonLd({
    category,
    subcategory,
    path: page.path,
    company,
    priceListItems,
  })

  return (
    <>
      <JsonLd data={jsonLd} />
      <ContentHero
        imageUrl={subcategory.cover_image_url}
        title={heroTitle}
        description={subcategory.description}
        breadcrumbs={[
          { label: "Domov", href: "/" },
          { label: category.name, href: `/${category.slug}` },
          { label: subcategory.name },
        ]}
      />
      {priceListSection ? (
        <PriceListSection
          company={company}
          title="Cenník"
          items={priceListSection.items}
          subcategories={priceListSection.subcategories.map(({ subcategory, items }) => ({
            title: subcategory.name,
            items,
          }))}
        />
      ) : null}
      <AfterHeroRegion />
      <ContentBlocksSection
        blocks={(contentBlocks ?? []) as ContentBlock[]}
      />
      <SnipframeSection />
      <ContentContactCtaSection company={company} />
    </>
  )
}
