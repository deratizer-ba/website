import { ComponentKitWorkspace } from "@/components/admin/component-kit/component-kit-workspace"

export default function AdminKomponentyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ComponentKitWorkspace>{children}</ComponentKitWorkspace>
}
