import Image from "next/image"
import type { ContentBlock } from "@/lib/types"
import { getImageHeadingTextCenteredData } from "@/lib/content-blocks"
import { CtaLink } from "./cta-link"

type Props = {
  block: ContentBlock
}

export function ImageHeadingTextCenteredBlock({ block }: Props) {
  const { imageUrl, imageSize, heading, content, ctaLabel, ctaUrl } =
    getImageHeadingTextCenteredData(block)
  const size = imageSize && imageSize > 0 ? imageSize : 100
  const hasCta = Boolean(ctaLabel?.trim() || ctaUrl?.trim())

  if (!imageUrl?.trim() && !heading?.trim() && !content?.trim() && !hasCta) return null

  return (
    <div className="flex flex-col items-center text-center gap-2">
      {imageUrl?.trim() ? (
        <div className="relative aspect-square" style={{ width: size }}>
          <Image src={imageUrl.trim()} alt="" fill className="object-contain" />
        </div>
      ) : null}
      <div className="flex flex-col items-center gap-1">
        {heading?.trim() ? (
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{heading.trim()}</h3>
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
