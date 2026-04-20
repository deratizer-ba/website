"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/actions/auth"
import {
  Home,
  FolderTree,
  BookOpen,
  LogOut,
  LayoutDashboard,
  LayoutTemplate,
  Blocks,
  Building2,
  Images,
  ReceiptText,
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "Prehľad", icon: LayoutDashboard },
  { href: "/admin/homepage", label: "Úvodná stránka", icon: Home },
  { href: "/admin/firma", label: "Firemné údaje", icon: Building2 },
  { href: "/admin/obrazky", label: "Obrázky", icon: Images },
  { href: "/admin/cennik", label: "Cenník", icon: ReceiptText },
  { href: "/admin/content", label: "Obsah", icon: FolderTree },
  { href: "/admin/content/globalne-bloky", label: "Opakované bloky", icon: Blocks },
  { href: "/admin/komponenty", label: "Komponenty", icon: LayoutTemplate },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-card min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <Link href="/admin" className="text-xl font-bold">
          Admin
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isGlobalBlocks = pathname.startsWith("/admin/content/globalne-bloky")
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : item.href === "/admin/content"
              ? pathname.startsWith("/admin/content") && !isGlobalBlocks
              : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isActive && "font-medium")}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <Link href="/" target="_blank">
          <Button variant="ghost" className="w-full justify-start mb-2 text-sm">
            Zobraziť web
          </Button>
        </Link>
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Odhlásiť sa
          </Button>
        </form>
      </div>
    </aside>
  )
}
