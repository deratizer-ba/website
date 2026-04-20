import Image from "next/image"
import Link from "next/link"
import type { Category, Subcategory } from "@/lib/types"

type Cat = Category & { subcategories: Subcategory[] }

type Props = {
  categories: Cat[]
}

function CategoryIcon({ svg }: { svg: string | null }) {
  if (!svg?.trim()) return null

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center text-brand [&_svg]:h-7 [&_svg]:w-7 [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:text-brand [&_svg_path:not([fill=none])]:fill-brand [&_svg_circle:not([fill=none])]:fill-brand [&_svg_rect:not([fill=none])]:fill-brand [&_svg_polygon:not([fill=none])]:fill-brand [&_svg_polyline:not([fill=none])]:fill-brand"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

function sortSubs(cat: Cat) {
  return [...(cat.subcategories ?? [])].sort(
    (a, b) => a.display_order - b.display_order
  )
}

export function HomeTopCategories({ categories }: Props) {
  if (categories.length === 0) return null

  const firstThree = categories.slice(0, 3)
  const fourth = categories[3]
  const fourthSubs = fourth ? sortSubs(fourth) : []

  return (
    <section className="border-border bg-white pb-16 text-foreground dark:bg-background">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {firstThree.map((cat) => {
            const subs = sortSubs(cat)

            return (
              <div key={cat.id} className="min-w-0">
                <Link
                  href={`/${cat.slug}`}
                  className="group flex items-center gap-3 rounded-lg outline-offset-4 transition-opacity hover:opacity-80"
                >
                  <CategoryIcon svg={cat.icon_svg} />
                  <h2 className="text-lg font-bold leading-snug tracking-tight md:text-xl">
                    {cat.name}
                  </h2>
                </Link>

                {subs.length > 0 ? (
                  <ul className="mt-5 space-y-1 border-t border-border pt-5">
                    {subs.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          href={`/${cat.slug}/${sub.slug}`}
                          className="flex items-center gap-3 rounded-lg py-1.5 px-1.5 transition-colors hover:bg-muted"
                        >
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border">
                            {sub.cover_image_url ? (
                              <Image
                                src={sub.cover_image_url}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="36px"
                              />
                            ) : null}
                          </div>
                          <span className="text-sm font-medium leading-snug text-foreground">
                            {sub.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )
          })}
        </div>

        {fourth ? (
          <div className="mt-12 border-t border-border pt-10 lg:mt-14 lg:pt-12">
            <Link
              href={`/${fourth.slug}`}
              className="inline-flex items-center gap-3 rounded-lg transition-opacity hover:opacity-80"
            >
              <CategoryIcon svg={fourth.icon_svg} />
              <h2 className="text-xl font-bold tracking-tight md:text-2xl">
                {fourth.name}
              </h2>
            </Link>

            {fourthSubs.length > 0 ? (
              <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
                {fourthSubs.map((sub) => (
                  <li key={sub.id}>
                    <Link
                      href={`/${fourth.slug}/${sub.slug}`}
                      className="group block overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-brand/40 hover:bg-muted/40"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                        {sub.cover_image_url ? (
                          <Image
                            src={sub.cover_image_url}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
            ) : (
              <Link
                href={`/${fourth.slug}`}
                className="mt-6 block max-w-xs overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-brand/40"
              >
                <div className="relative aspect-[4/3] w-full bg-muted">
                  {fourth.cover_image_url ? (
                    <Image
                      src={fourth.cover_image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20"
                      aria-hidden
                    />
                  )}
                </div>
                <p className="px-3 py-3 text-center text-sm font-semibold">
                  {fourth.name}
                </p>
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </section>
  )
}
