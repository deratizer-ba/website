import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"
import { absoluteSitePath, getSiteUrl } from "@/lib/site-config"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  if (!siteUrl) return []

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [{ data: categories }, { data: subcategories }, { data: posts }] =
    await Promise.all([
      supabase.from("categories").select("id, slug, updated_at").order("display_order"),
      supabase.from("subcategories").select("slug, category_id, updated_at"),
      supabase
        .from("blog_posts")
        .select("slug, updated_at")
        .eq("published", true)
        .order("created_at", { ascending: false }),
    ])

  const categorySlugById = new Map(
    (categories ?? []).map((category) => [category.id, category.slug])
  )

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteSitePath("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteSitePath("/cennik"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteSitePath("/kontakt"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteSitePath("/blog"), changeFrequency: "weekly", priority: 0.8 },
  ]

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((category) => ({
    url: absoluteSitePath(`/${category.slug}`),
    lastModified: category.updated_at ?? undefined,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }))

  const subcategoryPages: MetadataRoute.Sitemap = (subcategories ?? [])
    .map((subcategory) => {
      const categorySlug = categorySlugById.get(subcategory.category_id)
      if (!categorySlug) return null
      return {
        url: absoluteSitePath(`/${categorySlug}/${subcategory.slug}`),
        lastModified: subcategory.updated_at ?? undefined,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: absoluteSitePath(`/blog/${post.slug}`),
    lastModified: post.updated_at ?? undefined,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...categoryPages, ...subcategoryPages, ...blogPages]
}
