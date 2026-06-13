import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ContentHero } from "@/components/public/content-hero"
import { ContentBlocksSection } from "@/components/public/content-blocks-section"
import { PriceListSection } from "@/components/public/price-list-section"
import { SubcategoriesGrid } from "@/components/public/subcategories-grid"
import { AfterHeroRegion } from "@/components/public/after-hero-region"
import { ContentContactCtaSection } from "@/components/public/content-contact-cta-section"
import { SnipframeSection } from "@/components/public/snipframe-section"
import { JsonLd } from "@/components/public/json-ld"
import type { Category, ContentBlock, PriceListItem, Subcategory } from "@/lib/types"
import type { Metadata } from "next"
import { buildPriceListSections } from "@/lib/price-list"
import { getCompanyPublicInfoCached } from "@/lib/get-company-settings-cached"
import { loadCategoryPage } from "@/lib/seo/load-category-page"
import { buildCategoryMetadata } from "@/lib/seo/category-metadata"
import { buildCategoryJsonLd } from "@/lib/seo/category-json-ld"

type Props = {
  params: Promise<{ categorySlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params
  const page = await loadCategoryPage(categorySlug)
  if (!page) return {}
  return buildCategoryMetadata(page)
}

export default async function CategoryPage({ params }: Props) {
  const { categorySlug } = await params
  const page = await loadCategoryPage(categorySlug)
  if (!page) notFound()

  const { category } = page
  const supabase = await createClient()

  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", category.id)
    .order("display_order")

  const [{ data: contentBlocks }, { data: allPriceListItems }, company] =
    await Promise.all([
      supabase
        .from("content_blocks")
        .select("*")
        .eq("category_id", category.id)
        .order("display_order"),
      supabase
        .from("price_list_items")
        .select("*")
        .order("display_order"),
      getCompanyPublicInfoCached(),
    ])

  const subcategoryIds = new Set((subcategories ?? []).map((sub) => sub.id))
  const priceListItems = ((allPriceListItems ?? []) as PriceListItem[]).filter(
    (item) =>
      item.category_id === category.id ||
      (item.subcategory_id ? subcategoryIds.has(item.subcategory_id) : false)
  )

  const priceListSection = buildPriceListSections(
    [category as Category],
    (subcategories ?? []) as Subcategory[],
    (priceListItems ?? []) as PriceListItem[]
  )[0]

  const jsonLd = buildCategoryJsonLd({
    category,
    path: page.path,
    company,
    priceListItems,
  })

  return (
    <>
      <JsonLd data={jsonLd} />
      <ContentHero
        imageUrl={category.cover_image_url}
        title={category.name}
        description={category.description}
        breadcrumbs={[
          { label: "Domov", href: "/" },
          { label: category.name },
        ]}
      />
      <SubcategoriesGrid
        subcategories={subcategories ?? []}
        categorySlug={categorySlug}
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
      <ContentContactCtaSection company={company} />
      <SnipframeSection />
    </>
  )
}
