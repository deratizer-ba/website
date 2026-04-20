"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactEmail(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const message = formData.get("message") as string

  if (!name || !email || !message) {
    return { error: "Vyplňte všetky povinné polia" }
  }

  try {
    await resend.emails.send({
      from: "Kontaktný formulár <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL!,
      subject: `Nová správa od ${name}`,
      html: `
        <h2>Nová správa z kontaktného formulára</h2>
        <p><strong>Meno:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefón:</strong> ${phone || "Neuvedené"}</p>
        <hr />
        <p><strong>Správa:</strong></p>
        <p>${message.replace(/\n/g, "<br />")}</p>
      `,
    })

    return { success: true }
  } catch {
    return { error: "Nepodarilo sa odoslať správu. Skúste to znova." }
  }
}
