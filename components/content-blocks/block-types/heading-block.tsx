import type { ContentBlock } from "@/lib/types"
import { getHeadingData } from "@/lib/content-blocks"
import { CtaLink } from "./cta-link"

type Props = {
  block: ContentBlock
}

/**
 * Verejný náhľad / telo bloku typu `heading`.
 * Dáta: `{ title: string }` v `block.data`.
 */
export function HeadingBlock({ block }: Props) {
  const { title, ctaLabel, ctaUrl } = getHeadingData(block)
  const t = title.trim()
  const hasCta = Boolean(ctaLabel?.trim() || ctaUrl?.trim())
  if (!t && !hasCta) return null
  return (
    <div className="space-y-2">
      {t ? (
        <h2 className="text-4xl font-bold tracking-tight text-foreground">
          {t}
        </h2>
      ) : null}
      <CtaLink label={ctaLabel} url={ctaUrl} />
    </div>
  )
}
