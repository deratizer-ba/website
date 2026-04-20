import type { ComponentType } from "react"
import type { ContentBlock, SubBlockType } from "@/lib/types"
import { HeadingBlock } from "./heading-block"
import { TextBlock } from "./text-block"
import { IconHeadingTextBlock } from "./icon-heading-text-block"
import { ImageHeadingTextCenteredBlock } from "./image-heading-text-centered-block"
import { HeadingTextImageRightBlock } from "./heading-text-image-right-block"
import { MediaLeftTextRightBlock } from "./media-left-text-right-block"

export const contentBlockComponents: Record<
  SubBlockType,
  ComponentType<{ block: ContentBlock }>
> = {
  heading: HeadingBlock,
  text_block: TextBlock,
  icon_heading_text: IconHeadingTextBlock,
  image_heading_text_centered: ImageHeadingTextCenteredBlock,
  heading_text_image_right: HeadingTextImageRightBlock,
  media_left_text_right: MediaLeftTextRightBlock,
}
