"use client"

import { ContentStructureSubcategoriesRail } from "./subcategories-rail"

export function CategoryContentWorkspace({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row -mx-6 -mt-6 lg:-mx-8 lg:-mt-8 mb-0">
      <ContentStructureSubcategoriesRail />
      <div className="min-w-0 flex-1 p-6 lg:p-8">{children}</div>
    </div>
  )
}
