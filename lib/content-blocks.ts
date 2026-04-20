import type {
  ContentBlock,
  ContentBlockType,
  GridLayoutId,
  SubBlockType,
} from "@/lib/types"

export const GRID_LAYOUT_IDS: GridLayoutId[] = [
  "1",
  "2",
  "3",
  "4",
  "2x2",
  "3x3",
]

export const GRID_LAYOUT_LABELS: Record<GridLayoutId, string> = {
  "1": "1 stĺpec",
  "2": "2 stĺpce",
  "3": "3 stĺpce",
  "4": "4 stĺpce",
  "2x2": "Mriežka 2×2",
  "3x3": "Mriežka 3×3",
}

/** Počet buniek v grid layoute. */
export function gridLayoutCellCount(layout: GridLayoutId): number {
  switch (layout) {
    case "1":
      return 1
    case "2":
      return 2
    case "3":
      return 3
    case "4":
      return 4
    case "2x2":
      return 4
    case "3x3":
      return 9
    default: {
      const _x: never = layout
      return _x
    }
  }
}

export function isGridLayoutId(v: string): v is GridLayoutId {
  return (GRID_LAYOUT_IDS as readonly string[]).includes(v)
}

/** Tailwind triedy pre verejný web (responzívne stĺpce). */
export function publicGridColsClass(layout: GridLayoutId): string {
  switch (layout) {
    case "1":
      return "grid-cols-1"
    case "2":
      return "grid-cols-1 md:grid-cols-2"
    case "3":
      return "grid-cols-1 md:grid-cols-3"
    case "4":
      return "grid-cols-2 md:grid-cols-4"
    case "2x2":
      return "grid-cols-2"
    case "3x3":
      return "grid-cols-3"
    default: {
      const _e: never = layout
      return _e
    }
  }
}

/** Admin editor: mriežka podľa zvoleného layoutu (počet stĺpcov je na prvý pohľad zrejmý). */
export function adminEditorGridColsClass(layout: GridLayoutId): string {
  switch (layout) {
    case "1":
      return "grid-cols-1"
    case "2":
      return "grid-cols-1 sm:grid-cols-2"
    case "3":
      return "grid-cols-1 sm:grid-cols-3"
    case "4":
      return "grid-cols-2 sm:grid-cols-4"
    case "2x2":
      return "grid-cols-2"
    case "3x3":
      return "grid-cols-3"
    default: {
      const _e: never = layout
      return _e
    }
  }
}

export function getGridLayout(block: ContentBlock): GridLayoutId | null {
  if (block.block_type !== "grid") return null
  const d = block.data as Record<string, unknown>
  const raw = d.layout
  if (typeof raw === "string" && isGridLayoutId(raw)) return raw
  return null
}

export function getGridHasBackground(block: ContentBlock): boolean {
  if (block.block_type !== "grid") return false
  const d = block.data as Record<string, unknown>
  return d.has_background === true
}

export function gridBackgroundClass(hasBackground: boolean): string {
  return hasBackground
    ? "rounded-2xl bg-muted/80 p-5 md:p-6"
    : ""
}

export function isRootGridBlock(block: ContentBlock): boolean {
  return block.parent_id === null && block.block_type === "grid"
}

export function isSubBlock(block: ContentBlock): block is ContentBlock & {
  block_type: SubBlockType
} {
  return (
    block.parent_id !== null &&
    (block.block_type === "heading" ||
      block.block_type === "text_block" ||
      block.block_type === "icon_heading_text" ||
      block.block_type === "image_heading_text_centered" ||
      block.block_type === "heading_text_image_right" ||
      block.block_type === "media_left_text_right")
  )
}

/** Podbloky zoradené podľa bunky a poradia vnútri bunky. */
export function sortChildBlocks(children: ContentBlock[]): ContentBlock[] {
  return [...children].sort((a, b) => {
    if (a.cell_index !== b.cell_index) return a.cell_index - b.cell_index
    const o = a.display_order - b.display_order
    return o !== 0 ? o : a.id.localeCompare(b.id)
  })
}

export function groupChildBlocksByParent(
  blocks: ContentBlock[]
): Map<string, ContentBlock[]> {
  const m = new Map<string, ContentBlock[]>()
  for (const b of blocks) {
    if (!b.parent_id) continue
    const list = m.get(b.parent_id) ?? []
    list.push(b)
    m.set(b.parent_id, list)
  }
  for (const [, list] of m) {
    sortChildBlocks(list)
  }
  return m
}

