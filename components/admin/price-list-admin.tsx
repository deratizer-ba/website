"use client"

import { useEffect, useMemo, useState } from "react"
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
import { createClient } from "@/lib/supabase/client"
import {
  createPriceListItem,
  deletePriceListItem,
  reorderPriceListItems,
  updatePriceListItem,
} from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { buildPriceListSections } from "@/lib/price-list"
import { cn } from "@/lib/utils"
import type { Category, PriceListItem, Subcategory } from "@/lib/types"
import {
  Check,
  Loader2,
  Menu,
  Pencil,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

type Scope = {
  categoryId?: string
  subcategoryId?: string
}

type Draft = {
  name: string
  price: string
  imageUrl: string
}

const EMPTY_DRAFT: Draft = {
  name: "",
  price: "",
  imageUrl: "",
}

function buildScopeKey(scope: Scope) {
  return scope.subcategoryId
    ? `subcategory:${scope.subcategoryId}`
    : `category:${scope.categoryId}`
}

function buildScopeFormData(scope: Scope) {
  const formData = new FormData()
  formData.set("category_id", scope.categoryId ?? "")
  formData.set("subcategory_id", scope.subcategoryId ?? "")
  return formData
}

function buildItemFormData(scope: Scope, draft: Draft) {
  const formData = buildScopeFormData(scope)
  formData.set("name", draft.name)
  formData.set("price", draft.price)
  formData.set("image_url", draft.imageUrl)
  return formData
}

function sortItems(items: PriceListItem[]) {
  return [...items].sort((a, b) => a.display_order - b.display_order)
}

function SortablePriceListRow({
  item,
  scope,
  onSave,
  onDelete,
}: {
  item: PriceListItem
  scope: Scope
  onSave: (id: string, scope: Scope, draft: Draft) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<Draft>({
    name: item.name,
    price: item.price ?? "",
    imageUrl: item.image_url ?? "",
  })

  useEffect(() => {
    setDraft({
      name: item.name,
      price: item.price ?? "",
      imageUrl: item.image_url ?? "",
    })
  }, [item.id, item.image_url, item.name, item.price])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(item.id, scope, draft)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "flex items-start gap-2 rounded-xl border bg-background px-3 py-3",
          isDragging && "opacity-70 shadow-md"
        )}
      >
        <button
          type="button"
          className="mt-1 shrink-0 cursor-grab rounded-md p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Presunúť riadok"
          {...attributes}
          {...listeners}
        >
          <Menu className="h-4 w-4" />
        </button>

        {editing ? (
          <div className="grid min-w-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.5fr)_180px_auto]">
            <Input
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Názov produktu"
            />
            <Input
              value={draft.price}
              onChange={(event) =>
                setDraft((current) => ({ ...current, price: event.target.value }))
              }
              placeholder="Cena"
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Uložiť
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraft({
                    name: item.name,
                    price: item.price ?? "",
                    imageUrl: item.image_url ?? "",
                  })
                  setEditing(false)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.name}</p>
            </div>
            {item.price?.trim() ? (
              <p className="shrink-0 font-semibold whitespace-nowrap">{item.price}</p>
            ) : null}
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={() => void onDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PriceListScopeEditor({
  title,
  subtitle,
  scope,
  items,
  onCreate,
  onSave,
  onDelete,
  onReorder,
}: {
  title: string
  subtitle?: string
  scope: Scope
  items: PriceListItem[]
  onCreate: (scope: Scope, draft: Draft) => Promise<void>
  onSave: (id: string, scope: Scope, draft: Draft) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onReorder: (scope: Scope, orderedIds: string[]) => Promise<void>
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [saving, setSaving] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  async function handleCreate() {
    setSaving(true)
    try {
      await onCreate(scope, draft)
      setDraft(EMPTY_DRAFT)
    } finally {
      setSaving(false)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const ids = items.map((item) => item.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return

    const nextIds = arrayMove(ids, oldIndex, newIndex)
    void onReorder(scope, nextIds)
  }

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <div className="space-y-4 p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_180px_auto]">
          <Input
            value={draft.name}
            onChange={(event) =>
              setDraft((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Produkt alebo služba"
          />
          <Input
            value={draft.price}
            onChange={(event) =>
              setDraft((current) => ({ ...current, price: event.target.value }))
            }
            placeholder="Cena (voliteľné)"
          />
          <Button type="button" onClick={() => void handleCreate()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Uložiť
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
            Zatiaľ tu nie sú žiadne riadky. Text riadku môžete doplniť hneď vyššie; cena
            je voliteľná.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {items.map((item) => (
                  <SortablePriceListRow
                    key={item.id}
                    item={item}
                    scope={scope}
                    onSave={onSave}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}

export function PriceListAdmin() {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [items, setItems] = useState<PriceListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const supabase = createClient()
        const [categoriesRes, subcategoriesRes, itemsRes] = await Promise.all([
          supabase.from("categories").select("*").order("display_order"),
          supabase.from("subcategories").select("*").order("display_order"),
          supabase.from("price_list_items").select("*").order("display_order"),
        ])

        if (categoriesRes.error) throw categoriesRes.error
        if (subcategoriesRes.error) throw subcategoriesRes.error
        if (itemsRes.error) throw itemsRes.error

        setCategories((categoriesRes.data as Category[]) ?? [])
        setSubcategories((subcategoriesRes.data as Subcategory[]) ?? [])
        setItems(sortItems((itemsRes.data as PriceListItem[]) ?? []))
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Načítanie cenníka zlyhalo"
        )
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const sections = useMemo(
    () => buildPriceListSections(categories, subcategories, items, { includeEmpty: true }),
    [categories, subcategories, items]
  )

  async function handleCreate(scope: Scope, draft: Draft) {
    try {
      const inserted = await createPriceListItem(buildItemFormData(scope, draft))
      setItems((current) => sortItems([...current, inserted]))
      toast.success("Riadok sa objavil v cenníku")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Pridanie riadku zlyhalo"
      )
      throw error
    }
  }

  async function handleSave(id: string, scope: Scope, draft: Draft) {
    try {
      const updated = await updatePriceListItem(id, buildItemFormData(scope, draft))
      setItems((current) =>
        current.map((item) => (item.id === id ? updated : item))
      )
      toast.success("Riadok bol upravený")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Úprava riadku zlyhala"
      )
      throw error
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Naozaj chcete odstrániť tento riadok cenníka?")) return

    try {
      await deletePriceListItem(id)
      setItems((current) => current.filter((item) => item.id !== id))
      toast.success("Riadok bol odstránený")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Odstránenie riadku zlyhalo"
      )
    }
  }

  async function handleReorder(scope: Scope, orderedIds: string[]) {
    const scopeKey = buildScopeKey(scope)
    const previousItems = items
    const scopeItems = items.filter((item) =>
      scope.subcategoryId
        ? item.subcategory_id === scope.subcategoryId
        : item.category_id === scope.categoryId && item.subcategory_id === null
    )
    const movedItems = orderedIds
      .map((id, index) => {
        const item = scopeItems.find((current) => current.id === id)
        return item ? { ...item, display_order: index } : null
      })
      .filter((item): item is PriceListItem => Boolean(item))

    setItems((current) => {
      const replaced = current.filter((item) =>
        scope.subcategoryId
          ? item.subcategory_id !== scope.subcategoryId
          : item.category_id !== scope.categoryId || item.subcategory_id !== null
      )
      return sortItems([...replaced, ...movedItems])
    })

    try {
      const formData = buildScopeFormData(scope)
      formData.set("ordered_ids", JSON.stringify(orderedIds))
      await reorderPriceListItems(formData)
    } catch (error) {
      setItems(previousItems)
      toast.error(
        error instanceof Error
          ? `${error.message} (${scopeKey})`
          : "Presun riadkov zlyhal"
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cenník</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kategórie a podkategórie sú prevzaté z existujúceho obsahu. Riadky môžete
          pridávať priamo na stránke, upravovať ceruzkou a meniť poradie myšou.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.category.id} className="space-y-4">
            <PriceListScopeEditor
              title={section.category.name}
              subtitle="Riadky priamo pod hlavnou kategóriou"
              scope={{ categoryId: section.category.id }}
              items={section.items}
              onCreate={handleCreate}
              onSave={handleSave}
              onDelete={handleDelete}
              onReorder={handleReorder}
            />

            {section.subcategories.length > 0 ? (
              <div className="space-y-4 pl-0 lg:pl-8">
                {section.subcategories.map(({ subcategory, items: subItems }) => (
                  <PriceListScopeEditor
                    key={subcategory.id}
                    title={subcategory.name}
                    subtitle={`Podkategória v ${section.category.name}`}
                    scope={{ subcategoryId: subcategory.id }}
                    items={subItems}
                    onCreate={handleCreate}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onReorder={handleReorder}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
