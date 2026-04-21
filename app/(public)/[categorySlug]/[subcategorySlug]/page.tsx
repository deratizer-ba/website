import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ContentHero } from "@/components/public/content-hero"
import { ContentBlocksSection } from "@/components/public/content-blocks-section"
import { PriceListSection } from "@/components/public/price-list-section"
import { AfterHeroRegion } from "@/components/public/after-hero-region"
import { ContentContactCtaSection } from "@/components/public/content-contact-cta-section"
import type { Category, ContentBlock, PriceListItem, Subcategory } from "@/lib/types"
import type { Metadata } from "next"
import { buildPriceListSections } from "@/lib/price-list"
import { getCompanyPublicInfoCached } from "@/lib/get-company-settings-cached"

type Props = {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subcategorySlug } = await params
  const supabase = await createClient()
  const { data: subcategory } = await supabase
    .from("subcategories")
    .select("name, description")
    .eq("slug", subcategorySlug)
    .single()

  if (!subcategory) return {}

  return {
    title: `${subcategory.name} | Deratizéri`,
    description: subcategory.description,
  }
}

export default async function SubcategoryPage({ params }: Props) {
  const { categorySlug, subcategorySlug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", categorySlug)
    .single()

  if (!category) notFound()

  const { data: subcategory } = await supabase
    .from("subcategories")
    .select("*")
    .eq("slug", subcategorySlug)
    .eq("category_id", category.id)
    .single()

  if (!subcategory) notFound()

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

  return (
    <>
      <ContentHero
        imageUrl={subcategory.cover_image_url}
        title={subcategory.name}
        description={subcategory.description}
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
    </>
  )
}
