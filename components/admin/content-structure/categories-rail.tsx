"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { adminCategoryPath } from "@/lib/admin/content-paths"
import { useContentStructure } from "./context"
import type { Category } from "@/lib/types"
import { Loader2, Menu, Plus } from "lucide-react"

function categoryIdFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/admin\/content\/category\/([^/]+)/)
  return m?.[1] ?? null
}

function SortableCategoryItem({
  cat,
  isActive,
}: {
  cat: Category
  isActive: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.id })

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
          href={adminCategoryPath(cat.id)}
          className="flex min-w-0 flex-1 items-center px-2 py-2.5 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <span className="font-semibold leading-tight">{cat.name}</span>
        </Link>
      </div>
    </li>
  )
}

export function ContentStructureCategoriesRail() {
  const pathname = usePathname()
  const activeCategoryId = categoryIdFromPath(pathname ?? "")
  const {
    loading,
    categories,
    openCreateCategory,
    reorderCategories,
  } = useContentStructure()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = categories.map((c) => c.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(ids, oldIndex, newIndex)
    void reorderCategories(next)
  }

  return (
    <aside className="w-full shrink-0 border-b bg-card lg:w-64 lg:border-b-0 lg:border-r flex flex-col max-h-[50vh] lg:max-h-none lg:min-h-[calc(100vh-3rem)]">
      <div className="px-3 py-2.5 border-b">
        <h2 className="text-sm font-semibold text-foreground">Kategórie</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground px-1 py-2">
            Zatiaľ žiadne kategórie. Pridajte prvú cez tlačidlo nižšie.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <SortableCategoryItem
                    key={cat.id}
                    cat={cat}
                    isActive={activeCategoryId === cat.id}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}

        <button
          type="button"
          onClick={openCreateCategory}
          className={cn(
            "mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed bg-card px-3 py-2.5 shadow-sm",
            "text-left transition-colors hover:bg-muted/40 hover:border-muted-foreground/30",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-semibold text-sm">Nová kategória</span>
        </button>
      </div>
    </aside>
  )
}
