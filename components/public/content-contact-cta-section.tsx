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
    <section className="bg-muted py-22 md:py-26 dark:bg-muted mt-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:gap-14 lg:grid-cols-2 lg:items-start">
        <div className="min-w-0">
          <h2 className="text-3xl font-normal tracking-tight text-foreground md:text-4xl lg:text-5xl lg:leading-tight">
          Pre okamžitý zásah nám zavolajte alebo použite kontaktný formulár.
          </h2>

        </div>
        <div className="min-w-0 lg:max-w-[340px] lg:justify-self-end">
          <PriceListContactBanner company={company} stickySidebar={false} />
        </div>
      </div>
    </section>
  )
}
