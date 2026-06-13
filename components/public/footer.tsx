import Link from "next/link"
import { Phone, Mail } from "lucide-react"
import type { Category } from "@/lib/types"
import { getCompanyPublicInfoCached } from "@/lib/get-company-settings-cached"
import { withHttps } from "@/lib/company-site-settings"
import { Separator } from "@/components/ui/separator"
import { SiteEmblem } from "@/components/public/site-emblem"
import { FooterDisinfectionSection } from "@/components/public/footer-disinfection-section"
import { cn } from "@/lib/utils"

type Props = {
  categories: Category[]
}

const iconCircleClass =
  "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 shadow-sm group-hover:border-zinc-500"

const socialIconClass = cn(
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900",
  "text-zinc-400 shadow-sm transition-colors"
)

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M13.5 22v-9.5h3.2l.5-3.7h-3.7V6.6c0-1.07.3-1.8 1.9-1.8h2V1.4C16.9 1.2 15.5 1 13.9 1 10.4 1 8 3 8 6.3v2.5H5v3.7h3V22h5.5z" />
    </svg>
  )
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function DetailLine({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <p className="text-xs text-zinc-400">
      <span className="font-medium text-zinc-300">{label}:</span>{" "}
      <span className="break-words">{value}</span>
    </p>
  )
}

export async function Footer({ categories }: Props) {
  const company = await getCompanyPublicInfoCached()
  const ig = withHttps(company.instagramUrl)
  const fb = withHttps(company.facebookUrl)
  const cityLine = [company.zip, company.city].filter(Boolean).join(" ")
  const hasAddress =
    Boolean(company.street || cityLine || company.country)
  const hasIds =
    Boolean(company.ico || company.dic || company.icDph || company.iban)
  const hasContactBlock =
    Boolean(company.phone || company.email || ig || fb)

  const defaultTagline =
    "Profesionálne služby deratizácie, dezinfekcie a dezinsekcie pre váš domov aj firmu."

  return (
    <footer className="relative mt-24 border-t border-zinc-800 bg-zinc-950 text-zinc-400">
      <div className="mx-auto w-full max-w-6xl px-4 py-22 lg:py-34">
        <FooterDisinfectionSection />

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4 space-y-4 lg:pr-2">
            <div>
              <Link
                href="/"
                aria-label="Domov"
                className="mb-3 inline-block transition-opacity hover:opacity-90"
              >
                <SiteEmblem className="h-10 w-10" decorative />
              </Link>
              <h3 className="font-semibold text-xl tracking-tight text-white">
                {company.displayName}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {company.tagline || defaultTagline}
              </p>
            </div>

            {(hasAddress || hasIds) && (
              <>
                <Separator className="bg-zinc-800" />
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Fakturačné údaje
                  </h4>
                  <div className="space-y-2 text-sm text-zinc-400">
                    {hasAddress && (
                      <address className="not-italic leading-relaxed space-y-0.5">
                        {company.street ? <p>{company.street}</p> : null}
                        {cityLine ? <p>{cityLine}</p> : null}
                        {company.country ? <p>{company.country}</p> : null}
                      </address>
                    )}
                    <div className="space-y-1.5 pt-1">
                      <DetailLine label="IČO" value={company.ico} />
                      <DetailLine label="DIČ" value={company.dic} />
                      <DetailLine label="IČ DPH" value={company.icDph} />
                      <DetailLine label="IBAN" value={company.iban} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Služby
            </h4>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/${cat.slug}`}
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Navigácia
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  Úvod
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  Kontakt
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  Administrátor
                </Link>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 lg:pl-2">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Kontakt
            </h4>
            {hasContactBlock ? (
              <div className="space-y-4">
                {company.phone ? (
                  <a
                    href={`tel:${company.phone.replace(/\s+/g, "")}`}
                    className="group flex items-start gap-3 text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    <span className={iconCircleClass}>
                      <Phone className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="leading-snug pt-1.5">{company.phone}</span>
                  </a>
                ) : null}
                {company.email ? (
                  <a
                    href={`mailto:${company.email}`}
                    className="group flex items-start gap-3 text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    <span className={iconCircleClass}>
                      <Mail className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="leading-snug pt-1.5 break-all">
                      {company.email}
                    </span>
                  </a>
                ) : null}
                {(ig || fb) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {fb ? (
                      <a
                        href={fb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          socialIconClass,
                          "hover:border-[#1877F2]/40 hover:text-[#1877F2]"
                        )}
                        aria-label="Facebook"
                      >
                        <FacebookGlyph className="h-4 w-4" />
                      </a>
                    ) : null}
                    {ig ? (
                      <a
                        href={ig}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          socialIconClass,
                          "hover:border-pink-500/35 hover:text-pink-600"
                        )}
                        aria-label="Instagram"
                      >
                        <InstagramGlyph className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">
                Údaje doplníte v administrácii v sekcii Firemné údaje.
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-zinc-800 pt-8 text-center text-sm text-zinc-500 sm:flex-row sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} {company.displayName}. Všetky
            práva vyhradené.
          </p>
        </div>
      </div>
    </footer>
  )
}
