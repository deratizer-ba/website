import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft } from "lucide-react"
import type { BlogPost, BlogImage } from "@/lib/types"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, content")
    .eq("slug", slug)
    .eq("published", true)
    .single()

  if (!post) return {}

  return {
    title: `${post.title} | Blog | Deratizéri`,
    description: post.content?.substring(0, 160),
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*, blog_images(*)")
    .eq("slug", slug)
    .eq("published", true)
    .single()

  if (!post) notFound()

  const typedPost = post as BlogPost & { blog_images: BlogImage[] }

  const youtubeEmbedUrl = typedPost.youtube_url
    ? getYoutubeEmbedUrl(typedPost.youtube_url)
    : null

  return (
    <>
      <div className="pt-28 lg:pt-32 pb-8 bg-muted/30 border-b">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Späť na blog
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {typedPost.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {new Date(typedPost.created_at).toLocaleDateString("sk-SK", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {typedPost.cover_image_url && (
          <div className="aspect-video relative rounded-xl overflow-hidden mb-10">
            <Image
              src={typedPost.cover_image_url}
              alt={typedPost.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {typedPost.content && (
          <div className="mb-12">
            <p className="whitespace-pre-wrap leading-relaxed text-foreground/90 text-[1.05rem]">
              {typedPost.content}
            </p>
          </div>
        )}

        {youtubeEmbedUrl && (
          <div className="aspect-video rounded-xl overflow-hidden mb-12 ring-1 ring-border">
            <iframe
              src={youtubeEmbedUrl}
              title={typedPost.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {typedPost.blog_images && typedPost.blog_images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {typedPost.blog_images
              .sort((a, b) => a.display_order - b.display_order)
              .map((img) => (
                <div
                  key={img.id}
                  className="aspect-video relative rounded-lg overflow-hidden ring-1 ring-border"
                >
                  <Image
                    src={img.image_url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
          </div>
        )}
      </article>
    </>
  )
}

function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    let videoId: string | null = null

    if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v")
    } else if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1)
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  } catch {
    return null
  }
}
