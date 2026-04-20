import { createPublicSupabaseClient } from "@/lib/supabase/public"
import type { ContentBlock, SiteRegionKey } from "@/lib/types"

type SectionNodeRow = {
  id: string
  parent_id: string | null
  cell_index: number
  block_type: ContentBlock["block_type"]
  data: Record<string, unknown>
  display_order: number
  created_at: string
  updated_at: string
}

function toContentBlock(node: SectionNodeRow): ContentBlock {
  return {
    id: node.id,
    category_id: null,
    subcategory_id: null,
    parent_id: node.parent_id,
    cell_index: node.cell_index,
    block_type: node.block_type,
    data: node.data,
    display_order: node.display_order,
    created_at: node.created_at,
    updated_at: node.updated_at,
  }
}

export async function loadRegionBlocks(
  regionKey: SiteRegionKey
): Promise<ContentBlock[]> {
  const supabase = createPublicSupabaseClient()
  const { data: regionItems, error: regionError } = await supabase
    .from("site_region_items")
    .select("section_id")
    .eq("region_key", regionKey)
    .order("display_order", { ascending: true })

  if (regionError || !regionItems || regionItems.length === 0) return []

  const sectionIds = regionItems.map((item) => item.section_id)
  const { data: sectionNodes, error: nodesError } = await supabase
    .from("reusable_section_nodes")
    .select(
      "id, section_id, parent_id, cell_index, block_type, data, display_order, created_at, updated_at"
    )
    .in("section_id", sectionIds)

  if (nodesError || !sectionNodes) return []

  const sectionRank = new Map<string, number>()
  sectionIds.forEach((id, index) => {
    if (!sectionRank.has(id)) sectionRank.set(id, index)
  })

  const sorted = [...sectionNodes].sort((a, b) => {
    const ar = sectionRank.get(a.section_id) ?? Number.MAX_SAFE_INTEGER
    const br = sectionRank.get(b.section_id) ?? Number.MAX_SAFE_INTEGER
    if (ar !== br) return ar - br
    if (a.parent_id === null && b.parent_id !== null) return -1
    if (a.parent_id !== null && b.parent_id === null) return 1
    if (a.cell_index !== b.cell_index) return a.cell_index - b.cell_index
    if (a.display_order !== b.display_order) return a.display_order - b.display_order
    return a.id.localeCompare(b.id)
  })

  return sorted.map(toContentBlock)
}
