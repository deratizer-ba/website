"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { updateSiteSetting } from "@/lib/actions/admin"
import { createClient } from "@/lib/supabase/client"
import {
  COMPANY_SITE_SETTING_KEYS,
  type CompanySiteSettingKey,
} from "@/lib/company-site-settings"
import { toast } from "sonner"
import { Save, Loader2 } from "lucide-react"

function emptyCompanyForm(): Record<CompanySiteSettingKey, string> {
  return COMPANY_SITE_SETTING_KEYS.reduce(
    (acc, key) => {
      acc[key] = ""
      return acc
    },
    {} as Record<CompanySiteSettingKey, string>
  )
}

function SaveSectionButton({
  saving,
  onSave,
}: {
  saving: boolean
  onSave: () => void
}) {
  return (
    <div className="pt-2">
      <Button onClick={onSave} disabled={saving} className="w-full sm:w-auto">
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Uložiť
      </Button>
    </div>
  )
}

export default function CompanySettingsAdmin() {
  const [values, setValues] = useState<Record<CompanySiteSettingKey, string>>(
    emptyCompanyForm
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const keys = useMemo(() => [...COMPANY_SITE_SETTING_KEYS], [])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from("site_settings").select("*")
      if (data) {
        const next = emptyCompanyForm()
        for (const key of keys) {
          next[key] = data.find((s) => s.key === key)?.value ?? ""
        }
        setValues(next)
      }
      setLoading(false)
    }
    load()
  }, [keys])

  function setField(key: CompanySiteSettingKey, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await Promise.all(
        keys.map((key) => updateSiteSetting(key, values[key] ?? ""))
      )
      toast.success("Firemné údaje boli uložené")
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
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold">Firemné údaje</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Zobrazia sa v pätičke webu (kontakt, fakturačné údaje, sociálne
            siete).
          </p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Značka</CardTitle>
            <CardDescription>
              Názov v pätičke a krátky text pod ním.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_display_name">Zobrazovaný názov</Label>
              <Input
                id="company_display_name"
                value={values.company_display_name}
                onChange={(e) =>
                  setField("company_display_name", e.target.value)
                }
                placeholder="Deratizéri"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_tagline">Slogan / úvodný text</Label>
              <Textarea
                id="company_tagline"
                value={values.company_tagline}
                onChange={(e) => setField("company_tagline", e.target.value)}
                placeholder="Krátky popis firmy…"
                rows={2}
              />
            </div>
            <SaveSectionButton saving={saving} onSave={handleSave} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fakturačná adresa</CardTitle>
            <CardDescription>Adresa sídla alebo prevádzky.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_street">Ulica a číslo</Label>
              <Input
                id="company_street"
                value={values.company_street}
                onChange={(e) => setField("company_street", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_zip">PSČ</Label>
                <Input
                  id="company_zip"
                  value={values.company_zip}
                  onChange={(e) => setField("company_zip", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_city">Mesto</Label>
                <Input
                  id="company_city"
                  value={values.company_city}
                  onChange={(e) => setField("company_city", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_country">Štát</Label>
              <Input
                id="company_country"
                value={values.company_country}
                onChange={(e) => setField("company_country", e.target.value)}
                placeholder="Slovensko"
              />
            </div>
            <SaveSectionButton saving={saving} onSave={handleSave} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identifikačné údaje a platba</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_ico">IČO</Label>
                <Input
                  id="company_ico"
                  value={values.company_ico}
                  onChange={(e) => setField("company_ico", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_dic">DIČ</Label>
                <Input
                  id="company_dic"
                  value={values.company_dic}
                  onChange={(e) => setField("company_dic", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_ic_dph">IČ DPH</Label>
              <Input
                id="company_ic_dph"
                value={values.company_ic_dph}
                onChange={(e) => setField("company_ic_dph", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_iban">IBAN</Label>
              <Input
                id="company_iban"
                value={values.company_iban}
                onChange={(e) => setField("company_iban", e.target.value)}
                placeholder="SK00 0000 0000 0000 0000 0000"
              />
            </div>
            <SaveSectionButton saving={saving} onSave={handleSave} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kontakt a sociálne siete</CardTitle>
            <CardDescription>
              Telefón a e-mail ako odkaz; Facebook a Instagram ako plné URL
              (môžete zadať aj bez https://).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_phone">Telefón</Label>
              <Input
                id="company_phone"
                value={values.company_phone}
                onChange={(e) => setField("company_phone", e.target.value)}
                placeholder="+421 …"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_email">E-mail</Label>
              <Input
                id="company_email"
                type="email"
                value={values.company_email}
                onChange={(e) => setField("company_email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_facebook_url">Facebook (URL)</Label>
              <Input
                id="company_facebook_url"
                value={values.company_facebook_url}
                onChange={(e) =>
                  setField("company_facebook_url", e.target.value)
                }
                placeholder="facebook.com/…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_instagram_url">Instagram (URL)</Label>
              <Input
                id="company_instagram_url"
                value={values.company_instagram_url}
                onChange={(e) =>
                  setField("company_instagram_url", e.target.value)
                }
                placeholder="instagram.com/…"
              />
            </div>
            <SaveSectionButton saving={saving} onSave={handleSave} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
