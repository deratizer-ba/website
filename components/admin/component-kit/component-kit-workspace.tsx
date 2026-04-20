"use client"

import { ComponentKitRail } from "./component-kit-rail"

export function ComponentKitWorkspace({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col lg:flex-row -mx-6 -mt-6 lg:-mx-8 lg:-mt-8 mb-0">
      <ComponentKitRail />
      <div className="min-w-0 flex-1 p-6 lg:p-8">{children}</div>
    </div>
  )
}
