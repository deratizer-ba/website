import { Suspense } from "react"
import { ContentStructureCategoryDetailPage } from "@/components/admin/content-structure/category-detail"

function CategoryDetailFallback() {
  return (
    <div
      className="flex items-center justify-center py-12"
      aria-busy
      aria-label="Načítavam"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  )
}

export default function AdminContentCategoryPage() {
  return (
    <Suspense fallback={<CategoryDetailFallback />}>
      <ContentStructureCategoryDetailPage />
    </Suspense>
  )
}
