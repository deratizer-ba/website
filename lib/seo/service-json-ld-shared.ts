import { withHttps } from "@/lib/company-site-settings"
import type { CompanyPublicInfo } from "@/lib/company-site-settings"
import type { PriceListItem } from "@/lib/types"

export type ServiceJsonLdBreadcrumb = {
  name: string
  path: string
}

export function buildServiceProvider(company: CompanyPublicInfo) {
  const provider: Record<string, unknown> = {
    "@type": ["LocalBusiness", "PestControl"],
    name: company.displayName,
  }

  if (company.phone) provider.telephone = company.phone
  if (company.email) provider.email = company.email

  const street = company.street.trim()
  const city = company.city.trim()
  const zip = company.zip.trim()
  const country = company.country.trim()

  if (street || city || zip || country) {
    provider.address = {
      "@type": "PostalAddress",
      ...(street ? { streetAddress: street } : {}),
      ...(city ? { addressLocality: city } : {}),
      ...(zip ? { postalCode: zip } : {}),
      ...(country ? { addressCountry: country } : {}),
    }
  }

  const sameAs = [withHttps(company.facebookUrl), withHttps(company.instagramUrl)].filter(
    Boolean
  )
  if (sameAs.length > 0) provider.sameAs = sameAs

  return provider
}

export function buildServiceOffers(items: PriceListItem[]) {
  return items
    .filter((item) => item.name.trim())
    .map((item) => ({
      "@type": "Offer",
      name: item.name.trim(),
      ...(item.price.trim() ? { description: item.price.trim() } : {}),
    }))
}
