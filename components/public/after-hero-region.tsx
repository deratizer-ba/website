import { ContentBlocksSection } from "@/components/public/content-blocks-section"
import { loadRegionBlocks } from "@/lib/reusable-sections"

export async function AfterHeroRegion() {
  const blocks = await loadRegionBlocks("after_hero")
  if (blocks.length === 0) return null

  return <ContentBlocksSection blocks={blocks} compactSpacing />
}