export const SUB_BLOCK_TYPES: SubBlockType[] = [
  "heading",
  "text_block",
  "icon_heading_text",
  "image_heading_text_centered",
  "heading_text_image_right",
  "media_left_text_right",
]

/** Len typy zobrazované v katalógu Komponenty / bočný panel (bez gridu). */
export const KOMPONENT_CATALOG_TYPES: SubBlockType[] = [
  "heading",
  "text_block",
  "icon_heading_text",
  "image_heading_text_centered",
  "heading_text_image_right",
  "media_left_text_right",
]

export const CONTENT_BLOCK_LABELS: Record<SubBlockType, string> = {
  heading: "Nadpis",
  text_block: "Textový blok",
  icon_heading_text: "Ikona + nadpis + text",
  image_heading_text_centered: "Vycentrovaný obrázok + nadpis + text",
  heading_text_image_right: "Nadpis + text + obrázok vpravo",
  media_left_text_right: "2 stĺpce: obrázok vľavo, text vpravo",
}

export type ContentBlockLayout = "full" | "grid"

/**
 * @deprecated Pri gridoch už neplatí pre podbloky; ponechané len kvôli starým importom.
 */
export const CONTENT_BLOCK_LAYOUT: Record<SubBlockType, ContentBlockLayout> = {
  heading: "full",
  text_block: "grid",
  icon_heading_text: "grid",
  image_heading_text_centered: "grid",
  heading_text_image_right: "grid",
  media_left_text_right: "grid",
}

export const CONTENT_BLOCK_DATA_FIELDS: Record<
  SubBlockType,
  { key: string; label: string; required?: boolean }[]
> = {
  heading: [
    { key: "title", label: "Nadpis" },
    { key: "cta_label", label: "CTA text tlačidla" },
    { key: "cta_url", label: "CTA URL" },
  ],
  text_block: [
    { key: "heading", label: "Nadpis v karte" },
    { key: "content", label: "Text" },
    { key: "cta_label", label: "CTA text tlačidla" },
    { key: "cta_url", label: "CTA URL" },
  ],
  icon_heading_text: [
    { key: "icon_url", label: "URL ikony" },
    { key: "icon_size", label: "Šírka ikony (px)" },
    { key: "heading", label: "Nadpis" },
    { key: "content", label: "Text" },
    { key: "cta_label", label: "CTA text tlačidla" },
    { key: "cta_url", label: "CTA URL" },
  ],
  image_heading_text_centered: [
    { key: "image_url", label: "URL obrázka" },
    { key: "image_size", label: "Šírka obrázka (px)" },
    { key: "heading", label: "Nadpis" },
    { key: "content", label: "Text" },
    { key: "cta_label", label: "CTA text tlačidla" },
    { key: "cta_url", label: "CTA URL" },
  ],
  heading_text_image_right: [
    { key: "heading", label: "Nadpis" },
    { key: "content", label: "Text" },
    { key: "image_url", label: "URL obrázka" },
    { key: "image_size", label: "Šírka obrázka (px)" },
    { key: "cta_label", label: "CTA text tlačidla" },
    { key: "cta_url", label: "CTA URL" },
  ],
  media_left_text_right: [
    { key: "image_url", label: "URL obrázka" },
    { key: "image_size", label: "Šírka obrázka (px)" },
    { key: "heading", label: "Nadpis" },
    { key: "content", label: "Text" },
    { key: "cta_label", label: "CTA text tlačidla" },
    { key: "cta_url", label: "CTA URL" },
  ],
}

const SAMPLE_ISO = "1970-01-01T00:00:00.000Z"

