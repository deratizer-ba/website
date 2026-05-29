import type { Metadata } from "next"
import { buildServicePageMetadata } from "@/lib/seo/service-page-metadata"
import type { CategoryPageData } from "@/lib/seo/load-category-page"

export function buildCategoryMetadata({ category, path }: CategoryPageData): Metadata {
  return buildServicePageMetadata({
    titleParts: [category.name],
    description: category.description,
    path,
    image: category.cover_image_url,
  })
}
