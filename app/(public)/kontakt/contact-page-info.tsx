import { Separator } from "@/components/ui/separator"
import { PriceListContactBanner } from "@/components/public/price-list-section"
import type { CompanyPublicInfo } from "@/lib/company-site-settings"

function DetailLine({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{label}:</span>{" "}
      <span className="break-words">{value}</span>
    </p>
  )
}

export function ContactPageInfo({ company }: { company: CompanyPublicInfo }) {
  const cityLine = [company.zip, company.city].filter(Boolean).join(" ")
  const hasAddress = Boolean(company.street || cityLine || company.country)
  const hasBilling = Boolean(
    hasAddress || company.ico || company.dic || company.icDph || company.iban
  )

  return (
    <PriceListContactBanner
      company={company}
      showMessageButton={false}
    >
      {hasBilling ? (
        <>
          <Separator className="my-6" />
          <div>
            <h2 className="mb-3 text-xs font-normal uppercase tracking-wider text-muted-foreground">
              Fakturačné údaje
            </h2>
            <div className="space-y-2">
              {hasAddress ? (
                <address className="not-italic text-sm leading-relaxed text-muted-foreground">
                  {company.street ? <p>{company.street}</p> : null}
                  {cityLine ? <p>{cityLine}</p> : null}
                  {company.country ? <p>{company.country}</p> : null}
                </address>
              ) : null}
              <div className="space-y-1.5 pt-1">
                <DetailLine label="IČO" value={company.ico} />
                <DetailLine label="DIČ" value={company.dic} />
                <DetailLine label="IČ DPH" value={company.icDph} />
                <DetailLine label="IBAN" value={company.iban} />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </PriceListContactBanner>
  )
}
