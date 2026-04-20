import { ContentStructureProvider } from "@/components/admin/content-structure/context"
import { ContentStructureWorkspace } from "@/components/admin/content-structure/content-structure-workspace"

export default function AdminContentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ContentStructureProvider>
      <ContentStructureWorkspace>{children}</ContentStructureWorkspace>
    </ContentStructureProvider>
  )
}
