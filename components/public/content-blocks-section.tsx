import type { ContentBlock } from "@/lib/types"
import { GridBlock } from "@/components/content-blocks/block-types/grid-block"
import {
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
        compactSpacing ? "py-6 md:py-8" : "py-12 md:py-16"
      )}
    >
      <div className="flex flex-col gap-6 lg:gap-8">
        {sortedRoots.map((grid) => (
          <div key={grid.id} className="w-full">
            <GridBlock
              block={grid}
              children={byParent.get(grid.id) ?? []}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
