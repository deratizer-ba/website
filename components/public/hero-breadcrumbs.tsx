import Link from "next/link"
import { ChevronRight } from "lucide-react"

export type HeroBreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  items: HeroBreadcrumbItem[]
}

export function HeroBreadcrumbs({ items }: Props) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Navigácia stránky" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-white/75">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight className="size-3.5 shrink-0 opacity-70" aria-hidden />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "text-white/90" : undefined}
                  {...(isLast ? { "aria-current": "page" as const } : {})}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
