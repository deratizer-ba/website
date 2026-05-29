import type { ContentBlock } from "@/lib/types"
import { GridBlock } from "@/components/content-blocks/block-types/grid-block"
import {
  getGridHasBackground,
  groupChildBlocksByParent,
  isRootGridBlock,
} from "@/lib/content-blocks"
import { cn } from "@/lib/utils"

type Props = {
  blocks: ContentBlock[]
  compactSpacing?: boolean
}

export function ContentBlocksSection({ blocks, compactSpacing = false }: Props) {
  const roots = blocks.filter(isRootGridBlock)
  if (roots.length === 0) return null

  const sortedRoots = [...roots].sort((a, b) => {
    const o = a.display_order - b.display_order
    return o !== 0 ? o : a.id.localeCompare(b.id)
  })

  const byParent = groupChildBlocksByParent(blocks)

  return (
    <section
      className={cn(
        "mx-auto w-full max-w-6xl px-4",
        compactSpacing ? "" : ""
      )}
    >
      <div className="flex flex-col">
        {sortedRoots.map((grid, index) => {
          const previousGrid =
            index > 0 ? sortedRoots[index - 1] : undefined
          const nextGrid =
            index < sortedRoots.length - 1
              ? sortedRoots[index + 1]
              : undefined
          return (
            <div key={grid.id} className="w-full">
              <GridBlock
                block={grid}
                children={byParent.get(grid.id) ?? []}
                previousGridHadBackground={
                  previousGrid !== undefined
                    ? getGridHasBackground(previousGrid)
                    : null
                }
                nextGridHadBackground={
                  nextGrid !== undefined
                    ? getGridHasBackground(nextGrid)
                    : null
                }
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
