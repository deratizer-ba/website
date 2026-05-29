import type { Metadata } from "next"
import { buildServiceDescription } from "@/lib/seo/service-description"
import { absoluteSitePath, buildMetaTitle } from "@/lib/site-config"

type BuildServicePageMetadataInput = {
  titleParts: string[]
  description?: string | null
  fallbackDescription?: string | null
  path: string
  image?: string | null
}

export function buildServicePageMetadata({
  titleParts,
  description,
  fallbackDescription,
  path,
  image,
}: BuildServicePageMetadataInput): Metadata {
  const title = buildMetaTitle(...titleParts)
  const metaDescription = buildServiceDescription(description, fallbackDescription)
  const trimmedImage = image?.trim()

  return {
    title,
    description: metaDescription,
    alternates: {
      canonical: absoluteSitePath(path),
    },
    openGraph: {
      title,
      description: metaDescription,
      type: "website",
      locale: "sk_SK",
      url: absoluteSitePath(path),
      ...(trimmedImage ? { images: [{ url: trimmedImage, alt: title }] } : {}),
    },
    twitter: {
      card: trimmedImage ? "summary_large_image" : "summary",
      title,
      description: metaDescription,
      ...(trimmedImage ? { images: [trimmedImage] } : {}),
    },
  }
}
