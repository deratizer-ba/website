import type { CompanyPublicInfo } from "@/lib/company-site-settings"
import { buildServiceDescription } from "@/lib/seo/service-description"
import { absoluteSitePath } from "@/lib/site-config"
import type { BlogPost } from "@/lib/types"

type BuildBlogPostJsonLdInput = {
  post: Pick<
    BlogPost,
    "title" | "slug" | "content" | "cover_image_url" | "created_at" | "updated_at"
  >
  company: CompanyPublicInfo
}

export function buildBlogPostJsonLd({ post, company }: BuildBlogPostJsonLdInput) {
  const pageUrl = absoluteSitePath(`/blog/${post.slug}`)
  const description = buildServiceDescription(post.content)
  const trimmedImage = post.cover_image_url?.trim() || undefined

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${pageUrl}#article`,
    headline: post.title,
    url: pageUrl,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    inLanguage: "sk",
    ...(description ? { description } : {}),
    ...(trimmedImage ? { image: trimmedImage } : {}),
    author: {
      "@type": "Organization",
      name: company.displayName,
    },
    publisher: {
      "@type": "Organization",
      name: company.displayName,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  }
}
