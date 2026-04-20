"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { useContentStructure } from "./context"
import { routeSegment } from "./route-params"
import { ADMIN_CONTENT_BASE, adminCategoryPath } from "@/lib/admin/content-paths"
import { cn } from "@/lib/utils"
import { ContentGridsEditor } from "./content-grids-editor"
import { isRootGridBlock } from "@/lib/content-blocks"
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react"

type Props = {
  categoryId: string
  subcategoryId: string
}

export function ContentStructureSubcategoryDetail({
  categoryId,
  subcategoryId,
}: Props) {
  const router = useRouter()
  const {
    loading,
    getCategory,
    getSubcategory,
    contentBlocks,
    openEditSubcategory,
    removeSubcategory,
  } = useContentStructure()

  const cat = getCategory(categoryId)
  const sub = getSubcategory(subcategoryId)
  const valid =
    sub && sub.category_id === categoryId ? sub : undefined

  const rootGridCount = useMemo(() => {
    return contentBlocks.filter(
      (b) =>
        b.subcategory_id === subcategoryId &&
        isRootGridBlock(b)
    ).length
  }, [contentBlocks, subcategoryId])

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

  if (!valid) {
    return (
      <div className="space-y-4">
        <Link
          href={adminCategoryPath(categoryId)}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Späť na {cat.name}
        </Link>
        <p className="text-muted-foreground">Podkategória sa nenašla.</p>
      </div>
    )
  }

  async function handleDeleteSub() {
    if (!valid) return
    const ok = await removeSubcategory(valid.id)
    if (ok) router.push(adminCategoryPath(categoryId))
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{cat.name}</p>
            <h1 className="text-2xl font-bold">{valid.name}</h1>
            {valid.description ? (
              <p className="text-muted-foreground mt-3 max-w-2xl">
                {valid.description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditSubcategory(valid)}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Upraviť podstránku
            </Button>
            {rootGridCount === 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleDeleteSub}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Zmazať podstránku
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <section>
        <ContentGridsEditor scope={{ kind: "subcategory", id: subcategoryId }} />
      </section>
    </div>
  )
}

export function ContentStructureSubcategoryDetailPage() {
  const params = useParams()
  const categoryId = routeSegment(params.categoryId)
  const subcategoryId = routeSegment(params.subcategoryId)
  return (
    <ContentStructureSubcategoryDetail
      categoryId={categoryId}
      subcategoryId={subcategoryId}
    />
  )
}
