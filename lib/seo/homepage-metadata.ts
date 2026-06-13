import type { Metadata } from "next"
import {
  DEFAULT_HOMEPAGE_DESCRIPTION,
  DEFAULT_HOMEPAGE_H1,
  type HomepageSettings,
} from "@/lib/seo/load-homepage-settings"
import { buildServiceDescription } from "@/lib/seo/service-description"
import { buildServicePageMetadata } from "@/lib/seo/service-page-metadata"

export function buildHomepageMetadata(settings: HomepageSettings): Metadata {
  return buildServicePageMetadata({
    titleParts: [settings.h1 || DEFAULT_HOMEPAGE_H1],
    description: settings.description,
    fallbackDescription: DEFAULT_HOMEPAGE_DESCRIPTION,
    path: "/",
    image: settings.coverImage,
  })
}

export function buildHomepageDescription(settings: HomepageSettings): string {
  return (
    buildServiceDescription(settings.description, DEFAULT_HOMEPAGE_DESCRIPTION) ??
    DEFAULT_HOMEPAGE_DESCRIPTION
  )
}
