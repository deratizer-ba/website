import { getMediaLeftTextRightData } from "@/lib/content-blocks"
import { BlockMedia } from "./block-media"
import { CtaLink } from "./cta-link"
import type { ContentBlockComponentProps } from "./registry"

type Props = ContentBlockComponentProps

export function MediaLeftTextRightBlock({ block, gridLayout = null }: Props) {
  const { imageUrl, imageSize, heading, content, ctaLabel, ctaUrl } = getMediaLeftTextRightData(block)
  const size = imageSize && imageSize > 0 ? imageSize : 100
  const hasCta = Boolean(ctaLabel?.trim() || ctaUrl?.trim())

  if (!imageUrl?.trim() && !heading?.trim() && !content?.trim() && !hasCta) return null

  return (
    <div className="grid items-center gap-3 grid-cols-[auto_1fr]">
      <div className="flex items-center justify-start">
        {imageUrl?.trim() ? (
          <BlockMedia
            src={imageUrl.trim()}
            width={size}
            naturalHeight={gridLayout === "3x3"}
          />
        ) : null}
      </div>
      <div className="flex items-center">
        <div className="space-y-1">
          {heading?.trim() ? (
            <h3 className="text-2xl font-normal tracking-tight text-foreground">{heading.trim()}</h3>
          ) : null}
          {content?.trim() ? (
            <p className="text-muted-foreground leading-snug whitespace-pre-wrap">
              {content.trim()}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-2">
          <CtaLink label={ctaLabel} url={ctaUrl} />
        </div>
    </div>
  )
}
