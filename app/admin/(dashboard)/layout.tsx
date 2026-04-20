import { AdminSidebar } from "@/components/admin/sidebar"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 bg-muted/30 overflow-auto">
        {children}
      </main>
    </div>
  )
}
