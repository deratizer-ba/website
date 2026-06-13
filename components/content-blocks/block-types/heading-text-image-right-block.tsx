import { getHeadingTextImageRightData } from "@/lib/content-blocks"
import { BlockMedia } from "./block-media"
import { CtaLink } from "./cta-link"
import type { ContentBlockComponentProps } from "./registry"

type Props = ContentBlockComponentProps

export function HeadingTextImageRightBlock({ block, gridLayout = null }: Props) {
  const { heading, content, imageUrl, imageSize, ctaLabel, ctaUrl } = getHeadingTextImageRightData(block)
  const size = imageSize && imageSize > 0 ? imageSize : 70
  const hasCta = Boolean(ctaLabel?.trim() || ctaUrl?.trim())

  if (!imageUrl?.trim() && !heading?.trim() && !content?.trim() && !hasCta) return null

  return (
    <div className="space-y-2">
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
      <CtaLink label={ctaLabel} url={ctaUrl} />
      {imageUrl?.trim() ? (
        <div className="flex justify-end pt-1">
          <BlockMedia
            src={imageUrl.trim()}
            width={size}
            naturalHeight={gridLayout === "3x3"}
          />
        </div>
      ) : null}
    </div>
  )
}
