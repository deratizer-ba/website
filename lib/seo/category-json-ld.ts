import type { CompanyPublicInfo } from "@/lib/company-site-settings"
import type { Category, PriceListItem } from "@/lib/types"
import { buildServicePageJsonLd } from "@/lib/seo/service-page-json-ld"

type BuildCategoryJsonLdInput = {
  category: Category
  path: string
  company: CompanyPublicInfo
  priceListItems?: PriceListItem[]
}

export function buildCategoryJsonLd({
  category,
  path,
  company,
  priceListItems = [],
}: BuildCategoryJsonLdInput) {
  return buildServicePageJsonLd({
    path,
    serviceName: category.name,
    serviceType: category.name,
    description: category.description,
    image: category.cover_image_url,
    company,
    priceListItems,
    breadcrumbs: [
      { name: "Domov", path: "/" },
      { name: category.name, path },
    ],
  })
}
