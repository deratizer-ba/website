export const GTM_ID =
  process.env.NEXT_PUBLIC_GTM_ID?.trim() || "GTM-MPMJ3VDP"

export const CONSENT_STORAGE_KEY = "cookie_consent_v2"

export type ConsentChoice = "granted" | "denied"

export type ConsentState = {
  ad_storage: ConsentChoice
  analytics_storage: ConsentChoice
  ad_user_data: ConsentChoice
  ad_personalization: ConsentChoice
}

export const CONSENT_DENIED: ConsentState = {
  ad_storage: "denied",
  analytics_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
}

export const CONSENT_GRANTED: ConsentState = {
  ad_storage: "granted",
  analytics_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    gtag?: (...args: unknown[]) => void
  }
}

export function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}

export function updateConsent(state: ConsentState) {
  if (typeof window === "undefined") return

  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", state)
  } else {
    // GTM / gtag ešte nie je načítaný — push do dataLayer funguje rovnako
    window.dataLayer.push(["consent", "update", state])
  }
}

export function readStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (value === "granted" || value === "denied") return value
  } catch {
    // localStorage môže byť zablokovaný
  }
  return null
}

export function storeConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice)
  } catch {
    // ignore
  }
}

/** Kompatibilita s pôvodným PHP dataLayer eventom po odoslaní formulára. */
export function pushFormSubmission(data: {
  email: string
  name: string
  text: string
}) {
  pushDataLayer({
    event: "formSubmission",
    email: data.email,
    name: data.name,
    text: data.text,
  })
}