export function sampleContentBlock(blockType: SubBlockType): ContentBlock {
  const base = {
    id: `sample-${blockType}`,
    category_id: null,
    subcategory_id: null,
    parent_id: null,
    cell_index: 0,
    block_type: blockType as ContentBlockType,
    display_order: 0,
    created_at: SAMPLE_ISO,
    updated_at: SAMPLE_ISO,
  }
  if (blockType === "heading") {
    return {
      ...base,
      data: { title: "Vzorový nadpis", cta_label: "Kontaktujte nás", cta_url: "/kontakt" },
    }
  }
  if (blockType === "icon_heading_text") {
    return {
      ...base,
      data: {
        icon_url: "/underline_double.svg",
        icon_size: 50,
        heading: "Nadpis bloku",
        content: "Voliteľný popis pod nadpisom.",
        cta_label: "Viac informácií",
        cta_url: "/kontakt",
      },
    }
  }
  if (blockType === "image_heading_text_centered") {
    return {
      ...base,
      data: {
        image_url: "/roach.png",
        image_size: 100,
        heading: "Nadpis bloku",
        content: "Voliteľný text pod nadpisom.",
        cta_label: "Viac informácií",
        cta_url: "/kontakt",
      },
    }
  }
  if (blockType === "heading_text_image_right") {
    return {
      ...base,
      data: {
        heading: "Nadpis bloku",
        content: "Text bloku. Obrázok je zarovnaný doprava.",
        image_url: "/roachfront.png",
        image_size: 70,
        cta_label: "Viac informácií",
        cta_url: "/kontakt",
      },
    }
  }
  if (blockType === "media_left_text_right") {
    return {
      ...base,
      data: {
        image_url: "/bedbug.png",
        image_size: 100,
        heading: "Nadpis vpravo",
        content: "Voliteľný text v pravom stĺpci.",
        cta_label: "Viac informácií",
        cta_url: "/kontakt",
      },
    }
  }
  return {
    ...base,
    data: {
      heading: "Voliteľný nadpis v karte",
      content:
        "Vzorový text bloku. Na stránke sem patrí popis služby, výhody alebo krátky odsek.",
      cta_label: "Viac informácií",
      cta_url: "/kontakt",
    },
  }
}

export type HeadingBlockData = { title: string } & BlockCtaData
export type BlockCtaData = {
  ctaLabel?: string
  ctaUrl?: string
}
export type TextBlockData = { heading?: string; content: string } & BlockCtaData
export type IconHeadingTextData = {
  iconUrl?: string
  iconSize?: number
  heading?: string
  content?: string
} & BlockCtaData
export type ImageHeadingTextCenteredData = {
  imageUrl?: string
  imageSize?: number
  heading?: string
  content?: string
} & BlockCtaData
export type HeadingTextImageRightData = {
  heading?: string
  content?: string
  imageUrl?: string
  imageSize?: number
} & BlockCtaData
export type MediaLeftTextRightData = {
  imageUrl?: string
  imageSize?: number
  heading?: string
  content?: string
} & BlockCtaData

function asRecord(data: unknown): Record<string, unknown> {
  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {}
}

function asOptionalString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined
}

function asOptionalSize(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return Math.round(v)
  if (typeof v === "string") {
    const n = parseInt(v, 10)
    if (Number.isFinite(n) && n > 0) return n
  }
  return undefined
}

export function getHeadingData(block: ContentBlock): HeadingBlockData {
  if (block.block_type !== "heading") return { title: "" }
  const d = asRecord(block.data)
  const title = typeof d.title === "string" ? d.title : ""
  return {
    title,
    ctaLabel: asOptionalString(d.cta_label),
    ctaUrl: asOptionalString(d.cta_url),
  }
}

export function getTextBlockData(block: ContentBlock): TextBlockData {
  if (block.block_type !== "text_block") return { content: "" }
  const d = asRecord(block.data)
  const heading = typeof d.heading === "string" ? d.heading : undefined
  const content = typeof d.content === "string" ? d.content : ""
  return {
    heading,
    content,
    ctaLabel: asOptionalString(d.cta_label),
    ctaUrl: asOptionalString(d.cta_url),
  }
}

export function getIconHeadingTextData(block: ContentBlock): IconHeadingTextData {
  if (block.block_type !== "icon_heading_text") return {}
  const d = asRecord(block.data)
  return {
    iconUrl: asOptionalString(d.icon_url),
    iconSize: asOptionalSize(d.icon_size),
    heading: asOptionalString(d.heading),
    content: asOptionalString(d.content),
    ctaLabel: asOptionalString(d.cta_label),
    ctaUrl: asOptionalString(d.cta_url),
  }
}

export function getImageHeadingTextCenteredData(
  block: ContentBlock
): ImageHeadingTextCenteredData {
  if (block.block_type !== "image_heading_text_centered") return {}
  const d = asRecord(block.data)
  return {
    imageUrl: asOptionalString(d.image_url),
    imageSize: asOptionalSize(d.image_size),
    heading: asOptionalString(d.heading),
    content: asOptionalString(d.content),
    ctaLabel: asOptionalString(d.cta_label),
    ctaUrl: asOptionalString(d.cta_url),
  }
}

export function getHeadingTextImageRightData(
  block: ContentBlock
): HeadingTextImageRightData {
  if (block.block_type !== "heading_text_image_right") return {}
  const d = asRecord(block.data)
  return {
    heading: asOptionalString(d.heading),
    content: asOptionalString(d.content),
    imageUrl: asOptionalString(d.image_url),
    imageSize: asOptionalSize(d.image_size),
    ctaLabel: asOptionalString(d.cta_label),
    ctaUrl: asOptionalString(d.cta_url),
  }
}

