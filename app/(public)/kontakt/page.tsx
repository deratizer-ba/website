import { AfterHeroRegion } from "@/components/public/after-hero-region"
import { ContactPageForm } from "./contact-page-form"

export default function ContactPage() {
  return (
    <>
      <div className="border-b bg-muted/30 pb-12 pt-28 lg:pt-32">
        <div className="mx-auto w-full max-w-5xl px-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Kontakt
          </h1>
          <p className="mt-2 text-muted-foreground">
            Máte otázku alebo potrebujete pomoc? Napíšte nám.
          </p>
        </div>
      </div>
      <AfterHeroRegion />
      <ContactPageForm />
    </>
  )
}
