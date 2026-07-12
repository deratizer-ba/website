"use client"

import { useEffect, useState } from "react"
import {
  CONSENT_DENIED,
  CONSENT_GRANTED,
  readStoredConsent,
  storeConsent,
  updateConsent,
  type ConsentChoice,
} from "@/lib/gtm"
import { cn } from "@/lib/utils"

export function CookieConsentBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = readStoredConsent()
    if (stored === "granted") {
      updateConsent(CONSENT_GRANTED)
      return
    }
    if (stored === "denied") {
      updateConsent(CONSENT_DENIED)
      return
    }
    setVisible(true)
  }, [])

  function applyChoice(choice: ConsentChoice) {
    storeConsent(choice)
    updateConsent(choice === "granted" ? CONSENT_GRANTED : CONSENT_DENIED)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Súhlas s cookies"
      className={cn(
        "fixed inset-x-0 bottom-0 z-[100]",
        "border-t border-zinc-800/80 bg-zinc-950/95 text-zinc-300 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
        <p className="text-[11px] leading-snug text-zinc-400 sm:text-xs">
          Používame cookies na meranie návštevnosti a marketing (Google Tag
          Manager). Súhlas môžete kedykoľvek zmeniť vymazaním cookies v
          prehliadači.
        </p>
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => applyChoice("denied")}
            className="px-2.5 py-1 text-[11px] text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline sm:text-xs"
          >
            Odmietnuť
          </button>
          <button
            type="button"
            onClick={() => applyChoice("granted")}
            className="rounded bg-brand px-2.5 py-1 text-[11px] font-medium text-white hover:bg-brand/90 sm:text-xs"
          >
            Prijať
          </button>
        </div>
      </div>
    </div>
  )
}
