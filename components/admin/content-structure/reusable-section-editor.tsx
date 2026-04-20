"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
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
} from "@/components/ui/select"
import { ImageUpload } from "@/components/admin/image-upload"
import { BlockTypeRadioPicker } from "@/components/admin/content-structure/block-type-radio-picker"
import { ContentBlockBody } from "@/components/content-blocks/content-block-body"
import type { ContentBlock, GridLayoutId, SubBlockType } from "@/lib/types"
import {
  CONTENT_BLOCK_LABELS,
  GRID_LAYOUT_IDS,
  GRID_LAYOUT_LABELS,
  adminEditorGridColsClass,
  buildContentBlockData,
  getGridHasBackground,
  getGridLayout,
  gridBackgroundClass,
  getHeadingData,
  getHeadingTextImageRightData,
  getIconHeadingTextData,
  getImageHeadingTextCenteredData,
  getMediaLeftTextRightData,
  getTextBlockData,
  gridLayoutCellCount,
  groupChildBlocksByParent,
  isRootGridBlock,
  sortChildBlocks,
  validateContentBlockPayload,
  validateGridPayload,
} from "@/lib/content-blocks"
import {
  createReusableSectionNode,
  deleteReusableSectionNode,
  reorderReusableSectionGrids,
  updateReusableSectionNode,
} from "@/lib/actions/admin"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"

type Props = { sectionId: string }

