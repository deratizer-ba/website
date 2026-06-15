"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const CONTACT_FROM =
  process.env.RESEND_FROM_EMAIL ??
  "Kontaktný formulár <kontakt@deratizeri-bratislava.sk>"

export async function sendContactEmail(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const message = formData.get("message") as string
  const contactEmail = process.env.CONTACT_EMAIL

  if (!name || !email || !message) {
    return { error: "Vyplňte všetky povinné polia" }
  }

  if (!process.env.RESEND_API_KEY || !contactEmail) {
    return { error: "Kontaktný formulár nie je nakonfigurovaný." }
  }

  try {
    const { error } = await resend.emails.send({
      from: CONTACT_FROM,
      to: contactEmail,
      replyTo: email,
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

    if (error) {
      console.error("Resend error:", error)
      return { error: "Nepodarilo sa odoslať správu. Skúste to znova." }
    }

    return { success: true }
  } catch (error) {
    console.error("Contact email error:", error)
    return { error: "Nepodarilo sa odoslať správu. Skúste to znova." }
  }
}
