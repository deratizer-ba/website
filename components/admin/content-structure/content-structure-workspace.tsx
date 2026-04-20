"use client"

import { usePathname } from "next/navigation"
import { ContentStructureCategoriesRail } from "./categories-rail"

export function ContentStructureWorkspace({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isGlobalBlocksRoute = pathname.startsWith("/admin/content/globalne-bloky")

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col lg:flex-row -mx-6 -mt-6 lg:-mx-8 lg:-mt-8 mb-0">
      {!isGlobalBlocksRoute ? <ContentStructureCategoriesRail /> : null}
      <div className="min-w-0 flex-1 p-6 lg:p-8">{children}</div>
    </div>
  )
}
