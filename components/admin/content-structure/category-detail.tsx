"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { useContentStructure } from "./context"
import { routeSegment } from "./route-params"
import { ADMIN_CONTENT_BASE } from "@/lib/admin/content-paths"
import { cn } from "@/lib/utils"
import { ContentGridsEditor } from "./content-grids-editor"
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react"

type Props = {
  categoryId: string
}

export function ContentStructureCategoryDetail({ categoryId }: Props) {
  const router = useRouter()
  const {
    loading,
    getCategory,
    categoryIdsWithBlocks,
    openEditCategory,
    removeCategory,
  } = useContentStructure()

  const cat = getCategory(categoryId)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!cat) {
    return (
      <div className="space-y-4">
        <Link
          href={ADMIN_CONTENT_BASE}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Späť na kategórie
        </Link>
        <p className="text-muted-foreground">Kategória sa nenašla.</p>
      </div>
    )
  }

  async function handleDeleteCategory() {
    if (!cat) return
    const ok = await removeCategory(cat.id)
    if (ok) router.push(ADMIN_CONTENT_BASE)
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{cat.name}</h1>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditCategory(cat)}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Upraviť kategóriu
            </Button>
            {!categoryIdsWithBlocks.has(cat.id) ? (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleDeleteCategory}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Zmazať kategóriu
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <section>
        <ContentGridsEditor scope={{ kind: "category", id: categoryId }} />
      </section>
    </div>
  )
}

export function ContentStructureCategoryDetailPage() {
  const params = useParams()
  const categoryId = routeSegment(params.categoryId)
  return <ContentStructureCategoryDetail categoryId={categoryId} />
}
