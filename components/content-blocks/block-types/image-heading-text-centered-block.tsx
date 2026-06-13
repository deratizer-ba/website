import { getImageHeadingTextCenteredData } from "@/lib/content-blocks"
import { BlockMedia } from "./block-media"
import { CtaLink } from "./cta-link"
import type { ContentBlockComponentProps } from "./registry"

type Props = ContentBlockComponentProps

export function ImageHeadingTextCenteredBlock({ block, gridLayout = null }: Props) {
  const { imageUrl, imageSize, heading, content, ctaLabel, ctaUrl } =
    getImageHeadingTextCenteredData(block)
  const size = imageSize && imageSize > 0 ? imageSize : 100
  const hasCta = Boolean(ctaLabel?.trim() || ctaUrl?.trim())

  if (!imageUrl?.trim() && !heading?.trim() && !content?.trim() && !hasCta) return null

  return (
    <div className="flex flex-col items-center text-center gap-2">
      {imageUrl?.trim() ? (
        <BlockMedia
          src={imageUrl.trim()}
          width={size}
          naturalHeight={gridLayout === "3x3"}
        />
      ) : null}
      <div className="flex flex-col items-center gap-1">
        {heading?.trim() ? (
          <h3 className="text-2xl font-normal tracking-tight text-foreground">{heading.trim()}</h3>
        ) : null}
        {content?.trim() ? (
          <p className="text-muted-foreground leading-snug whitespace-pre-wrap">
            {content.trim()}
          </p>
        ) : null}
      </div>
      <div className="mt-1">
        <CtaLink label={ctaLabel} url={ctaUrl} />
      </div>
    </div>
  )
}
