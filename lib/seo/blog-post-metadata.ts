import type { Metadata } from "next"
import { buildServicePageMetadata } from "@/lib/seo/service-page-metadata"
import type { BlogPost } from "@/lib/types"

type BuildBlogPostMetadataInput = {
  post: Pick<BlogPost, "title" | "slug" | "content" | "cover_image_url">
}

export function buildBlogPostMetadata({ post }: BuildBlogPostMetadataInput): Metadata {
  return buildServicePageMetadata({
    titleParts: [post.title, "Blog"],
    description: post.content,
    path: `/blog/${post.slug}`,
    image: post.cover_image_url,
  })
}
