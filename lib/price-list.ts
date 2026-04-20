import type { Category, PriceListItem, Subcategory } from "@/lib/types"

export type PriceListSection = {
  category: Category
  items: PriceListItem[]
  subcategories: Array<{
    subcategory: Subcategory
    items: PriceListItem[]
  }>
}

type BuildOptions = {
  includeEmpty?: boolean
}

export function buildPriceListSections(
  categories: Category[],
  subcategories: Subcategory[],
  items: PriceListItem[],
  options: BuildOptions = {}
): PriceListSection[] {
  const includeEmpty = options.includeEmpty ?? false
  const itemsByCategory = new Map<string, PriceListItem[]>()
  const itemsBySubcategory = new Map<string, PriceListItem[]>()

  for (const item of items) {
    if (item.subcategory_id) {
      const list = itemsBySubcategory.get(item.subcategory_id) ?? []
      list.push(item)
      itemsBySubcategory.set(item.subcategory_id, list)
      continue
    }
    if (item.category_id) {
      const list = itemsByCategory.get(item.category_id) ?? []
      list.push(item)
      itemsByCategory.set(item.category_id, list)
    }
  }

  for (const list of itemsByCategory.values()) {
    list.sort((a, b) => a.display_order - b.display_order)
  }
  for (const list of itemsBySubcategory.values()) {
    list.sort((a, b) => a.display_order - b.display_order)
  }

  const orderedCategories = [...categories].sort(
    (a, b) => a.display_order - b.display_order
  )
  const orderedSubcategories = [...subcategories].sort(
    (a, b) => a.display_order - b.display_order
  )

  return orderedCategories
    .map((category) => {
      const categoryItems = itemsByCategory.get(category.id) ?? []
      const sectionSubcategories = orderedSubcategories
        .filter((subcategory) => subcategory.category_id === category.id)
        .map((subcategory) => ({
          subcategory,
          items: itemsBySubcategory.get(subcategory.id) ?? [],
        }))
        .filter(
          ({ items: subItems }) => includeEmpty || subItems.length > 0
        )

      return {
        category,
        items: categoryItems,
        subcategories: sectionSubcategories,
      }
    })
    .filter(
      (section) =>
        includeEmpty ||
        section.items.length > 0 ||
        section.subcategories.length > 0
    )
}
