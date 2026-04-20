"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { sendContactEmail } from "@/lib/actions/contact"
import { toast } from "sonner"
import { Send, Mail, Phone, User } from "lucide-react"

export function ContactPageForm() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await sendContactEmail(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Správa bola úspešne odoslaná!")
      e.currentTarget.reset()
    }

    setLoading(false)
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-12">
      <Card>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Meno
              </Label>
              <Input id="name" name="name" required placeholder="Vaše meno" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="vas@email.sk"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Telefón
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+421 xxx xxx xxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Správa</Label>
              <Textarea
                id="message"
                name="message"
                required
                rows={6}
                placeholder="Vaša správa..."
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                "Odosielam..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Odoslať správu
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
