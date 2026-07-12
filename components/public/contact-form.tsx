"use client"

import { useMemo, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { sendContactEmail } from "@/lib/actions/contact"
import { pushFormSubmission } from "@/lib/gtm"
import { toast } from "sonner"
import { Send, Mail, Phone, User, Layers } from "lucide-react"
import type { Category, Subcategory } from "@/lib/types"
import { cn } from "@/lib/utils"

export const CATEGORY_OTHER = "__other__"
export const SUBCATEGORY_OTHER = "__other__"

type Cat = Category & { subcategories: Subcategory[] }

type Props = {
  categories?: Cat[]
  source?: "homepage" | "contact_page"
  className?: string
  cardClassName?: string
}

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-white px-2.5 py-1 text-sm text-black outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"

export function ContactForm({
  categories = [],
  source = "contact_page",
  className,
  cardClassName,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [categoryId, setCategoryId] = useState("")
  const [subcategoryId, setSubcategoryId] = useState("")

  const isCategoryOther = categoryId === CATEGORY_OTHER
  const showSubcategorySelect = Boolean(categoryId) && !isCategoryOther

  const subcategories = useMemo(() => {
    if (!categoryId || isCategoryOther) return []
    const cat = categories.find((c) => c.id === categoryId)
    return [...(cat?.subcategories ?? [])].sort(
      (a, b) => a.display_order - b.display_order
    )
  }, [categories, categoryId, isCategoryOther])

  function handleCategoryChange(value: string) {
    setCategoryId(value)
    setSubcategoryId("")
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set("source", source)
    formData.set("category", categoryId)
    formData.set("subcategory", showSubcategorySelect ? subcategoryId : "")

    const name = String(formData.get("name") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()
    const message = String(formData.get("message") ?? "").trim()

    const result = await sendContactEmail(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      pushFormSubmission({ name, email, text: message })
      toast.success("Správa bola úspešne odoslaná!")
      form.reset()
      setCategoryId("")
      setSubcategoryId("")
    }

    setLoading(false)
  }

  return (
    <Card
      className={cn(
        "border-0 border-none bg-muted py-8 md:py-10",
        cardClassName
      )}
    >
      <CardContent className={cn("mx-auto max-w-lg px-4 sm:px-6", className)}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {categories.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor={`${source}-category`}
                  className="flex items-center gap-1.5"
                >
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  Kategória
                </Label>
                <select
                  id={`${source}-category`}
                  name="category"
                  value={categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={selectClassName}
                >
                  <option value="">Vyberte kategóriu</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  <option value={CATEGORY_OTHER}>Iné</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor={`${source}-subcategory`}
                  className="flex items-center gap-1.5"
                >
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  Podkategória
                </Label>
                <select
                  id={`${source}-subcategory`}
                  name="subcategory"
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  disabled={!showSubcategorySelect}
                  className={selectClassName}
                >
                  <option value="">
                    {showSubcategorySelect
                      ? "Vyberte podkategóriu"
                      : isCategoryOther
                        ? "Nevyžaduje sa"
                        : "Najprv vyberte kategóriu"}
                  </option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                  {showSubcategorySelect ? (
                    <option value={SUBCATEGORY_OTHER}>Iné</option>
                  ) : null}
                </select>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor={`${source}-name`} className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Meno
            </Label>
            <Input
              id={`${source}-name`}
              name="name"
              required
              placeholder="Vaše meno"
              className="bg-white text-black"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${source}-email`} className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Email
            </Label>
            <Input
              id={`${source}-email`}
              className="bg-white text-black"
              name="email"
              type="email"
              required
              placeholder="vas@email.sk"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${source}-phone`} className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              Telefón
            </Label>
            <Input
              id={`${source}-phone`}
              name="phone"
              type="tel"
              placeholder="+421 xxx xxx xxx"
              className="bg-white text-black"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${source}-message`}>Správa</Label>
            <Textarea
              id={`${source}-message`}
              name="message"
              required
              rows={6}
              placeholder="Vaša správa..."
              className="bg-white text-black"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} size="lg">
              {loading ? (
                "Odosielam..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Odoslať
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
