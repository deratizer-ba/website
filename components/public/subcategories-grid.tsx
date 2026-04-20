import Link from "next/link"
import type { Subcategory } from "@/lib/types"

type Props = {
  subcategories: Subcategory[]
  categorySlug: string
}

export function SubcategoriesGrid({ subcategories, categorySlug }: Props) {
  if (subcategories.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight">
        Podkategórie
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subcategories.map((sub) => (
          <Link
            key={sub.id}
            href={`/${categorySlug}/${sub.slug}`}
            className="group relative overflow-hidden rounded-xl aspect-[4/3] block ring-1 ring-border"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage: sub.cover_image_url
                  ? `url(${sub.cover_image_url})`
                  : undefined,
              }}
            />
            {!sub.cover_image_url && (
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-xl font-bold text-white">{sub.name}</h3>
              {sub.description && (
                <p className="text-white/70 text-sm mt-1 line-clamp-2">
                  {sub.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
