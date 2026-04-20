/** Admin URLs for site structure (categories / subcategories / text blocks). */
export const ADMIN_CONTENT_BASE = "/admin/content" as const

export function adminCategoryPath(categoryId: string) {
  return `${ADMIN_CONTENT_BASE}/category/${categoryId}`
}

export function adminSubcategoryPath(
  categoryId: string,
  subcategoryId: string
) {
  return `${ADMIN_CONTENT_BASE}/category/${categoryId}/subcategory/${subcategoryId}`
}
