import { joinWithPipe } from "@/lib/site-config"
import type { CompanyPublicInfo } from "@/lib/company-site-settings"
import type { Category, PriceListItem, Subcategory } from "@/lib/types"
import { buildServicePageJsonLd } from "@/lib/seo/service-page-json-ld"

type BuildSubcategoryJsonLdInput = {
  category: Category
  subcategory: Subcategory
  path: string
  company: CompanyPublicInfo
  priceListItems?: PriceListItem[]
}

export function buildSubcategoryJsonLd({
  category,
  subcategory,
  path,
  company,
  priceListItems = [],
}: BuildSubcategoryJsonLdInput) {
  const serviceName = joinWithPipe(subcategory.name, category.name)

  return buildServicePageJsonLd({
    path,
    serviceName,
    serviceType: category.name,
    description: subcategory.description ?? category.description,
    image: subcategory.cover_image_url,
    company,
    priceListItems,
    breadcrumbs: [
      { name: "Domov", path: "/" },
      { name: category.name, path: `/${category.slug}` },
      { name: subcategory.name, path },
    ],
  })
}
