import { absoluteSitePath } from "@/lib/site-config"
import type { CompanyPublicInfo } from "@/lib/company-site-settings"
import type { PriceListItem } from "@/lib/types"
import {
  buildServiceOffers,
  buildServiceProvider,
  type ServiceJsonLdBreadcrumb,
} from "@/lib/seo/service-json-ld-shared"

export type BuildServicePageJsonLdInput = {
  path: string
  serviceName: string
  serviceType?: string
  description?: string | null
  image?: string | null
  company: CompanyPublicInfo
  breadcrumbs: ServiceJsonLdBreadcrumb[]
  priceListItems?: PriceListItem[]
}

export function buildServicePageJsonLd({
  path,
  serviceName,
  serviceType,
  description,
  image,
  company,
  breadcrumbs,
  priceListItems = [],
}: BuildServicePageJsonLdInput) {
  const pageUrl = absoluteSitePath(path)
  const trimmedDescription = description?.trim() || undefined
  const trimmedImage = image?.trim() || undefined
  const offers = buildServiceOffers(priceListItems)

  const service: Record<string, unknown> = {
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: serviceName,
    url: pageUrl,
    provider: buildServiceProvider(company),
  }

  if (serviceType?.trim()) service.serviceType = serviceType.trim()
  if (trimmedDescription) service.description = trimmedDescription
  if (trimmedImage) service.image = trimmedImage

  const areaServed = company.country.trim() || "Slovensko"
  service.areaServed = {
    "@type": "Country",
    name: areaServed,
  }

  if (offers.length > 0) service.offers = offers

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: serviceName,
        inLanguage: "sk",
        ...(trimmedDescription ? { description: trimmedDescription } : {}),
        ...(trimmedImage
          ? { primaryImageOfPage: { "@type": "ImageObject", url: trimmedImage } }
          : {}),
        isPartOf: {
          "@type": "WebSite",
          name: company.displayName,
        },
        about: { "@id": `${pageUrl}#service` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: absoluteSitePath(crumb.path),
        })),
      },
      service,
    ],
  }
}
