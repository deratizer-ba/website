"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

type Props = {
  label?: string
  url?: string
}

export function CtaLink({ label, url }: Props) {
  const text = label?.trim()
  const href = url?.trim()
  if (!text && !href) return null

  return (
    <Link
      href={href || "#"}
      className={buttonVariants({ variant: "brand", size: "lg" })}
    >
      {text || "Viac informácií"}
    </Link>
  )
}
