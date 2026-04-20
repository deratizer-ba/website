import Image from "next/image"
import type { ContentBlock } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getIconHeadingTextData } from "@/lib/content-blocks"
import { CtaLink } from "./cta-link"

type Props = {
  block: ContentBlock
}

export function IconHeadingTextBlock({ block }: Props) {
  const { iconUrl, iconSize, heading, content, ctaLabel, ctaUrl } = getIconHeadingTextData(block)
  const size = iconSize && iconSize > 0 ? iconSize : 50
  const hasCta = Boolean(ctaLabel?.trim() || ctaUrl?.trim())

  if (!iconUrl?.trim() && !heading?.trim() && !content?.trim() && !hasCta) return null

  return (
    <div className="flex flex-col items-start gap-2">
      {iconUrl?.trim() ? (
        <div className={cn("relative aspect-square", size > 100 && "mx-auto")} style={{ width: size }}>
          <Image src={iconUrl.trim()} alt="" fill className="object-contain" />
        </div>
      ) : null}
      <div className="flex flex-col items-start gap-1">
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
