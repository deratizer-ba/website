/** Verejný názov webu / firmy v title (voliteľné). Napr. NEXT_PUBLIC_SITE_NAME=Deratizeri Bratislava */
export function getSiteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME?.trim() ?? ""
}

/** Koreňová URL bez koncového lomítka. Napr. NEXT_PUBLIC_SITE_URL=https://deratizeri.sk */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "").replace(/\/$/, "")
}

export function joinWithPipe(...parts: (string | null | undefined)[]): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(" | ")
}

/** Segmenty stránky + voliteľný názov webu z ENV (bez natvrdo v kóde). */
export function buildMetaTitle(...segments: string[]): string {
  const siteName = getSiteName()
  const all = siteName ? [...segments, siteName] : segments
  return joinWithPipe(...all)
}

export function absoluteSitePath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  const base = getSiteUrl()
  return base ? `${base}${normalized}` : normalized
}
