import type { ContentBlock } from "@/lib/types"
import { ContentBlockBody } from "@/components/content-blocks/content-block-body"
import {
  getGridHasBackground,
  getGridLayout,
  gridBackgroundClass,
  gridLayoutCellCount,
  publicGridColsClass,
  sortChildBlocks,
} from "@/lib/content-blocks"

type Props = {
  block: ContentBlock
  /** Všetky podbloky tohto gridu (rovnaký `parent_id` ako `block.id`). */
  children: ContentBlock[]
}

/**
 * Koreňový blok: mriežka buniek, v každej bunke podbloky v plnej šírke bunky.
 */
export function GridBlock({ block, children }: Props) {
  const layout = getGridLayout(block)
  if (!layout) return null
  const hasBackground = getGridHasBackground(block)
  const n = gridLayoutCellCount(layout)
  const sorted = sortChildBlocks(children)
  const byCell = new Map<number, ContentBlock[]>()
  for (let i = 0; i < n; i++) byCell.set(i, [])
  for (const c of sorted) {
    if (c.cell_index >= 0 && c.cell_index < n) {
      byCell.get(c.cell_index)!.push(c)
    }
  }

  return (
    <div
      className={`grid w-full gap-6 lg:gap-8 ${publicGridColsClass(layout)} ${gridBackgroundClass(hasBackground)}`}
    >
      {Array.from({ length: n }, (_, cellIndex) => (
        <div
          key={cellIndex}
          className="min-w-0 flex flex-col gap-6"
        >
          {byCell.get(cellIndex)?.map((sub) => (
            <div key={sub.id} className="min-w-0 w-full">
              <ContentBlockBody block={sub} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
