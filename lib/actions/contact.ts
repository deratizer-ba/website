"use server"

import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"

const CATEGORY_OTHER = "__other__"
const SUBCATEGORY_OTHER = "__other__"

const resend = new Resend(process.env.RESEND_API_KEY)

const CONTACT_FROM =
  process.env.RESEND_FROM_EMAIL ??
  "Kontaktný formulár <kontakt@deratizeri-bratislava.sk>"

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

type ParsedCategoryFields = {
  categoryId: string | null
  subcategoryId: string | null
  categoryLabel: string | null
  subcategoryLabel: string | null
}

async function resolveCategoryFields(
  formData: FormData
): Promise<ParsedCategoryFields> {
  const categoryRaw = (formData.get("category") as string)?.trim() ?? ""
  const subcategoryRaw = (formData.get("subcategory") as string)?.trim() ?? ""

  if (!categoryRaw) {
    return {
      categoryId: null,
      subcategoryId: null,
      categoryLabel: null,
      subcategoryLabel: null,
    }
  }

  if (categoryRaw === CATEGORY_OTHER) {
    return {
      categoryId: null,
      subcategoryId: null,
      categoryLabel: "Iné",
      subcategoryLabel: null,
    }
  }

  const supabase = await createClient()

  const { data: category } = await supabase
    .from("categories")
    .select("id, name")
    .eq("id", categoryRaw)
    .maybeSingle()

  if (!category) {
    return {
      categoryId: null,
      subcategoryId: null,
      categoryLabel: null,
      subcategoryLabel: null,
    }
  }

  if (!subcategoryRaw) {
    return {
      categoryId: category.id,
      subcategoryId: null,
      categoryLabel: category.name,
      subcategoryLabel: null,
    }
  }

  if (subcategoryRaw === SUBCATEGORY_OTHER) {
    return {
      categoryId: category.id,
      subcategoryId: null,
      categoryLabel: category.name,
      subcategoryLabel: "Iné",
    }
  }

  const { data: subcategory } = await supabase
    .from("subcategories")
    .select("id, name, category_id")
    .eq("id", subcategoryRaw)
    .eq("category_id", category.id)
    .maybeSingle()

  return {
    categoryId: category.id,
    subcategoryId: subcategory?.id ?? null,
    categoryLabel: category.name,
    subcategoryLabel: subcategory?.name ?? null,
  }
}

export async function sendContactEmail(formData: FormData) {
  const name = (formData.get("name") as string)?.trim()
  const email = (formData.get("email") as string)?.trim()
  const phone = (formData.get("phone") as string)?.trim()
  const message = (formData.get("message") as string)?.trim()
  const sourceRaw = (formData.get("source") as string)?.trim()
  const source =
    sourceRaw === "homepage" || sourceRaw === "contact_page"
      ? sourceRaw
      : "contact_page"
  const contactEmail = process.env.CONTACT_EMAIL

  if (!name || !email || !message) {
    return { error: "Vyplňte všetky povinné polia" }
  }

  const categoryFields = await resolveCategoryFields(formData)

  const supabase = await createClient()
  const { error: dbError } = await supabase.from("contact_submissions").insert({
    name,
    email,
    phone: phone || null,
    message,
    category_id: categoryFields.categoryId,
    subcategory_id: categoryFields.subcategoryId,
    category_label: categoryFields.categoryLabel,
    subcategory_label: categoryFields.subcategoryLabel,
    source,
  })

  if (dbError) {
    console.error("Contact submission DB error:", dbError)
    return {
      error:
        "Nepodarilo sa uložiť správu. Skontrolujte databázu alebo to skúste znova.",
    }
  }

  if (!process.env.RESEND_API_KEY || !contactEmail) {
    return { success: true }
  }

  const categoryLine = categoryFields.categoryLabel
    ? `<p><strong>Kategória:</strong> ${escapeHtml(categoryFields.categoryLabel)}</p>`
    : ""
  const subcategoryLine = categoryFields.subcategoryLabel
    ? `<p><strong>Podkategória:</strong> ${escapeHtml(categoryFields.subcategoryLabel)}</p>`
    : ""

  try {
    const { error } = await resend.emails.send({
      from: CONTACT_FROM,
      to: contactEmail,
      replyTo: email,
      subject: `Nová správa od ${name}`,
      html: `
        <h2>Nová správa z kontaktného formulára</h2>
        <p><strong>Zdroj:</strong> ${source === "homepage" ? "Úvodná stránka" : "Kontakt"}</p>
        <p><strong>Meno:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Telefón:</strong> ${phone ? escapeHtml(phone) : "Neuvedené"}</p>
        ${categoryLine}
        ${subcategoryLine}
        <hr />
        <p><strong>Správa:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return { error: "Správa bola uložená, ale email sa nepodarilo odoslať." }
    }

    return { success: true }
  } catch (error) {
    console.error("Contact email error:", error)
    return { error: "Správa bola uložená, ale email sa nepodarilo odoslať." }
  }
}
