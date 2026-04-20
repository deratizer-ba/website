/** Normalizácia `useParams()` segmentu (string | string[]). */
export function routeSegment(
  v: string | string[] | undefined
): string {
  if (typeof v === "string") return v
  if (Array.isArray(v) && typeof v[0] === "string") return v[0]
  return ""
}
