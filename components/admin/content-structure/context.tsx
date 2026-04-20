"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUpload } from "@/components/admin/image-upload"
import { BlockTypeRadioPicker } from "@/components/admin/content-structure/block-type-radio-picker"
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories as reorderCategoriesAction,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  reorderSubcategories as reorderSubcategoriesAction,
  createContentBlock,
  updateContentBlock,
  deleteContentBlock,
  reorderContentGrids,
} from "@/lib/actions/admin"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type {
  Category,
  ContentBlock,
  GridLayoutId,
  SubBlockType,
  Subcategory,
} from "@/lib/types"
import {
  buildContentBlockData,
  CONTENT_BLOCK_LABELS,
  GRID_LAYOUT_IDS,
  GRID_LAYOUT_LABELS,
  getHeadingData,
  getHeadingTextImageRightData,
  getGridHasBackground,
  getIconHeadingTextData,
  getImageHeadingTextCenteredData,
  getMediaLeftTextRightData,
  getTextBlockData,
  SUB_BLOCK_TYPES,
  validateContentBlockPayload,
  validateGridPayload,
} from "@/lib/content-blocks"

type BlockParent = { type: "category" | "subcategory"; id: string }

function isSubBlockType(v: string): v is SubBlockType {
  return (SUB_BLOCK_TYPES as readonly string[]).includes(v)
}

type ContentStructureContextValue = {
  loading: boolean
  categories: Category[]
  subcategories: Subcategory[]
  contentBlocks: ContentBlock[]
  loadData: () => Promise<void>
  subsByCategory: Map<string, Subcategory[]>
  categoryBlocks: Map<string, ContentBlock[]>
  subcategoryBlocks: Map<string, ContentBlock[]>
  categoryIdsWithBlocks: Set<string>
  getCategory: (id: string) => Category | undefined
  getSubcategory: (id: string) => Subcategory | undefined
  openCreateCategory: () => void
  openEditCategory: (cat: Category) => void
  removeCategory: (id: string) => Promise<boolean>
  reorderCategories: (orderedIds: string[]) => Promise<void>
  openCreateSubcategory: (categoryId: string) => void
  openEditSubcategory: (sub: Subcategory) => void
  removeSubcategory: (id: string) => Promise<boolean>
  reorderSubcategories: (
    categoryId: string,
    orderedIds: string[]
  ) => Promise<void>
  openCreateGrid: (parent: BlockParent) => void
  openAddSubBlock: (gridId: string, cellIndex: number) => void
  reorderGrids: (parent: BlockParent, orderedRootIds: string[]) => Promise<void>
  setGridBackground: (grid: ContentBlock, enabled: boolean) => Promise<void>
  openEditBlock: (block: ContentBlock) => void
  removeBlock: (id: string) => Promise<void>
}

const ContentStructureContext =
  createContext<ContentStructureContextValue | null>(null)

export function useContentStructure() {
  const ctx = useContext(ContentStructureContext)
  if (!ctx) {
    throw new Error(
      "useContentStructure must be used within ContentStructureProvider"
    )
  }
  return ctx
}

