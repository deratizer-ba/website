import type { CompanyPublicInfo } from "@/lib/company-site-settings"
import { buildServiceProvider } from "@/lib/seo/service-json-ld-shared"
import { absoluteSitePath, getSiteUrl } from "@/lib/site-config"
import { buildHomepageDescription } from "@/lib/seo/homepage-metadata"
import type { HomepageSettings } from "@/lib/seo/load-homepage-settings"

type BuildHomepageJsonLdInput = {
  settings: HomepageSettings
  company: CompanyPublicInfo
}

export function buildHomepageJsonLd({
  settings,
  company,
}: BuildHomepageJsonLdInput) {
  const siteUrl = getSiteUrl() || absoluteSitePath("/")
  const organizationId = `${siteUrl}/#organization`
  const websiteId = `${siteUrl}/#website`
  const description = buildHomepageDescription(settings)
  const trimmedImage = settings.coverImage.trim() || undefined

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: company.displayName,
        description,
        inLanguage: "sk",
        publisher: { "@id": organizationId },
      },
      {
        ...buildServiceProvider(company),
        "@id": organizationId,
        url: siteUrl,
        ...(company.tagline.trim() ? { description: company.tagline.trim() } : {}),
        ...(trimmedImage ? { image: trimmedImage } : {}),
      },
    ],
  }
}