export function ReusableSectionEditor({ sectionId }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [gridDialogOpen, setGridDialogOpen] = useState(false)
  const [newGridLayout, setNewGridLayout] = useState<GridLayoutId>("2")
  const [newGridHasBackground, setNewGridHasBackground] = useState(false)
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [blockDialogStep, setBlockDialogStep] = useState<"type" | "form">("type")
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null)
  const [subBlockTarget, setSubBlockTarget] = useState<{ gridId: string; cellIndex: number } | null>(null)
  const [createBlockType, setCreateBlockType] = useState<SubBlockType>("text_block")
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
    const { data, error } = await supabase
      .from("reusable_section_nodes")
      .select("*")
      .eq("section_id", sectionId)
      .order("display_order")
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    const mapped = ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      category_id: null,
      subcategory_id: null,
      parent_id: (r.parent_id as string | null) ?? null,
      cell_index: Number(r.cell_index ?? 0),
      block_type: r.block_type as ContentBlock["block_type"],
      data: (r.data as Record<string, unknown>) ?? {},
      display_order: Number(r.display_order ?? 0),
      created_at: String(r.created_at ?? ""),
      updated_at: String(r.updated_at ?? ""),
    }))
    setBlocks(mapped)
    setLoading(false)
  }, [sectionId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const roots = useMemo(() => {
    const r = blocks.filter(isRootGridBlock)
    r.sort((a, b) => a.display_order - b.display_order || a.id.localeCompare(b.id))
    return r
  }, [blocks])
  const byParent = useMemo(() => groupChildBlocksByParent(blocks), [blocks])

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

  async function saveNewGrid() {
    const data = { layout: newGridLayout, ...(newGridHasBackground ? { has_background: true } : {}) }
    const err = validateGridPayload(data)
    if (err) return toast.error(err)
    setSaving(true)
    try {
      const fd = new FormData()
      fd.set("section_id", sectionId)
      fd.set("block_type", "grid")
      fd.set("data", JSON.stringify(data))
      await createReusableSectionNode(fd)
      setGridDialogOpen(false)
      setNewGridHasBackground(false)
      await loadData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba pri ukladaní")
    } finally {
      setSaving(false)
    }
  }

  async function saveBlock() {
    if (!editingBlock && !subBlockTarget) {
      toast.error("Chýba cieľ bunky. Klikni na plus v konkrétnej bunke gridu.")
      return
    }
    const blockType = editingBlock ? editingBlock.block_type : createBlockType
    if (blockType === "grid") return
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
    if (validationError) return toast.error(validationError)
    setSaving(true)
    try {
      const fd = new FormData()
      fd.set("data", JSON.stringify(data))
      if (editingBlock) {
        fd.set("display_order", blockOrder)
        await updateReusableSectionNode(editingBlock.id, fd)
      } else if (subBlockTarget) {
        fd.set("section_id", sectionId)
        fd.set("block_type", blockType)
        fd.set("parent_id", subBlockTarget.gridId)
        fd.set("cell_index", String(subBlockTarget.cellIndex))
        await createReusableSectionNode(fd)
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
      await deleteReusableSectionNode(id)
      await loadData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba pri mazaní")
    }
  }

  async function moveGrid(gridId: string, direction: -1 | 1) {
    const ids = roots.map((x) => x.id)
    const i = ids.indexOf(gridId)
    const j = i + direction
    if (i < 0 || j < 0 || j >= ids.length) return
    const next = [...ids]
    ;[next[i], next[j]] = [next[j], next[i]]
    try {
      const fd = new FormData()
      fd.set("section_id", sectionId)
      fd.set("ordered_ids", JSON.stringify(next))
      await reorderReusableSectionGrids(fd)
      await loadData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba pri ukladaní poradia")
    }
  }

  async function setGridBackground(grid: ContentBlock, enabled: boolean) {
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
      await updateReusableSectionNode(grid.id, fd)
      await loadData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba pri ukladaní gridu")
    }
  }

  const effectiveSubBlockType: SubBlockType =
    editingBlock && editingBlock.block_type !== "grid" ? editingBlock.block_type : createBlockType
  const showIconFields = effectiveSubBlockType === "icon_heading_text"
  const showImageFields =
    effectiveSubBlockType === "image_heading_text_centered" ||
    effectiveSubBlockType === "heading_text_image_right" ||
    effectiveSubBlockType === "media_left_text_right"

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button type="button" variant="ghost" size="sm" className="-ml-2" onClick={() => setGridDialogOpen(true)}>
        <Plus className="mr-2 h-3.5 w-3.5" />
        Nový grid
      </Button>

      {roots.map((grid, idx) => {
        const layout = getGridLayout(grid)
        const n = layout ? gridLayoutCellCount(layout) : 0
        const sorted = sortChildBlocks(byParent.get(grid.id) ?? [])
        const byCell = new Map<number, ContentBlock[]>()
        for (let i = 0; i < n; i++) byCell.set(i, [])
        for (const c of sorted) if (c.cell_index >= 0 && c.cell_index < n) byCell.get(c.cell_index)?.push(c)

        return (
          <div key={grid.id} className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Grid · {layout ? GRID_LAYOUT_LABELS[layout] : "?"}</div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`reusable-grid-bg-${grid.id}`} className="text-xs text-muted-foreground">
                    Pozadie
                  </Label>
                  <Switch
                    id={`reusable-grid-bg-${grid.id}`}
                    size="sm"
                    checked={getGridHasBackground(grid)}
                    onCheckedChange={(checked) => void setGridBackground(grid, checked)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => moveGrid(grid.id, -1)} disabled={idx === 0}>Hore</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => moveGrid(grid.id, 1)} disabled={idx === roots.length - 1}>Dole</Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeBlock(grid.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div
              className={`grid gap-4 ${gridBackgroundClass(getGridHasBackground(grid))} ${layout ? adminEditorGridColsClass(layout) : "grid-cols-1"}`}
            >
              {Array.from({ length: n }, (_, cellIndex) => {
                const cellBlocks = byCell.get(cellIndex) ?? []
                return (
                  <div key={cellIndex} className="min-h-[110px] rounded-md border p-2">
                    {cellBlocks.length === 0 ? (
                      <Button type="button" variant="ghost" className="w-full h-[80px]" onClick={() => {
                        resetBlockForm()
                        setSubBlockTarget({ gridId: grid.id, cellIndex })
                        setBlockDialogOpen(true)
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Pridať blok
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        {cellBlocks.map((sub) => (
                          <div key={sub.id} className="relative pr-8">
                            <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-7 w-7" onClick={() => {
                              setEditingBlock(sub)
                              setBlockOrder(String(sub.display_order))
                              if (sub.block_type === "heading") {
                                const d = getHeadingData(sub)
                                setBlockTitle(d.title)
                                setBlockCtaLabel(d.ctaLabel ?? "")
                                setBlockCtaUrl(d.ctaUrl ?? "")
                              } else if (sub.block_type === "text_block") {
                                const d = getTextBlockData(sub)
                                setBlockInnerHeading(d.heading ?? "")
                                setBlockBody(d.content)
                                setBlockCtaLabel(d.ctaLabel ?? "")
                                setBlockCtaUrl(d.ctaUrl ?? "")
                              } else if (sub.block_type === "icon_heading_text") {
                                const d = getIconHeadingTextData(sub)
                                setBlockInnerHeading(d.heading ?? "")
                                setBlockBody(d.content ?? "")
                                setBlockIconUrl(d.iconUrl ?? "")
                                setBlockIconSize(String(d.iconSize ?? 50))
                                setBlockCtaLabel(d.ctaLabel ?? "")
                                setBlockCtaUrl(d.ctaUrl ?? "")
                              } else if (sub.block_type === "image_heading_text_centered") {
                                const d = getImageHeadingTextCenteredData(sub)
                                setBlockInnerHeading(d.heading ?? "")
                                setBlockBody(d.content ?? "")
                                setBlockImageUrl(d.imageUrl ?? "")
                                setBlockImageSize(String(d.imageSize ?? 100))
                                setBlockCtaLabel(d.ctaLabel ?? "")
                                setBlockCtaUrl(d.ctaUrl ?? "")
                              } else if (sub.block_type === "heading_text_image_right") {
                                const d = getHeadingTextImageRightData(sub)
                                setBlockInnerHeading(d.heading ?? "")
                                setBlockBody(d.content ?? "")
                                setBlockImageUrl(d.imageUrl ?? "")
                                setBlockImageSize(String(d.imageSize ?? 70))
                                setBlockCtaLabel(d.ctaLabel ?? "")
                                setBlockCtaUrl(d.ctaUrl ?? "")
                              } else {
                                const d = getMediaLeftTextRightData(sub)
                                setBlockInnerHeading(d.heading ?? "")
                                setBlockBody(d.content ?? "")
                                setBlockImageUrl(d.imageUrl ?? "")
                                setBlockImageSize(String(d.imageSize ?? 100))
                                setBlockCtaLabel(d.ctaLabel ?? "")
                                setBlockCtaUrl(d.ctaUrl ?? "")
                              }
                              setBlockDialogStep("form")
                              setBlockDialogOpen(true)
                            }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <ContentBlockBody block={sub} />
                          </div>
                        ))}
                        <Button type="button" variant="ghost" onClick={() => {
                          resetBlockForm()
                          setSubBlockTarget({ gridId: grid.id, cellIndex })
                          setBlockDialogStep("type")
                          setBlockDialogOpen(true)
                        }}>
                          <Plus className="mr-2 h-4 w-4" />
                          Ďalší blok
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <Dialog open={gridDialogOpen} onOpenChange={(open) => {
        setGridDialogOpen(open)
        if (!open) setNewGridHasBackground(false)
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nový grid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Typ rozloženia</Label>
            <Select value={newGridLayout} onValueChange={(v) => setNewGridLayout(v as GridLayoutId)}>
              <SelectTrigger>{GRID_LAYOUT_LABELS[newGridLayout]}</SelectTrigger>
              <SelectContent>
                {GRID_LAYOUT_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {GRID_LAYOUT_LABELS[id]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="new-reusable-grid-has-background">Pozadie gridu</Label>
              <Switch
                id="new-reusable-grid-has-background"
                checked={newGridHasBackground}
                onCheckedChange={setNewGridHasBackground}
              />
            </div>
            <Button onClick={saveNewGrid} disabled={saving} className="w-full">Vytvoriť grid</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={blockDialogOpen} onOpenChange={(o) => { setBlockDialogOpen(o); if (!o) resetBlockForm() }}>
        <SheetContent side="right" className="w-[96vw] !max-w-[1100px] overflow-y-auto p-6 sm:w-[92vw]">
          <SheetHeader className="p-0 pr-10">
            <SheetTitle>{editingBlock ? "Upraviť podblok" : "Nový podblok"}</SheetTitle>
            <SheetDescription>
              {editingBlock ? "Upravujete existujúci blok." : "Pridávate blok do bunky."}
            </SheetDescription>
          </SheetHeader>
          {!editingBlock && blockDialogStep === "type" ? (
            <div className="space-y-4">
              <BlockTypeRadioPicker
                value={createBlockType}
                onChange={setCreateBlockType}
              />
              <div className="flex justify-end">
                <Button type="button" onClick={() => setBlockDialogStep("form")}>
                  Pokračovať
                </Button>
              </div>
            </div>
          ) : null}
          {editingBlock || blockDialogStep === "form" ? (
            <div className="mx-auto w-full max-w-full">
              {effectiveSubBlockType === "heading" ? (
                <div className="space-y-2">
                  <Label>Nadpis</Label>
                  <Input value={blockTitle} onChange={(e) => setBlockTitle(e.target.value)} />
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nadpis bloku</Label>
                      <Input value={blockInnerHeading} onChange={(e) => setBlockInnerHeading(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Textarea value={blockBody} onChange={(e) => setBlockBody(e.target.value)} rows={8} />
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
                          <Input type="number" min={1} value={blockIconSize} onChange={(e) => setBlockIconSize(e.target.value)} />
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
                          <Input type="number" min={1} value={blockImageSize} onChange={(e) => setBlockImageSize(e.target.value)} />
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
                        <Label>Poradie</Label>
                        <Input type="number" value={blockOrder} onChange={(e) => setBlockOrder(e.target.value)} />
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          ) : null}
          {editingBlock ? (
            <Button type="button" variant="outline" className="w-full text-destructive" onClick={async () => {
              if (!editingBlock) return
              const id = editingBlock.id
              setBlockDialogOpen(false)
              resetBlockForm()
              await removeBlock(id)
            }}>Zmazať podblok</Button>
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
              <Button type="button" onClick={saveBlock} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Uložiť
              </Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
