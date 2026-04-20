"use client"

import { useContentStructure } from "./context"
import { Loader2 } from "lucide-react"

export function ContentStructureCategoriesList() {
  const { loading } = useContentStructure()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Štruktúra obsahu</h1>
    </div>
  )
}
