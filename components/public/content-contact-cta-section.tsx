import { PriceListContactBanner } from "@/components/public/price-list-section"
import type { CompanyPublicInfo } from "@/lib/company-site-settings"

type Props = {
  company: CompanyPublicInfo
}

/**
 * Spodná CTA na stránkach kategórie / podkategórie: za obsahovými blokmi, pred globálnymi blokmi pred pätičkou.
 */
export function ContentContactCtaSection({ company }: Props) {
  return (
    <section className="border-t border-border bg-muted/25 py-12 md:py-16 dark:bg-muted/10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:gap-14 lg:grid-cols-2 lg:items-start">
        <div className="min-w-0">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl lg:leading-tight">
            Kontaktujte nás
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Pre okamžitý zásah nám zavolajte alebo použite kontaktný formulár.
          </p>
        </div>
        <div className="min-w-0 lg:max-w-[340px] lg:justify-self-end">
          <PriceListContactBanner company={company} stickySidebar={false} />
        </div>
      </div>
    </section>
  )
}
