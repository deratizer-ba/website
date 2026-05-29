export function buildServiceDescription(
  primary: string | null | undefined,
  fallback?: string | null | undefined,
  maxLength = 160
): string | undefined {
  const text = (primary?.trim() || fallback?.trim() || "").replace(/\s+/g, " ")
  if (!text) return undefined
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}
