import type { Metadata } from "next"
import { buildServicePageMetadata } from "@/lib/seo/service-page-metadata"
import type { SubcategoryPageData } from "@/lib/seo/load-subcategory-page"

export function buildSubcategoryMetadata({
  category,
  subcategory,
  path,
}: SubcategoryPageData): Metadata {
  return buildServicePageMetadata({
    titleParts: [subcategory.name, category.name],
    description: subcategory.description,
    fallbackDescription: category.description,
    path,
    image: subcategory.cover_image_url,
  })
}
