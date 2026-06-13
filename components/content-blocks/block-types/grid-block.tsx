import type { ContentBlock } from "@/lib/types"
import { ContentBlockBody } from "@/components/content-blocks/content-block-body"
import {
  getGridHasBackground,
  getGridLayout,
  gridCompactContentClass,
  gridPublicBackgroundClass,
  gridPublicTopMarginClass,
  gridLayoutCellCount,
  publicGridColsClass,
  sortChildBlocks,
} from "@/lib/content-blocks"
import { cn } from "@/lib/utils"

type Props = {
  block: ContentBlock
  /** Všetky podbloky tohto gridu (rovnaký `parent_id` ako `block.id`). */
  children: ContentBlock[]
  /** Pozadie predchádzajúcej koreňovej mriežky; `null` = žiadna predchádzajúca. */
  previousGridHadBackground?: boolean | null
  /** Pozadie nasledujúcej koreňovej mriežky; `null` = žiadna nasledujúca. */
  nextGridHadBackground?: boolean | null
}

/**
 * Koreňový blok: mriežka buniek, v každej bunke podbloky v plnej šírke bunky.
 */
export function GridBlock({
  block,
  children,
  previousGridHadBackground = null,
  nextGridHadBackground = null,
}: Props) {
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
      className={cn(
        "grid w-full",
        layout === "3x3" ? "gap-3 md:gap-6" : "gap-6 lg:gap-8",
        publicGridColsClass(layout),
        gridCompactContentClass(layout),
        gridPublicBackgroundClass(
          hasBackground,
          previousGridHadBackground,
          nextGridHadBackground
        ),
        gridPublicTopMarginClass(hasBackground, previousGridHadBackground)
      )}
    >
      {Array.from({ length: n }, (_, cellIndex) => (
        <div
          key={cellIndex}
          className={cn(
            "min-w-0 flex flex-col",
            layout === "3x3" ? "gap-3 md:gap-6" : "gap-6"
          )}
        >
          {byCell.get(cellIndex)?.map((sub) => (
            <div key={sub.id} className="min-w-0 w-full">
              <ContentBlockBody block={sub} gridLayout={layout} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
