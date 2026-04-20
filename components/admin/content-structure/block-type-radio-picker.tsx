"use client"

import type { ContentBlock, SubBlockType } from "@/lib/types"
import {
  getHeadingData,
  getHeadingTextImageRightData,
  getIconHeadingTextData,
  getImageHeadingTextCenteredData,
  getMediaLeftTextRightData,
  getTextBlockData,
  sampleContentBlock,
  SUB_BLOCK_TYPES,
} from "@/lib/content-blocks"
import { cn } from "@/lib/utils"

type Props = {
  value: SubBlockType
  onChange: (type: SubBlockType) => void
}

function PreviewDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full flex border-2 border-black bg-transparent",
        className ?? "size-12"
      )}
    />
  )
}

function BlockTypePreview({ block }: { block: ContentBlock }) {
  if (block.block_type === "heading") {
    const { title, ctaLabel } = getHeadingData(block)
    return (
      <div className="space-y-3">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">{title}</h3>
        <div className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm">
          {ctaLabel || "Viac informácií"}
        </div>
      </div>
    )
  }

  if (block.block_type === "text_block") {
    const { heading, content, ctaLabel } = getTextBlockData(block)
    return (
      <div className="space-y-3">
        {heading ? (
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{heading}</h3>
        ) : null}
        <p className="text-muted-foreground leading-snug whitespace-pre-wrap">{content}</p>
        <div className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm">
          {ctaLabel || "Viac informácií"}
        </div>
      </div>
    )
  }

  if (block.block_type === "icon_heading_text") {
    const { heading, content, ctaLabel } = getIconHeadingTextData(block)
    return (
      <div className="space-y-3">
        <PreviewDot className="size-8" />
        <div className="space-y-2">
          {heading ? (
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{heading}</h3>
          ) : null}
          {content ? (
            <p className="text-muted-foreground leading-snug whitespace-pre-wrap">{content}</p>
          ) : null}
        </div>
        <div className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm">
          {ctaLabel || "Viac informácií"}
        </div>
      </div>
    )
  }

  if (block.block_type === "image_heading_text_centered") {
    const { heading, content, ctaLabel } = getImageHeadingTextCenteredData(block)
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <PreviewDot />
        <div className="flex flex-col items-center gap-2">
          {heading ? (
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{heading}</h3>
          ) : null}
          {content ? (
            <p className="text-muted-foreground leading-snug whitespace-pre-wrap">{content}</p>
          ) : null}
        </div>
        <div className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm">
          {ctaLabel || "Viac informácií"}
        </div>
      </div>
    )
  }

  if (block.block_type === "heading_text_image_right") {
    const { heading, content, ctaLabel } = getHeadingTextImageRightData(block)
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          {heading ? (
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{heading}</h3>
          ) : null}
          {content ? (
            <p className="text-muted-foreground leading-snug whitespace-pre-wrap">{content}</p>
          ) : null}
        </div>
        <div className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm">
          {ctaLabel || "Viac informácií"}
        </div>
        <div className="flex justify-end">
          <PreviewDot />
        </div>
      </div>
    )
  }

  const { heading, content, ctaLabel } = getMediaLeftTextRightData(block)
  return (
    <div className="grid grid-cols-[auto_1fr] items-start gap-4">
      <PreviewDot />
      <div className="space-y-3">
        <div className="space-y-2">
          {heading ? (
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{heading}</h3>
          ) : null}
          {content ? (
            <p className="text-muted-foreground leading-snug whitespace-pre-wrap">{content}</p>
          ) : null}
        </div>
        <div className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm">
          {ctaLabel || "Viac informácií"}
        </div>
      </div>
    </div>
  )
}

export function BlockTypeRadioPicker({ value, onChange }: Props) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-8 md:gap-y-16 xl:gap-x-12">
        {SUB_BLOCK_TYPES.map((type) => {
          const selected = value === type
          const sampleBlock = sampleContentBlock(type)
          return (
            <label
              key={type}
              className={cn(
                "block cursor-pointer rounded-md border transition-all",
                selected
                  ? "border-primary"
                  : "border-border hover:opacity-80"
              )}
            >
              <input
                type="radio"
                name="block-type"
                className="sr-only"
                checked={selected}
                onChange={() => onChange(type)}
              />
              <div className="flex min-h-[168px] items-center justify-center rounded-md bg-background p-4">
                <div className={cn("w-full", selected ? "scale-[1.02]" : "")}>
                  <BlockTypePreview block={sampleBlock} />
                </div>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
