import type { ContentBlock, SubBlockType } from "@/lib/types"
import { contentBlockComponents } from "./block-types/registry"

type Props = {
  block: ContentBlock
}

function isSubBlockType(t: string): t is SubBlockType {
  return (
    t === "heading" ||
    t === "text_block" ||
    t === "icon_heading_text" ||
    t === "image_heading_text_centered" ||
    t === "heading_text_image_right" ||
    t === "media_left_text_right"
  )
}

/** Podblok v bunke gridu (`heading` / `text_block`). */
export function ContentBlockBody({ block }: Props) {
  if (!isSubBlockType(block.block_type)) return null
  const Cmp = contentBlockComponents[block.block_type]
  return <Cmp block={block} />
}
