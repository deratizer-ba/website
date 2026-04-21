import Image from "next/image"
import Link from "next/link"
import type { Subcategory } from "@/lib/types"

type Props = {
  subcategories: Subcategory[]
  categorySlug: string
}

export function SubcategoriesGrid({ subcategories, categorySlug }: Props) {
  if (subcategories.length === 0) return null

  return (
    <section className="border-border bg-white pb-16 pt-16 text-foreground dark:bg-background">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          Podkategórie
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
          {subcategories.map((sub) => (
            <li key={sub.id}>
              <Link
                href={`/${categorySlug}/${sub.slug}`}
                className="group block overflow-hidden rounded-xl border-3 border-border transition-colors hover:border-brand/40 bg-muted"
              >
                <div className="relative aspect-square w-full overflow-hidden">
                  {sub.cover_image_url ? (
                    <Image
                      src={sub.cover_image_url}
                      alt=""
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20"
                      aria-hidden
                    />
                  )}
                </div>
                <p className="px-2 py-3 text-center text-sm font-semibold leading-snug text-foreground">
                  {sub.name}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
