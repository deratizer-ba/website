/** Kľúče v tabuľke `site_settings` pre firemné / fakturačné údaje a kontakt. */
export const COMPANY_SITE_SETTING_KEYS = [
  "company_display_name",
  "company_tagline",
  "company_street",
  "company_city",
  "company_zip",
  "company_country",
  "company_ico",
  "company_dic",
  "company_ic_dph",
  "company_iban",
  "company_phone",
  "company_email",
  "company_instagram_url",
  "company_facebook_url",
] as const

export type CompanySiteSettingKey = (typeof COMPANY_SITE_SETTING_KEYS)[number]

export type CompanyPublicInfo = {
  displayName: string
  tagline: string
  street: string
  city: string
  zip: string
  country: string
  ico: string
  dic: string
  icDph: string
  iban: string
  phone: string
  email: string
  instagramUrl: string
  facebookUrl: string
}

function getValue(
  rows: { key: string; value: string | null }[],
  key: CompanySiteSettingKey
): string {
  return rows.find((r) => r.key === key)?.value?.trim() ?? ""
}

export function mapRowsToCompanyInfo(
  rows: { key: string; value: string | null }[]
): CompanyPublicInfo {
  return {
    displayName: getValue(rows, "company_display_name") || "Deratizéri",
    tagline: getValue(rows, "company_tagline"),
    street: getValue(rows, "company_street"),
    city: getValue(rows, "company_city"),
    zip: getValue(rows, "company_zip"),
    country: getValue(rows, "company_country"),
    ico: getValue(rows, "company_ico"),
    dic: getValue(rows, "company_dic"),
    icDph: getValue(rows, "company_ic_dph"),
    iban: getValue(rows, "company_iban"),
    phone: getValue(rows, "company_phone"),
    email: getValue(rows, "company_email"),
    instagramUrl: getValue(rows, "company_instagram_url"),
    facebookUrl: getValue(rows, "company_facebook_url"),
  }
}

export function withHttps(url: string): string {
  const t = url.trim()
  if (!t) return ""
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}
