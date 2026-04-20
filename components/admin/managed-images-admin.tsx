"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ImageUpload } from "@/components/admin/image-upload"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { removeManagedImage, replaceManagedImage } from "@/lib/actions/admin"
import type { ManagedImage } from "@/lib/types"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

type NamedRow = { id: string; name?: string | null; title?: string | null; category_id?: string | null }

const SITE_SETTING_LABELS: Record<string, string> = {
  homepage_cover_image: "Úvodná stránka · cover obrázok",
}

const SCOPE_LABELS: Record<ManagedImage["scope_type"], string> = {
  category: "Kategória",
  subcategory: "Podkategória",
  content_block: "Podblok",
  reusable_section_node: "Opakovaná sekcia",
  price_list_item: "Cenník",
  blog_post: "Článok",
  blog_image: "Galéria článku",
  site_setting: "Nastavenie webu",
}

export function ManagedImagesAdmin() {
  const [rows, setRows] = useState<ManagedImage[]>([])
  const [categories, setCategories] = useState<NamedRow[]>([])
  const [subcategories, setSubcategories] = useState<NamedRow[]>([])
  const [sections, setSections] = useState<NamedRow[]>([])
  const [blogPosts, setBlogPosts] = useState<NamedRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ManagedImage | null>(null)
  const [replacementUrl, setReplacementUrl] = useState("")

  const categoryMap = useMemo(
    () => new Map(categories.map((row) => [row.id, row.name ?? row.id])),
    [categories]
  )
  const subcategoryMap = useMemo(
    () => new Map(subcategories.map((row) => [row.id, row.name ?? row.id])),
    [subcategories]
  )
  const sectionMap = useMemo(
    () => new Map(sections.map((row) => [row.id, row.name ?? row.id])),
    [sections]
  )
  const blogMap = useMemo(
    () => new Map(blogPosts.map((row) => [row.id, row.title ?? row.id])),
    [blogPosts]
  )

  async function loadData() {
    setLoading(true)
    const supabase = createClient()
    const [
      managedImagesRes,
      categoriesRes,
      subcategoriesRes,
      sectionsRes,
      blogPostsRes,
    ] = await Promise.all([
      supabase
        .from("managed_images")
        .select("*")
        .order("updated_at", { ascending: false }),
      supabase.from("categories").select("id, name"),
      supabase.from("subcategories").select("id, name, category_id"),
      supabase.from("reusable_sections").select("id, name"),
      supabase.from("blog_posts").select("id, title"),
    ])

    if (managedImagesRes.error) {
      toast.error(managedImagesRes.error.message)
      setRows([])
    } else {
      setRows((managedImagesRes.data as ManagedImage[]) ?? [])
    }

    if (!categoriesRes.error) setCategories(categoriesRes.data ?? [])
    if (!subcategoriesRes.error) setSubcategories(subcategoriesRes.data ?? [])
    if (!sectionsRes.error) setSections(sectionsRes.data ?? [])
    if (!blogPostsRes.error) setBlogPosts(blogPostsRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void loadData()
  }, [])

  function resolveContextLabel(row: ManagedImage) {
    if (row.scope_type === "category") {
      return categoryMap.get(row.scope_id) ?? row.scope_id
    }
    if (row.scope_type === "subcategory") {
      return subcategoryMap.get(row.scope_id) ?? row.scope_id
    }
    if (row.scope_type === "content_block") {
      return row.block_type ? `${row.block_type} · ${row.field_name}` : row.field_name
    }
    if (row.scope_type === "reusable_section_node") {
      const sectionName = row.section_id ? sectionMap.get(row.section_id) : null
      return sectionName
        ? `${sectionName} · ${row.block_type ?? row.field_name}`
        : (row.block_type ?? row.field_name)
    }
    if (row.scope_type === "price_list_item") {
      return row.field_name === "image_url" ? "Riadok cenníka" : row.field_name
    }
    if (row.scope_type === "blog_post") {
      return blogMap.get(row.scope_id) ?? row.scope_id
    }
    if (row.scope_type === "blog_image") {
      return row.blog_post_id
        ? `${blogMap.get(row.blog_post_id) ?? row.blog_post_id} · galéria`
        : "Galéria článku"
    }
    return SITE_SETTING_LABELS[row.scope_id] ?? row.scope_id
  }

  function openReplaceDialog(row: ManagedImage) {
    setEditing(row)
    setReplacementUrl(row.image_url)
    setDialogOpen(true)
  }

  async function handleReplace() {
    if (!editing) return
    setSaving(true)
    try {
      await replaceManagedImage(editing.id, replacementUrl)
      toast.success("Obrázok bol zmenený")
      setDialogOpen(false)
      setEditing(null)
      setReplacementUrl("")
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Zmena obrázka zlyhala")
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(row: ManagedImage) {
    if (!confirm("Naozaj chcete odstrániť tento obrázok z daného miesta?")) return

    try {
      await removeManagedImage(row.id)
      toast.success("Obrázok bol odstránený")
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Odstránenie zlyhalo")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Obrázky</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Zoznam všetkých miest v admine, kde je aktuálne priradený obrázok.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border p-6 text-sm text-muted-foreground">
          Zatiaľ nie sú zaevidované žiadne obrázky. Po nasadení SQL tabuľky sa
          budú evidovať nové a zmenené obrázky.
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Typ</TableHead>
                <TableHead>Miesto</TableHead>
                <TableHead>Kategória</TableHead>
                <TableHead>Podkategória</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Akcie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{SCOPE_LABELS[row.scope_type]}</TableCell>
                  <TableCell className="whitespace-normal">
                    {resolveContextLabel(row)}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {row.category_id ? (categoryMap.get(row.category_id) ?? row.category_id) : "-"}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {row.subcategory_id
                      ? (subcategoryMap.get(row.subcategory_id) ?? row.subcategory_id)
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-[360px] whitespace-normal break-all font-mono text-xs">
                    {row.image_url}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openReplaceDialog(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(row)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditing(null)
            setReplacementUrl("")
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Zmeniť obrázok</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editing ? (
              <p className="text-sm text-muted-foreground">
                {SCOPE_LABELS[editing.scope_type]} · {resolveContextLabel(editing)}
              </p>
            ) : null}
            <ImageUpload
              value={replacementUrl}
              onChange={setReplacementUrl}
              label="Nový obrázok"
              allowRemoveBackgroundToggle
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Zavrieť
            </Button>
            <Button type="button" onClick={handleReplace} disabled={saving || !replacementUrl.trim()}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Uložiť zmenu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