export function ContentStructureProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [catName, setCatName] = useState("")
  const [catDescription, setCatDescription] = useState("")
  const [catCover, setCatCover] = useState("")
  const [catIconSvg, setCatIconSvg] = useState("")

  const [subDialogOpen, setSubDialogOpen] = useState(false)
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null)
  const [subCategoryId, setSubCategoryId] = useState("")
  const [subName, setSubName] = useState("")
  const [subDescription, setSubDescription] = useState("")
  const [subCover, setSubCover] = useState("")

  const [gridDialogOpen, setGridDialogOpen] = useState(false)
  const [gridDialogParent, setGridDialogParent] = useState<BlockParent | null>(
    null
  )
  const [newGridLayout, setNewGridLayout] = useState<GridLayoutId>("2")
  const [newGridHasBackground, setNewGridHasBackground] = useState(false)

  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [blockDialogStep, setBlockDialogStep] = useState<"type" | "form">("type")
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null)
  const [subBlockTarget, setSubBlockTarget] = useState<{
    gridId: string
    cellIndex: number
  } | null>(null)
  const [createBlockType, setCreateBlockType] =
    useState<SubBlockType>("text_block")
  const [blockTitle, setBlockTitle] = useState("")
  const [blockInnerHeading, setBlockInnerHeading] = useState("")
  const [blockBody, setBlockBody] = useState("")
  const [blockIconUrl, setBlockIconUrl] = useState("")
  const [blockImageUrl, setBlockImageUrl] = useState("")
  const [blockIconSize, setBlockIconSize] = useState("50")
  const [blockImageSize, setBlockImageSize] = useState("100")
  const [blockCtaLabel, setBlockCtaLabel] = useState("")
  const [blockCtaUrl, setBlockCtaUrl] = useState("")
  const [blockOrder, setBlockOrder] = useState("0")

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const [catsRes, subsRes, blocksRes] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("subcategories").select("*").order("display_order"),
      supabase.from("content_blocks").select("*").order("display_order"),
    ])
    setCategories((catsRes.data as Category[]) ?? [])
    setSubcategories((subsRes.data as Subcategory[]) ?? [])
    setContentBlocks((blocksRes.data as ContentBlock[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const subsByCategory = useMemo(() => {
    const m = new Map<string, Subcategory[]>()
    for (const s of subcategories) {
      const list = m.get(s.category_id) ?? []
      list.push(s)
      m.set(s.category_id, list)
    }
    for (const [, list] of m) {
      list.sort((a, b) => a.display_order - b.display_order)
    }
    return m
  }, [subcategories])

  const categoryBlocks = useMemo(() => {
    const m = new Map<string, ContentBlock[]>()
    for (const b of contentBlocks) {
      if (b.category_id && !b.subcategory_id) {
        const list = m.get(b.category_id) ?? []
        list.push(b)
        m.set(b.category_id, list)
      }
    }
    return m
  }, [contentBlocks])

  const subcategoryBlocks = useMemo(() => {
    const m = new Map<string, ContentBlock[]>()
    for (const b of contentBlocks) {
      if (b.subcategory_id) {
        const list = m.get(b.subcategory_id) ?? []
        list.push(b)
        m.set(b.subcategory_id, list)
      }
    }
    return m
  }, [contentBlocks])

  const categoryIdsWithBlocks = useMemo(() => {
    const ids = new Set<string>()
    const subById = new Map(subcategories.map((s) => [s.id, s]))
    for (const b of contentBlocks) {
      if (b.parent_id) continue
      if (b.category_id && !b.subcategory_id) {
        ids.add(b.category_id)
      }
      if (b.subcategory_id) {
        const sub = subById.get(b.subcategory_id)
        if (sub) ids.add(sub.category_id)
      }
    }
    return ids
  }, [contentBlocks, subcategories])

  const subDialogCategoryName = useMemo(
    () => categories.find((c) => c.id === subCategoryId)?.name,
    [categories, subCategoryId]
  )

  const subBlockDialogTitle = useMemo(() => {
    if (editingBlock) return "Upraviť podblok"
    if (subBlockTarget) {
      return `Nový podblok · Bunka ${subBlockTarget.cellIndex + 1}`
    }
    return "Podblok"
  }, [editingBlock, subBlockTarget])

  const editBlockPlacementLabel = useMemo(() => {
    if (!editingBlock) return ""
    if (editingBlock.subcategory_id) {
      const sub = subcategories.find(
        (s) => s.id === editingBlock.subcategory_id
      )
      const cat = sub
        ? categories.find((c) => c.id === sub.category_id)
        : undefined
      if (cat && sub) return `${cat.name} / ${sub.name}`
      return sub?.name ?? ""
    }
    if (editingBlock.category_id) {
      return (
        categories.find((c) => c.id === editingBlock.category_id)?.name ?? ""
      )
    }
    return ""
  }, [editingBlock, categories, subcategories])

  const effectiveSubBlockType: SubBlockType = editingBlock
    ? editingBlock.block_type === "heading" || editingBlock.block_type === "text_block"
      || editingBlock.block_type === "icon_heading_text"
      || editingBlock.block_type === "image_heading_text_centered"
      || editingBlock.block_type === "heading_text_image_right"
      || editingBlock.block_type === "media_left_text_right"
      ? editingBlock.block_type
      : "text_block"
    : createBlockType
  const showIconFields = effectiveSubBlockType === "icon_heading_text"
  const showImageFields =
    effectiveSubBlockType === "image_heading_text_centered" ||
    effectiveSubBlockType === "heading_text_image_right" ||
    effectiveSubBlockType === "media_left_text_right"

  function resetCatForm() {
    setEditingCat(null)
    setCatName("")
    setCatDescription("")
    setCatCover("")
    setCatIconSvg("")
  }

  function openCreateCategory() {
    resetCatForm()
    setCatDialogOpen(true)
  }

  function openEditCategory(cat: Category) {
    setEditingCat(cat)
    setCatName(cat.name)
    setCatDescription(cat.description ?? "")
    setCatCover(cat.cover_image_url ?? "")
    setCatIconSvg(cat.icon_svg ?? "")
    setCatDialogOpen(true)
  }

  async function saveCategory() {
    if (!catName.trim()) {
      toast.error("Zadajte názov kategórie")
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.set("name", catName)
      fd.set("description", catDescription)
      fd.set("cover_image_url", catCover)
      fd.set("icon_svg", catIconSvg)
      fd.set(
        "display_order",
        editingCat
          ? String(editingCat.display_order)
          : String(categories.length)
      )
      if (editingCat) {
        await updateCategory(editingCat.id, fd)
        toast.success("Kategória bola aktualizovaná")
      } else {
        await createCategory(fd)
        toast.success("Kategória bola vytvorená")
      }
      setCatDialogOpen(false)
      resetCatForm()
      await loadData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba pri ukladaní")
    } finally {
      setSaving(false)
    }
  }

  async function removeCategory(id: string): Promise<boolean> {
    if (!confirm("Naozaj chcete vymazať túto kategóriu?")) return false
    try {
      await deleteCategory(id)
      toast.success("Kategória bola vymazaná")
      await loadData()
      return true
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba pri mazaní")
      return false
    }
  }

  const reorderCategories = useCallback(async (orderedIds: string[]) => {
    let prevSnapshot: Category[] = []
    setCategories((prev) => {
      prevSnapshot = prev
      const idToIndex = new Map(orderedIds.map((id, i) => [id, i]))
      return [...prev]
        .sort(
          (a, b) => (idToIndex.get(a.id) ?? 0) - (idToIndex.get(b.id) ?? 0)
        )
        .map((c, i) => ({ ...c, display_order: i }))
    })
    try {
      await reorderCategoriesAction(orderedIds)
    } catch (e) {
      setCategories(prevSnapshot)
      toast.error(
        e instanceof Error ? e.message : "Nepodarilo sa uložiť poradie"
      )
    }
  }, [])

  function resetSubForm() {
    setEditingSub(null)
    setSubCategoryId("")
    setSubName("")
    setSubDescription("")
    setSubCover("")
  }

  function openCreateSubcategory(categoryId: string) {
    resetSubForm()
    setSubCategoryId(categoryId)
    setSubDialogOpen(true)
  }

  function openEditSubcategory(sub: Subcategory) {
    setEditingSub(sub)
    setSubCategoryId(sub.category_id)
    setSubName(sub.name)
    setSubDescription(sub.description ?? "")
    setSubCover(sub.cover_image_url ?? "")
    setSubDialogOpen(true)
  }

  async function saveSubcategory() {
    if (!subName.trim()) {
      toast.error("Zadajte názov")
      return
    }
    if (!editingSub && !subCategoryId) {
      toast.error("Chýba kategória")
      return
    }
    setSaving(true)
    try {
      const categoryIdForSave = editingSub
        ? editingSub.category_id
        : subCategoryId
      const displayOrderForSave = editingSub
        ? editingSub.display_order
        : subcategories.filter((s) => s.category_id === subCategoryId).length
      const fd = new FormData()
      fd.set("name", subName)
      fd.set("category_id", categoryIdForSave)
      fd.set("description", subDescription)
      fd.set("cover_image_url", subCover)
      fd.set("display_order", String(displayOrderForSave))
      if (editingSub) {
        await updateSubcategory(editingSub.id, fd)
        toast.success("Podkategória bola aktualizovaná")
      } else {
        await createSubcategory(fd)
        toast.success("Podkategória bola vytvorená")
      }
      setSubDialogOpen(false)
      resetSubForm()
      await loadData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba pri ukladaní")
    } finally {
      setSaving(false)
    }
  }

  async function removeSubcategory(id: string): Promise<boolean> {
    if (!confirm("Naozaj chcete vymazať túto podkategóriu?")) return false
    try {
      await deleteSubcategory(id)
      toast.success("Podkategória bola vymazaná")
      await loadData()
      return true
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba pri mazaní")
      return false
    }
  }

  const reorderSubcategories = useCallback(
    async (categoryId: string, orderedIds: string[]) => {
      let prevSnapshot: Subcategory[] = []
      setSubcategories((prev) => {
        prevSnapshot = [...prev]
        const idToIndex = new Map(orderedIds.map((id, i) => [id, i]))
        return prev.map((s) => {
          if (s.category_id !== categoryId) return s
          const idx = idToIndex.get(s.id)
          if (idx === undefined) return s
          return { ...s, display_order: idx }
        })
      })
      try {
        await reorderSubcategoriesAction(categoryId, orderedIds)
      } catch (e) {
        setSubcategories(prevSnapshot)
        toast.error(
          e instanceof Error ? e.message : "Nepodarilo sa uložiť poradie"
        )
      }
    },
    []
  )

  function resetBlockForm() {
    setEditingBlock(null)
    setSubBlockTarget(null)
    setBlockDialogStep("type")
    setCreateBlockType("text_block")
    setBlockTitle("")
    setBlockInnerHeading("")
    setBlockBody("")
    setBlockIconUrl("")
    setBlockImageUrl("")
    setBlockIconSize("50")
    setBlockImageSize("100")
    setBlockCtaLabel("")
    setBlockCtaUrl("")
    setBlockOrder("0")
  }

  function openCreateGrid(parent: BlockParent) {
    setGridDialogParent(parent)
    setNewGridLayout("2")
    setGridDialogOpen(true)
  }

  function openAddSubBlock(gridId: string, cellIndex: number) {
    resetBlockForm()
    setSubBlockTarget({ gridId, cellIndex })
    setBlockDialogStep("type")
    setBlockDialogOpen(true)
  }

  const reorderGrids = useCallback(
    async (parent: BlockParent, orderedRootIds: string[]) => {
      try {
        const fd = new FormData()
        if (parent.type === "category") {
          fd.set("category_id", parent.id)
        } else {
          fd.set("subcategory_id", parent.id)
        }
        fd.set("ordered_ids", JSON.stringify(orderedRootIds))
        await reorderContentGrids(fd)
        toast.success("Poradie gridov bolo uložené")
        await loadData()
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Nepodarilo sa uložiť poradie"
        )
      }
    },
    [loadData]
  )

  async function saveNewGrid() {
    if (!gridDialogParent) {
      toast.error("Chýba stránka")
      return
    }
    const data = { layout: newGridLayout, ...(newGridHasBackground ? { has_background: true } : {}) }
    const err = validateGridPayload(data)
    if (err) {
      toast.error(err)
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.set("block_type", "grid")
      fd.set("data", JSON.stringify(data))
      if (gridDialogParent.type === "category") {
        fd.set("category_id", gridDialogParent.id)
      } else {
        fd.set("subcategory_id", gridDialogParent.id)
      }
      await createContentBlock(fd)
      toast.success("Grid bol vytvorený")
      setGridDialogOpen(false)
      setGridDialogParent(null)
      setNewGridHasBackground(false)
      await loadData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba pri ukladaní")
    } finally {
      setSaving(false)
    }
  }

  const setGridBackground = useCallback(
    async (grid: ContentBlock, enabled: boolean) => {
      if (grid.block_type !== "grid") return
      try {
        const fd = new FormData()
        const nextData = {
          ...(grid.data ?? {}),
          ...(enabled ? { has_background: true } : {}),
        } as Record<string, unknown>
        if (!enabled) delete nextData.has_background
        fd.set("data", JSON.stringify(nextData))
        fd.set("display_order", String(grid.display_order))
        await updateContentBlock(grid.id, fd)
        toast.success(enabled ? "Pozadie gridu zapnuté" : "Pozadie gridu vypnuté")
        await loadData()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Chyba pri ukladaní gridu")
      }
    },
    [loadData]
  )

  function openEditBlock(block: ContentBlock) {
    if (block.block_type === "grid") return
    setSubBlockTarget(null)
    setEditingBlock(block)
    setCreateBlockType(block.block_type)
    setBlockOrder(String(block.display_order))
    if (block.block_type === "heading") {
      const d = getHeadingData(block)
      setBlockTitle(d.title)
      setBlockCtaLabel(d.ctaLabel ?? "")
      setBlockCtaUrl(d.ctaUrl ?? "")
      setBlockInnerHeading("")
      setBlockBody("")
      setBlockIconUrl("")
      setBlockImageUrl("")
      setBlockIconSize("50")
      setBlockImageSize("100")
    } else {
      setBlockTitle("")
      if (block.block_type === "text_block") {
        const d = getTextBlockData(block)
        setBlockInnerHeading(d.heading ?? "")
        setBlockBody(d.content)
        setBlockCtaLabel(d.ctaLabel ?? "")
        setBlockCtaUrl(d.ctaUrl ?? "")
        setBlockIconUrl("")
        setBlockImageUrl("")
        setBlockIconSize("50")
        setBlockImageSize("100")
      } else if (block.block_type === "icon_heading_text") {
        const d = getIconHeadingTextData(block)
        setBlockInnerHeading(d.heading ?? "")
        setBlockBody(d.content ?? "")
        setBlockCtaLabel(d.ctaLabel ?? "")
        setBlockCtaUrl(d.ctaUrl ?? "")
        setBlockIconUrl(d.iconUrl ?? "")
        setBlockIconSize(String(d.iconSize ?? 50))
        setBlockImageUrl("")
        setBlockImageSize("100")
      } else if (block.block_type === "image_heading_text_centered") {
        const d = getImageHeadingTextCenteredData(block)
        setBlockInnerHeading(d.heading ?? "")
        setBlockBody(d.content ?? "")
        setBlockCtaLabel(d.ctaLabel ?? "")
        setBlockCtaUrl(d.ctaUrl ?? "")
        setBlockImageUrl(d.imageUrl ?? "")
        setBlockImageSize(String(d.imageSize ?? 100))
        setBlockIconUrl("")
        setBlockIconSize("50")
      } else if (block.block_type === "heading_text_image_right") {
        const d = getHeadingTextImageRightData(block)
        setBlockInnerHeading(d.heading ?? "")
        setBlockBody(d.content ?? "")
        setBlockCtaLabel(d.ctaLabel ?? "")
        setBlockCtaUrl(d.ctaUrl ?? "")
        setBlockImageUrl(d.imageUrl ?? "")
        setBlockImageSize(String(d.imageSize ?? 70))
        setBlockIconUrl("")
        setBlockIconSize("50")
      } else {
        const d = getMediaLeftTextRightData(block)
        setBlockInnerHeading(d.heading ?? "")
        setBlockBody(d.content ?? "")
        setBlockCtaLabel(d.ctaLabel ?? "")
        setBlockCtaUrl(d.ctaUrl ?? "")
        setBlockImageUrl(d.imageUrl ?? "")
        setBlockImageSize(String(d.imageSize ?? 100))
        setBlockIconUrl("")
        setBlockIconSize("50")
      }
    }
    setBlockDialogStep("form")
    setBlockDialogOpen(true)
  }

  async function saveBlock() {
    if (!editingBlock && !subBlockTarget) {
      toast.error("Chýba cieľ bunky")
      return
    }
    const blockType = editingBlock ? editingBlock.block_type : createBlockType
    if (!isSubBlockType(blockType)) {
      toast.error("Neplatný typ podbloku")
      return
    }

    const data = buildContentBlockData(blockType, {
      title: blockTitle,
      heading: blockInnerHeading,
      content: blockBody,
      iconUrl: blockIconUrl,
      iconSize: parseInt(blockIconSize, 10),
      imageUrl: blockImageUrl,
      imageSize: parseInt(blockImageSize, 10),
      ctaLabel: blockCtaLabel,
      ctaUrl: blockCtaUrl,
    })
    const validationError = validateContentBlockPayload(blockType, data)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.set("data", JSON.stringify(data))
      if (editingBlock) {
        fd.set("display_order", blockOrder)
        await updateContentBlock(editingBlock.id, fd)
        toast.success("Podblok bol aktualizovaný")
      } else if (subBlockTarget) {
        fd.set("block_type", blockType)
        fd.set("parent_id", subBlockTarget.gridId)
        fd.set("cell_index", String(subBlockTarget.cellIndex))
        await createContentBlock(fd)
        toast.success("Podblok bol vytvorený")
      }
      setBlockDialogOpen(false)
      resetBlockForm()
      await loadData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba pri ukladaní")
    } finally {
      setSaving(false)
    }
  }

  async function removeBlock(id: string) {
    if (!confirm("Naozaj chcete vymazať tento blok?")) return
    try {
      await deleteContentBlock(id)
      toast.success("Blok bol vymazaný")
      await loadData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba pri mazaní")
    }
  }

  const getCategory = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  )

  const getSubcategory = useCallback(
    (id: string) => subcategories.find((s) => s.id === id),
    [subcategories]
  )

  const value: ContentStructureContextValue = {
    loading,
    categories,
    subcategories,
    contentBlocks,
    loadData,
    subsByCategory,
    categoryBlocks,
    subcategoryBlocks,
    categoryIdsWithBlocks,
    getCategory,
    getSubcategory,
    openCreateCategory,
    openEditCategory,
    removeCategory,
    reorderCategories,
    openCreateSubcategory,
    openEditSubcategory,
    removeSubcategory,
    reorderSubcategories,
    openCreateGrid,
    openAddSubBlock,
    reorderGrids,
    setGridBackground,
    openEditBlock,
    removeBlock,
  }

  return (
    <ContentStructureContext.Provider value={value}>
      {children}

      <Dialog
        open={catDialogOpen}
        onOpenChange={(o) => {
          setCatDialogOpen(o)
          if (!o) resetCatForm()
        }}
      >
        <DialogContent className="w-[95vw] max-w-none sm:!max-w-[95vw] xl:!max-w-[70vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCat ? "Upraviť kategóriu" : "Nová kategória"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Názov</Label>
              <Input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Názov kategórie"
              />
            </div>
            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
                rows={3}
              />
            </div>
            <ImageUpload
              value={catCover}
              onChange={setCatCover}
              label="Cover"
              removeBackground
            />
            <div className="space-y-2">
              <Label>Ikona (SVG kód)</Label>
              <Textarea
                value={catIconSvg}
                onChange={(e) => setCatIconSvg(e.target.value)}
                rows={6}
                placeholder='<svg xmlns="http://www.w3.org/2000/svg" ...>...</svg>'
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Vložte celý element {'<svg>…</svg>'}. Voliteľné; môže sa použiť na
                webe namiesto alebo spolu s coverom.
              </p>
            </div>
            <Button onClick={saveCategory} disabled={saving} className="w-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCat ? "Uložiť zmeny" : "Vytvoriť"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={subDialogOpen}
        onOpenChange={(o) => {
          setSubDialogOpen(o)
          if (!o) resetSubForm()
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSub
                ? "Upraviť podkategóriu"
                : subDialogCategoryName
                  ? `Nová podkategória — ${subDialogCategoryName}`
                  : "Nová podkategória"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Názov</Label>
              <Input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea
                value={subDescription}
                onChange={(e) => setSubDescription(e.target.value)}
                rows={3}
              />
            </div>
            <ImageUpload
              value={subCover}
              onChange={setSubCover}
              label="Cover"
              removeBackground
            />
            <Button
              onClick={saveSubcategory}
              disabled={saving}
              className="w-full"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSub ? "Uložiť zmeny" : "Vytvoriť"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={gridDialogOpen}
        onOpenChange={(o) => {
          setGridDialogOpen(o)
          if (!o) {
            setGridDialogParent(null)
            setNewGridHasBackground(false)
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nový grid</DialogTitle>
            <DialogDescription>
              Rozloženie buniek na celej šírke sekcie. Podbloky pridáte cez
              tlačidlá buniek po uložení.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Typ rozloženia</Label>
              <Select
                value={newGridLayout}
                onValueChange={(v) => setNewGridLayout(v as GridLayoutId)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRID_LAYOUT_IDS.map((id) => (
                    <SelectItem key={id} value={id}>
                      {GRID_LAYOUT_LABELS[id]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="new-grid-has-background">Pozadie gridu</Label>
              <Switch
                id="new-grid-has-background"
                checked={newGridHasBackground}
                onCheckedChange={setNewGridHasBackground}
              />
            </div>
            <Button onClick={saveNewGrid} disabled={saving} className="w-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Vytvoriť grid
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet
        open={blockDialogOpen}
        onOpenChange={(o) => {
          setBlockDialogOpen(o)
          if (!o) resetBlockForm()
        }}
      >
        <SheetContent
          side="right"
          className="w-[96vw] !max-w-[1100px] overflow-y-auto p-6 sm:w-[92vw] px-6 sm:px-24"
        >
          <SheetHeader className="p-0 pr-10">
            <SheetTitle>{subBlockDialogTitle}</SheetTitle>
            {editingBlock && editBlockPlacementLabel ? (
              <SheetDescription>
                Zaradenie: {editBlockPlacementLabel}
              </SheetDescription>
            ) : null}
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {!editingBlock && blockDialogStep === "type" ? (
              <>
              <BlockTypeRadioPicker
                value={createBlockType}
                onChange={setCreateBlockType}
              />
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setBlockDialogStep("form")}>
                    Pokračovať
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Typ bloku</Label>
                <p className="text-sm text-muted-foreground">
                  {CONTENT_BLOCK_LABELS[effectiveSubBlockType]}
                </p>
              </div>
            )}
            {editingBlock || blockDialogStep === "form" ? (
              <div className="mx-auto w-full max-w-full">
                {effectiveSubBlockType === "heading" ? (
                  <div className="space-y-2">
                    <Label>Nadpis</Label>
                    <Input
                      value={blockTitle}
                      onChange={(e) => setBlockTitle(e.target.value)}
                      placeholder="Nadpis"
                    />
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nadpis bloku</Label>
                        <Input
                          value={blockInnerHeading}
                          onChange={(e) => setBlockInnerHeading(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Text</Label>
                        <Textarea
                          value={blockBody}
                          onChange={(e) => setBlockBody(e.target.value)}
                          rows={8}
                        />
                      </div>
                    </div>
                    <div className="space-y-4 lg:col-start-2">
                      {showIconFields ? (
                        <>
                          <ImageUpload
                            value={blockIconUrl}
                            onChange={setBlockIconUrl}
                            label="Ikona"
                            allowRemoveBackgroundToggle
                          />
                          <div className="space-y-2">
                            <Label>Šírka ikony (px)</Label>
                            <Input
                              type="number"
                              min={1}
                              value={blockIconSize}
                              onChange={(e) => setBlockIconSize(e.target.value)}
                            />
                          </div>
                        </>
                      ) : null}
                      {showImageFields ? (
                        <>
                          <ImageUpload
                            value={blockImageUrl}
                            onChange={setBlockImageUrl}
                            label="Obrázok"
                            allowRemoveBackgroundToggle
                          />
                          <div className="space-y-2">
                            <Label>Šírka obrázka (px)</Label>
                            <Input
                              type="number"
                              min={1}
                              value={blockImageSize}
                              onChange={(e) => setBlockImageSize(e.target.value)}
                            />
                          </div>
                        </>
                      ) : null}
                      <div className="space-y-2">
                        <Label>CTA text tlačidla</Label>
                        <Input
                          value={blockCtaLabel}
                          onChange={(e) => setBlockCtaLabel(e.target.value)}
                          placeholder="Napriklad: Nezavazna cenova ponuka"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA URL</Label>
                        <Input
                          value={blockCtaUrl}
                          onChange={(e) => setBlockCtaUrl(e.target.value)}
                          placeholder="/kontakt alebo https://..."
                        />
                      </div>
                      {editingBlock ? (
                        <div className="space-y-2">
                          <Label>Poradie (v bunke)</Label>
                          <Input
                            type="number"
                            value={blockOrder}
                            onChange={(e) => setBlockOrder(e.target.value)}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            {editingBlock ? (
              <Button
                type="button"
                variant="outline"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                onClick={async () => {
                  if (!editingBlock) return
                  if (!confirm("Naozaj chcete vymazať tento blok?")) return
                  const id = editingBlock.id
                  setBlockDialogOpen(false)
                  resetBlockForm()
                  try {
                    await deleteContentBlock(id)
                    toast.success("Podblok bol vymazaný")
                    await loadData()
                  } catch (e) {
                    toast.error(
                      e instanceof Error ? e.message : "Chyba pri mazaní"
                    )
                  }
                }}
              >
                Zmazať podblok
              </Button>
            ) : null}
            {editingBlock || blockDialogStep === "form" ? (
              <div className="flex items-center justify-between gap-3">
                {!editingBlock ? (
                  <Button type="button" variant="outline" onClick={() => setBlockDialogStep("type")}>
                    Späť na výber typu
                  </Button>
                ) : (
                  <div />
                )}
                <Button onClick={saveBlock} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Uložiť
                </Button>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </ContentStructureContext.Provider>
  )
}
