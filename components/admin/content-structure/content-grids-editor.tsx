"use client"

import { useMemo } from "react"
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
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { ContentBlockBody } from "@/components/content-blocks/content-block-body"
import { useContentStructure } from "./context"
import type { ContentBlock } from "@/lib/types"
import {
  GRID_LAYOUT_LABELS,
  adminEditorGridColsClass,
  getGridHasBackground,
  getGridLayout,
  gridBackgroundClass,
  gridLayoutCellCount,
  groupChildBlocksByParent,
  isRootGridBlock,
  sortChildBlocks,
} from "@/lib/content-blocks"
import { GripVertical, Loader2, Pencil, Plus, Trash2 } from "lucide-react"

type PageScope =
  | { kind: "category"; id: string }
  | { kind: "subcategory"; id: string }

function blocksOnPage(blocks: ContentBlock[], scope: PageScope): ContentBlock[] {
  if (scope.kind === "category") {
    return blocks.filter(
      (b) =>
        b.category_id === scope.id &&
        !b.subcategory_id
    )
  }
  return blocks.filter((b) => b.subcategory_id === scope.id)
}

function SortableGridRow({
  grid,
  children,
  onAddSub,
  onEditSub,
  onRemoveGrid,
  onSetGridBackground,
}: {
  grid: ContentBlock
  children: ContentBlock[]
  onAddSub: (cellIndex: number) => void
  onEditSub: (b: ContentBlock) => void
  onRemoveGrid: (id: string) => void
  onSetGridBackground: (grid: ContentBlock, enabled: boolean) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: grid.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const layout = getGridLayout(grid)
  const n = layout ? gridLayoutCellCount(layout) : 0
  const sorted = sortChildBlocks(children)
  const byCell = new Map<number, ContentBlock[]>()
  for (let i = 0; i < n; i++) byCell.set(i, [])
  for (const c of sorted) {
    if (c.cell_index >= 0 && c.cell_index < n) {
      byCell.get(c.cell_index)!.push(c)
    }
  }

  const gridHasContent = children.length > 0
  const hasBackground = getGridHasBackground(grid)

  return (
    <li ref={setNodeRef} style={style} className="list-none">
      <div
        className={cn(
          "rounded-lg border border-border overflow-hidden flex flex-col",
          isDragging && "opacity-60"
        )}
      >
        <div className="flex items-center gap-1 px-2 py-1.5 shrink-0">
          <button
            type="button"
            className={cn(
              "shrink-0 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground",
              "cursor-grab active:cursor-grabbing touch-none hover:text-foreground"
            )}
            aria-label="Presunúť grid"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground truncate pl-1">
            Grid · {layout ? GRID_LAYOUT_LABELS[layout] : "?"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Label
              htmlFor={`grid-bg-${grid.id}`}
              className="text-xs text-muted-foreground"
            >
              Pozadie
            </Label>
            <Switch
              id={`grid-bg-${grid.id}`}
              size="sm"
              checked={hasBackground}
              onCheckedChange={onSetGridBackground.bind(null, grid)}
            />
          </div>
          {!gridHasContent ? (
            <div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onRemoveGrid(grid.id)}
                aria-label="Zmazať prázdny grid"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>

        {layout && n > 0 ? (
          <div
            className={cn(
              "grid gap-4 p-3 pt-0",
              gridBackgroundClass(hasBackground),
              adminEditorGridColsClass(layout)
            )}
          >
            {Array.from({ length: n }, (_, cellIndex) => {
              const cellBlocks = byCell.get(cellIndex) ?? []
              return (
                <div
                  key={cellIndex}
                  className="min-w-0 min-h-[100px] flex flex-col"
                >
                  {cellBlocks.length === 0 ? (
                    <button
                      type="button"
                      className={cn(
                        "flex-1 flex items-center justify-center w-full min-h-[120px] rounded-md",
                        "text-muted-foreground hover:text-foreground transition-colors"
                      )}
                      onClick={() => onAddSub(cellIndex)}
                    >
                      <Plus className="h-8 w-8 stroke-[1.5]" aria-hidden />
                      <span className="sr-only">Pridať obsah do bunky</span>
                    </button>
                  ) : (
                    <div className="flex flex-col gap-4 flex-1">
                      {cellBlocks.map((sub) => (
                        <div key={sub.id} className="relative pt-0 pr-8 min-w-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => onEditSub(sub)}
                            aria-label="Upraviť blok"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <div className="text-sm min-w-0 [overflow-wrap:anywhere] pr-1">
                            <ContentBlockBody block={sub} />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className={cn(
                          "mx-auto flex h-9 w-9 items-center justify-center rounded-md",
                          "text-muted-foreground hover:text-foreground transition-colors"
                        )}
                        onClick={() => onAddSub(cellIndex)}
                        aria-label="Pridať ďalší blok do bunky"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground px-3 pb-3">
            Neplatné rozloženie gridu.
          </p>
        )}
      </div>
    </li>
  )
}

export function ContentGridsEditor({ scope }: { scope: PageScope }) {
  const {
    loading,
    contentBlocks,
    openCreateGrid,
    openAddSubBlock,
    openEditBlock,
    removeBlock,
    reorderGrids,
    setGridBackground,
  } = useContentStructure()

  const pageBlocks = useMemo(
    () => blocksOnPage(contentBlocks, scope),
    [contentBlocks, scope]
  )

  const roots = useMemo(() => {
    const r = pageBlocks.filter(isRootGridBlock)
    r.sort((a, b) => {
      const o = a.display_order - b.display_order
      return o !== 0 ? o : a.id.localeCompare(b.id)
    })
    return r
  }, [pageBlocks])

  const byParent = useMemo(() => groupChildBlocksByParent(pageBlocks), [pageBlocks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = roots.map((g) => g.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(ids, oldIndex, newIndex)
    const parent: { type: "category" | "subcategory"; id: string } =
      scope.kind === "category"
        ? { type: "category", id: scope.id }
        : { type: "subcategory", id: scope.id }
    void reorderGrids(parent, next)
  }

  const blockParent: { type: "category" | "subcategory"; id: string } =
    scope.kind === "category"
      ? { type: "category", id: scope.id }
      : { type: "subcategory", id: scope.id }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-foreground -ml-2"
        onClick={() => openCreateGrid(blockParent)}
      >
        <Plus className="mr-2 h-3.5 w-3.5" />
        Nový grid
      </Button>

      {roots.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Zatiaľ žiadny grid. Pridajte prvý cez „Nový grid“.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={roots.map((g) => g.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-4">
              {roots.map((grid) => (
                <SortableGridRow
                  key={grid.id}
                  grid={grid}
                  children={byParent.get(grid.id) ?? []}
                  onAddSub={(cell) => openAddSubBlock(grid.id, cell)}
                  onEditSub={openEditBlock}
                  onRemoveGrid={removeBlock}
                  onSetGridBackground={(block, enabled) => {
                    void setGridBackground(block, enabled)
                  }}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
