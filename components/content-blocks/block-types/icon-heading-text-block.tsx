import { cn } from "@/lib/utils"
import { getIconHeadingTextData } from "@/lib/content-blocks"
import { BlockMedia } from "./block-media"
import { CtaLink } from "./cta-link"
import type { ContentBlockComponentProps } from "./registry"

type Props = ContentBlockComponentProps

export function IconHeadingTextBlock({ block, gridLayout = null }: Props) {
  const { iconUrl, iconSize, heading, content, ctaLabel, ctaUrl } = getIconHeadingTextData(block)
  const size = iconSize && iconSize > 0 ? iconSize : 50
  const hasCta = Boolean(ctaLabel?.trim() || ctaUrl?.trim())

  if (!iconUrl?.trim() && !heading?.trim() && !content?.trim() && !hasCta) return null

  return (
    <div className="flex flex-col items-start gap-2">
      {iconUrl?.trim() ? (
        <BlockMedia
          src={iconUrl.trim()}
          width={size}
          naturalHeight={gridLayout === "3x3"}
          wrapperClassName={cn(size > 100 && "mx-auto")}
        />
      ) : null}
      <div className="flex flex-col items-start gap-1">
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
