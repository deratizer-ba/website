import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { AfterHeroRegion } from "@/components/public/after-hero-region"
import type { BlogPost } from "@/lib/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog | Deratizéri",
  description: "Články, novinky a tipy zo sveta deratizácie",
}

export default async function BlogPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })

  const typedPosts = (posts ?? []) as BlogPost[]

  return (
    <>
      <div className="pt-28 lg:pt-32 pb-12 bg-muted/30 border-b">
        <div className="mx-auto w-full max-w-5xl px-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Blog
          </h1>
          <p className="text-muted-foreground mt-2">
            Články, novinky a tipy zo sveta deratizácie
          </p>
        </div>
      </div>
      <AfterHeroRegion />

      <section className="mx-auto w-full max-w-5xl px-4 py-12">
        {typedPosts.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            Zatiaľ tu nie sú žiadne články.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="aspect-video relative bg-muted">
                  {post.cover_image_url ? (
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <span className="text-muted-foreground text-sm">
                        Bez obrázku
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(post.created_at).toLocaleDateString("sk-SK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <h2 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h2>
                  {post.content && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.content.substring(0, 200)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
