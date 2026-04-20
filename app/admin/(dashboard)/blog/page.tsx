"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ImageUpload } from "@/components/admin/image-upload"
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  addBlogImage,
  deleteBlogImage,
  uploadImage,
} from "@/lib/actions/admin"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2, ImagePlus, X } from "lucide-react"
import type { BlogPost, BlogImage } from "@/lib/types"

type BlogPostRow = BlogPost & { blog_images: BlogImage[] }

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BlogPostRow | null>(null)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [published, setPublished] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  async function loadPosts() {
    const supabase = createClient()
    const { data } = await supabase
      .from("blog_posts")
      .select("*, blog_images(*)")
      .order("created_at", { ascending: false })
    setPosts((data as BlogPostRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadPosts()
  }, [])

  function resetForm() {
    setTitle("")
    setContent("")
    setCoverImage("")
    setYoutubeUrl("")
    setPublished(false)
    setEditing(null)
  }

  function openCreate() {
    resetForm()
    setDialogOpen(true)
  }

  function openEdit(post: BlogPostRow) {
    setEditing(post)
    setTitle(post.title)
    setContent(post.content ?? "")
    setCoverImage(post.cover_image_url ?? "")
    setYoutubeUrl(post.youtube_url ?? "")
    setPublished(post.published)
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Zadajte názov článku")
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.set("title", title)
      formData.set("content", content)
      formData.set("cover_image_url", coverImage)
      formData.set("youtube_url", youtubeUrl)
      formData.set("published", String(published))

      if (editing) {
        await updateBlogPost(editing.id, formData)
        toast.success("Článok bol aktualizovaný")
      } else {
        await createBlogPost(formData)
        toast.success("Článok bol vytvorený")
      }

      setDialogOpen(false)
      resetForm()
      await loadPosts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chyba pri ukladaní")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Naozaj chcete vymazať tento článok?")) return

    try {
      await deleteBlogPost(id)
      toast.success("Článok bol vymazaný")
      await loadPosts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chyba pri mazaní")
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editing || !e.target.files?.length) return

    setUploadingGallery(true)
    try {
      for (const file of Array.from(e.target.files)) {
        const formData = new FormData()
        formData.append("file", file)
        const url = await uploadImage(formData)
        await addBlogImage(editing.id, url)
      }
      await loadPosts()
      toast.success("Obrázky boli pridané")
    } catch {
      toast.error("Chyba pri nahrávaní obrázkov")
    } finally {
      setUploadingGallery(false)
      e.target.value = ""
    }
  }

  async function handleRemoveGalleryImage(imageId: string) {
    try {
      await deleteBlogImage(imageId)
      await loadPosts()
      toast.success("Obrázok bol odstránený")
    } catch {
      toast.error("Chyba pri odstraňovaní")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const currentImages = editing
    ? posts.find((p) => p.id === editing.id)?.blog_images ?? []
    : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nový článok
        </Button>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Upraviť článok" : "Nový článok"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Názov</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Názov článku"
              />
            </div>
            <div className="space-y-2">
              <Label>Obsah</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Obsah článku..."
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label>YouTube URL</Label>
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={published}
                onCheckedChange={setPublished}
                id="published"
              />
              <Label htmlFor="published">Publikovaný</Label>
            </div>
            <ImageUpload
              value={coverImage}
              onChange={setCoverImage}
              label="Cover obrázok"
            />

            {editing && (
              <div className="space-y-2">
                <Label>Galéria obrázkov</Label>
                {currentImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {currentImages
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((img) => (
                        <div
                          key={img.id}
                          className="relative aspect-video rounded overflow-hidden border"
                        >
                          <Image
                            src={img.image_url}
                            alt=""
                            fill
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => handleRemoveGalleryImage(img.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingGallery}
                    onClick={() => {}}
                  >
                    {uploadingGallery ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="mr-2 h-4 w-4" />
                    )}
                    Pridať obrázky
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                  />
                </label>
              </div>
            )}

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Uložiť zmeny" : "Vytvoriť"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          Zatiaľ nemáte žiadne články.
        </p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Názov</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead>Dátum</TableHead>
                <TableHead className="text-right">Akcie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? "Publikovaný" : "Koncept"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString("sk-SK")}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(post)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
