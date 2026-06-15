import { AfterHeroRegion } from "@/components/public/after-hero-region"
import { getCompanyPublicInfoCached } from "@/lib/get-company-settings-cached"
import { ContactPageForm } from "./contact-page-form"
import { ContactPageInfo } from "./contact-page-info"

export default async function ContactPage() {
  const company = await getCompanyPublicInfoCached()

  return (
    <>
      <div className="border-b bg-brand pb-12 pt-28 lg:pt-32">
        <div className="mx-auto w-full max-w-6xl px-4 text-white">
          <h1 className="text-3xl font-normal tracking-tight md:text-4xl">
            Kontakt
          </h1>
          <p className="mt-2 text-white">
            Máte otázku alebo potrebujete pomoc? Napíšte nám.
          </p>
        </div>
      </div>
      <AfterHeroRegion />
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start">
          <ContactPageInfo company={company} />
          <ContactPageForm />
        </div>
      </section>
    </>
  )
}
