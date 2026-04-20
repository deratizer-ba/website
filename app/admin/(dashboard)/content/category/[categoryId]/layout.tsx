import { CategoryContentWorkspace } from "@/components/admin/content-structure/category-content-workspace"

export default function AdminContentCategoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CategoryContentWorkspace>{children}</CategoryContentWorkspace>
}