export function getMediaLeftTextRightData(
  block: ContentBlock
): MediaLeftTextRightData {
  if (block.block_type !== "media_left_text_right") return {}
  const d = asRecord(block.data)
  return {
    imageUrl: asOptionalString(d.image_url),
    imageSize: asOptionalSize(d.image_size),
    heading: asOptionalString(d.heading),
    content: asOptionalString(d.content),
    ctaLabel: asOptionalString(d.cta_label),
    ctaUrl: asOptionalString(d.cta_url),
  }
}

export function buildContentBlockData(
  blockType: SubBlockType,
  form: {
    title?: string
    heading?: string
    content?: string
    iconUrl?: string
    iconSize?: number
    imageUrl?: string
    imageSize?: number
    ctaLabel?: string
    ctaUrl?: string
  }
): Record<string, unknown> {
  const ctaLabel = form.ctaLabel?.trim()
  const ctaUrl = form.ctaUrl?.trim()
  if (blockType === "heading") {
    return {
      title: form.title?.trim() ?? "",
      ...(ctaLabel ? { cta_label: ctaLabel } : {}),
      ...(ctaUrl ? { cta_url: ctaUrl } : {}),
    }
  }
  if (blockType === "text_block") {
    const heading = form.heading?.trim()
    return {
      ...(heading ? { heading } : {}),
      content: form.content ?? "",
      ...(ctaLabel ? { cta_label: ctaLabel } : {}),
      ...(ctaUrl ? { cta_url: ctaUrl } : {}),
    }
  }

  const heading = form.heading?.trim()
  const content = form.content?.trim()
  const iconUrl = form.iconUrl?.trim()
  const imageUrl = form.imageUrl?.trim()
  const iconSize = form.iconSize && form.iconSize > 0 ? Math.round(form.iconSize) : undefined
  const imageSize =
    form.imageSize && form.imageSize > 0 ? Math.round(form.imageSize) : undefined

  if (blockType === "icon_heading_text") {
    return {
      ...(iconUrl ? { icon_url: iconUrl } : {}),
      ...(iconSize ? { icon_size: iconSize } : {}),
      ...(heading ? { heading } : {}),
      ...(content ? { content } : {}),
      ...(ctaLabel ? { cta_label: ctaLabel } : {}),
      ...(ctaUrl ? { cta_url: ctaUrl } : {}),
    }
  }

  if (blockType === "image_heading_text_centered") {
    return {
      ...(imageUrl ? { image_url: imageUrl } : {}),
      ...(imageSize ? { image_size: imageSize } : {}),
      ...(heading ? { heading } : {}),
      ...(content ? { content } : {}),
      ...(ctaLabel ? { cta_label: ctaLabel } : {}),
      ...(ctaUrl ? { cta_url: ctaUrl } : {}),
    }
  }

  if (blockType === "heading_text_image_right") {
    return {
      ...(heading ? { heading } : {}),
      ...(content ? { content } : {}),
      ...(imageUrl ? { image_url: imageUrl } : {}),
      ...(imageSize ? { image_size: imageSize } : {}),
      ...(ctaLabel ? { cta_label: ctaLabel } : {}),
      ...(ctaUrl ? { cta_url: ctaUrl } : {}),
    }
  }

  return {
    ...(imageUrl ? { image_url: imageUrl } : {}),
    ...(imageSize ? { image_size: imageSize } : {}),
    ...(heading ? { heading } : {}),
    ...(content ? { content } : {}),
    ...(ctaLabel ? { cta_label: ctaLabel } : {}),
    ...(ctaUrl ? { cta_url: ctaUrl } : {}),
  }
}

export function validateContentBlockPayload(
  blockType: SubBlockType,
  data: Record<string, unknown>
): string | null {
  // Obsah polí je plne voliteľný - validujeme len technické hodnoty (napr. veľkosť média).
  if (blockType === "heading" || blockType === "text_block") return null
  const sizeRaw = data.icon_size ?? data.image_size
  if (sizeRaw !== undefined) {
    const n =
      typeof sizeRaw === "number" ? sizeRaw : parseInt(String(sizeRaw), 10)
    if (!Number.isFinite(n) || n <= 0) {
      return "Veľkosť média musí byť kladné číslo"
    }
  }
  return null
}

export function validateGridPayload(data: Record<string, unknown>): string | null {
  const layout = data.layout
  if (typeof layout !== "string" || !isGridLayoutId(layout)) {
    return "Vyberte rozloženie gridu"
  }
  return null
}
