import type { SubBlockType } from "@/lib/types"

export const ADMIN_KOMPONENTY_BASE = "/admin/komponenty" as const

/**
 * Katalóg typu: vlastná stránka v `app/admin/.../komponenty/typ/<blockType>/page.tsx`.
 */
export function adminKomponentTypPath(blockType: SubBlockType) {
  return `${ADMIN_KOMPONENTY_BASE}/typ/${blockType}`
}
