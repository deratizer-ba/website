"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/admin/image-upload"
import { updateSiteSetting } from "@/lib/actions/admin"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Save, Loader2 } from "lucide-react"

export default function HomepageAdmin() {
  const [h1, setH1] = useState("")
  const [description, setDescription] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from("site_settings").select("*")
      if (data) {
        setH1(data.find((s) => s.key === "homepage_h1")?.value ?? "")
        setDescription(
          data.find((s) => s.key === "homepage_description")?.value ?? ""
        )
        setCoverImage(
          data.find((s) => s.key === "homepage_cover_image")?.value ?? ""
        )
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await Promise.all([
        updateSiteSetting("homepage_h1", h1),
        updateSiteSetting("homepage_description", description),
        updateSiteSetting("homepage_cover_image", coverImage),
      ])
      toast.success("Úvodná stránka bola uložená")
    } catch {
      toast.error("Chyba pri ukladaní")
    } finally {
      setSaving(false)
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Úvodná stránka</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Uložiť
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="h1">Hlavný nadpis (H1)</Label>
          <Input
            id="h1"
            value={h1}
            onChange={(e) => setH1(e.target.value)}
            placeholder="Profesionálna deratizácia"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Popis</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Krátky popis pod nadpisom..."
            rows={3}
          />
        </div>

        <ImageUpload
          value={coverImage}
          onChange={setCoverImage}
          label="Cover obrázok"
          removeBackground
        />
      </div>
    </div>
  )
}
