"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { adminKomponentTypPath } from "@/lib/admin/komponenty-paths"
import { CONTENT_BLOCK_LABELS, KOMPONENT_CATALOG_TYPES } from "@/lib/content-blocks"
import type { SubBlockType } from "@/lib/types"

function blockTypeFromPath(pathname: string): SubBlockType | null {
  const m = pathname.match(/^\/admin\/komponenty\/typ\/([^/]+)$/)
  const seg = m?.[1]
  if (!seg) return null
  return (KOMPONENT_CATALOG_TYPES as readonly string[]).includes(seg)
    ? (seg as SubBlockType)
    : null
}

export function ComponentKitRail() {
  const pathname = usePathname() ?? ""
  const activeType = blockTypeFromPath(pathname)

  return (
    <aside className="w-full shrink-0 border-b bg-card lg:w-64 lg:border-b-0 lg:border-r flex flex-col max-h-[45vh] lg:max-h-none lg:min-h-[calc(100vh-3rem)]">
      <div className="px-3 py-2.5 border-b">
        <h2 className="text-sm font-semibold text-foreground">Komponenty</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-2">
          {KOMPONENT_CATALOG_TYPES.map((type) => {
            const isActive = activeType === type
            return (
              <li key={type}>
                <Link
                  href={adminKomponentTypPath(type)}
                  className={cn(
                    "block rounded-lg border bg-card px-3 py-2.5 text-sm font-semibold leading-tight shadow-sm transition-colors",
                    isActive
                      ? "ring-2 ring-ring border-transparent"
                      : "hover:bg-muted/40"
                  )}
                >
                  {CONTENT_BLOCK_LABELS[type]}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
