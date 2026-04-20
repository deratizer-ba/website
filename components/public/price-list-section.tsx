import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  type CompanyPublicInfo,
  withHttps,
} from "@/lib/company-site-settings"
import type { PriceListItem } from "@/lib/types"

type PriceListSubsection = {
  title: string
  items: PriceListItem[]
}

export type PriceListContentProps = {
  title: string
  items: PriceListItem[]
  subcategories?: PriceListSubsection[]
}

function PriceListRows({ items }: { items: PriceListItem[] }) {
  if (items.length === 0) return null

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={
            index % 2 === 0
              ? "flex items-center gap-4 bg-background px-4 py-3.5"
              : "flex items-center gap-4 bg-muted/40 px-4 py-3.5"
          }
        >
          <p className="min-w-0 flex-1 text-sm font-medium leading-snug">
            {item.name}
          </p>
          {(item.price ?? "").trim() ? (
            <p className="shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums">
              {item.price}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )
}

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

function ContactRow({
  icon,
  children,
}: {
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-sm leading-relaxed">{children}</div>
    </div>
  )
}

export function PriceListContactBanner({ company }: { company: CompanyPublicInfo }) {
  const addressLine = [company.street, [company.zip, company.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ")
  const locationLine = [addressLine, company.country].filter(Boolean).join(" · ")

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="">
        <div className="mb-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0">
              <p className="font-semibold tracking-tight">
                {company.displayName}
              </p>
              {company.tagline ? (
                <p className="mt-1 text-sm text-muted-foreground">{company.tagline}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {company.phone ? (
            <ContactRow icon={<Phone className="h-4 w-4" aria-hidden />}>
              <a
                href={`tel:${company.phone.replace(/\s/g, "")}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {company.phone}
              </a>
            </ContactRow>
          ) : null}

          <ContactRow icon={<Mail className="h-4 w-4" aria-hidden />}>
            <a
              href={`mailto:${company.email}`}
              className="block max-w-[280px] rounded-md outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Otvoriť e-mailový klient"
            >
              <span className="relative block h-6  w-[80%]">
                <Image
                  src="/mailpic.jpg"
                  alt=""
                  fill
                  className="object-contain object-left dark:invert"
                  sizes="280px"
                />
              </span>
              <p className="text-xs font-medium text-foreground">
                Ochrana proti spamu
              </p>
            </a>
          </ContactRow>

          {(company.instagramUrl || company.facebookUrl) ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {company.instagramUrl ? (
                <a
                  href={withHttps(company.instagramUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-7 items-center gap-1 px-1 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <InstagramGlyph className="h-4 w-4 shrink-0" />
                  Instagram
                </a>
              ) : null}
              {company.facebookUrl ? (
                <a
                  href={withHttps(company.facebookUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-7 items-center gap-1 px-1 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FacebookGlyph className="h-4 w-4 shrink-0" />
                  Facebook
                </a>
              ) : null}
            </div>
          ) : null}

          <Button
            variant="default"
            className="bg-brand mt-4"
            size="lg"
            nativeButton={false}
            render={<Link href="/kontakt" />}
          >
            <MessageCircle className="h-4 w-4" />
            Napísať správu
          </Button>
        </div>
      </div>
    </aside>
  )
}

export function PriceListWithContactGrid({
  company,
  children,
}: {
  company: CompanyPublicInfo
  children: ReactNode
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start">
        <PriceListContactBanner company={company} />
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}

export function PriceListContent({
  title,
  items,
  subcategories = [],
}: PriceListContentProps) {
  const hasCategoryItems = items.length > 0
  const hasSubcategories = subcategories.some((sub) => sub.items.length > 0)

  if (!hasCategoryItems && !hasSubcategories) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>

      <div className="space-y-6">
        {hasCategoryItems ? <PriceListRows items={items} /> : null}

        {subcategories.map((subcategory) =>
          subcategory.items.length > 0 ? (
            <div key={subcategory.title} className="space-y-3">
              <h3 className="text-lg font-semibold">{subcategory.title}</h3>
              <PriceListRows items={subcategory.items} />
            </div>
          ) : null
        )}
      </div>
    </div>
  )
}

/** Cenník + kontaktný banner v mriežke (vľavo kontakt, vpravo cenník). */
export function PriceListSection({
  company,
  title,
  items,
  subcategories = [],
}: PriceListContentProps & { company: CompanyPublicInfo }) {
  const content = (
    <PriceListContent title={title} items={items} subcategories={subcategories} />
  )

  return (
    <PriceListWithContactGrid company={company}>{content}</PriceListWithContactGrid>
  )
}
