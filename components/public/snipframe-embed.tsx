"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

const EMBED_API =
  "https://www.snipframe.com/api/embed/site/f3d147fae3528be281c2944234f19d4a"
const HOST = "deratizeri-bratislava.sk"
const SCRIPT_SRC = "https://www.snipframe.com/snipframe-embed.js"

export function SnipframeEmbed() {
  const rootRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const path = window.location.pathname + window.location.search
    const q = new URLSearchParams({ path, host: HOST })

    let cancelled = false

    fetch(`${EMBED_API}?${q}`, { headers: { Accept: "text/html" } })
      .then((r) => r.text())
      .then((html) => {
        if (cancelled || !html?.trim()) return
        root.innerHTML = html
        if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
          const s = document.createElement("script")
          s.src = SCRIPT_SRC
          s.async = true
          document.body.appendChild(s)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
      root.innerHTML = ""
    }
  }, [pathname])

  return <div id="snipframe" ref={rootRef} />
}
