"use client"

import dynamic from "next/dynamic"
import type { Category, Subcategory } from "@/lib/types"

const HeaderNoSSR = dynamic(
  () => import("@/components/public/header").then((m) => m.Header),
  { ssr: false }
)

type Props = {
  categories: (Category & { subcategories: Subcategory[] })[]
}

export function HeaderShell(props: Props) {
  return <HeaderNoSSR {...props} />
}

