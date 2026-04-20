import type { ContentBlock } from "@/lib/types"
import { getTextBlockData } from "@/lib/content-blocks"
import { CtaLink } from "./cta-link"

type Props = {
  block: ContentBlock
}

/**
 * Verejný náhľad / telo bloku typu `text_block`.
 * Dáta: `{ heading?: string; content: string }` v `block.data`.
 */
export function TextBlock({ block }: Props) {
  const { heading, content, ctaLabel, ctaUrl } = getTextBlockData(block)
  return (
    <div>
      <div className="space-y-1">
        {heading?.trim() ? (
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            {heading.trim()}
          </h2>
        ) : null}
        <p className="text-muted-foreground leading-snug whitespace-pre-wrap">
          {content}
        </p>
      </div>
      <div className="mt-2">
        <CtaLink label={ctaLabel} url={ctaUrl} />
      </div>
    
    </div>
  )
}
