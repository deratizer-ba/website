"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
      className={cn(
        buttonVariants({ variant: "ghost", size: "lg" }),
        "!bg-brand !text-white hover:!bg-brand/90 focus-visible:!border-brand focus-visible:!ring-brand/30"
      )}
    >
      {text || "Viac informácií"}
    </Link>
  )
}
