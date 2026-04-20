"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import {
  adminCategoryPath,
  adminSubcategoryPath,
} from "@/lib/admin/content-paths"
import { useContentStructure } from "./context"
import { routeSegment } from "./route-params"
import type { Subcategory } from "@/lib/types"
import { Home, Loader2, Menu, Plus } from "lucide-react"

function isCategoryIntroPath(pathname: string, categoryId: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || pathname
  return normalized === `/admin/content/category/${categoryId}`
}

function activeSubcategoryIdFromPath(
  pathname: string,
  categoryId: string
): string | null {
  const prefix = `/admin/content/category/${categoryId}/subcategory/`
  if (!pathname.startsWith(prefix)) return null
  const rest = pathname.slice(prefix.length).split("/")[0]
  return rest || null
}

function SortableSubcategoryItem({
  sub,
  categoryId,
  isActive,
}: {
  sub: Subcategory
  categoryId: string
  isActive: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sub.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li ref={setNodeRef} style={style}>
      <div
        className={cn(
          "flex items-stretch rounded-lg border bg-card shadow-sm overflow-hidden transition-colors",
          isActive && "ring-2 ring-ring border-transparent",
          isDragging && "opacity-60 shadow-md z-10"
        )}
      >
        <button
          type="button"
          className={cn(
            "shrink-0 flex w-8 items-center justify-center text-muted-foreground",
            "cursor-grab active:cursor-grabbing touch-none hover:text-foreground"
          )}
          aria-label="Presunúť v zozname"
          {...attributes}
          {...listeners}
        >
          <Menu className="h-4 w-4" />
        </button>
        <Link
          href={adminSubcategoryPath(categoryId, sub.id)}
          className="flex min-w-0 flex-1 items-center px-2 py-2.5 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <span className="font-semibold leading-tight">{sub.name}</span>
        </Link>
      </div>
    </li>
  )
}

export function ContentStructureSubcategoriesRail() {
  const pathname = usePathname() ?? ""
  const params = useParams()
  const categoryId = routeSegment(params.categoryId)

  const {
    loading,
    getCategory,
    subsByCategory,
    openCreateSubcategory,
    reorderSubcategories,
  } = useContentStructure()

  const cat = categoryId ? getCategory(categoryId) : undefined
  const subs = categoryId ? (subsByCategory.get(categoryId) ?? []) : []

  const introActive =
    categoryId !== "" && isCategoryIntroPath(pathname, categoryId)
  const activeSubId = categoryId
    ? activeSubcategoryIdFromPath(pathname, categoryId)
    : null

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    if (!categoryId) return
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = subs.map((s) => s.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(ids, oldIndex, newIndex)
    void reorderSubcategories(categoryId, next)
  }

  if (!categoryId) {
    return null
  }

  if (!loading && !cat) {
    return null
  }

  return (
    <aside className="w-full shrink-0 border-b bg-card lg:w-56 lg:border-b-0 lg:border-r flex flex-col max-h-[45vh] lg:max-h-none lg:min-h-[calc(100vh-3rem)]">
      <div className="px-3 py-2.5 border-b">
        <h2 className="text-sm font-semibold text-foreground">Stránky</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <Link
          href={adminCategoryPath(categoryId)}
          className={cn(
            "flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 shadow-sm transition-colors",
            "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            introActive && "ring-2 ring-ring border-transparent"
          )}
        >
          <Home className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-semibold text-left leading-tight">
            Úvodná stránka
          </span>
        </Link>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : subs.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1 py-1">
            Zatiaľ žiadne podstránky. Pridajte cez tlačidlo nižšie.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={subs.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {subs.map((sub) => (
                  <SortableSubcategoryItem
                    key={sub.id}
                    sub={sub}
                    categoryId={categoryId}
                    isActive={activeSubId === sub.id}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}

        <button
          type="button"
          onClick={() => openCreateSubcategory(categoryId)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg border border-dashed bg-card px-3 py-2.5 shadow-sm",
            "text-left transition-colors hover:bg-muted/40 hover:border-muted-foreground/30",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-semibold text-sm">Nová podstránka</span>
        </button>
      </div>
    </aside>
  )
}
