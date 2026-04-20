"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { SiteEmblem } from "@/components/public/site-emblem"
import type { Category, Subcategory } from "@/lib/types"

const MAX_VISIBLE_CATEGORIES = 7

type Props = {
  categories: (Category & { subcategories: Subcategory[] })[]
}

export function Header({ categories }: Props) {
  const [open, setOpen] = useState(false)

  const visibleCategories = categories.slice(0, MAX_VISIBLE_CATEGORIES)
  const hiddenCategories = categories.slice(MAX_VISIBLE_CATEGORIES)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur-md transition-all duration-300">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center justify-between h-16 lg:h-18">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <SiteEmblem className="h-9 w-9 lg:h-10 lg:w-10" decorative />
            <span className="flex flex-col gap-0 leading-none">
              <span className="text-lg font-bold leading-none tracking-tight">
                Deratizéri
              </span>
              <span className=" text-xs font-medium leading-none tracking-[0.14em]">
                BRATISLAVA
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {visibleCategories.map((cat) => (
              <CategoryNavItem key={cat.id} category={cat} />
            ))}

            {hiddenCategories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    />
                  }
                >
                  Viac
                  <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[16rem] p-2"
                >
                  {hiddenCategories.map((cat) => (
                    <DropdownMenuItem
                      key={cat.id}
                      render={<Link href={`/${cat.slug}`} />}
                    >
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div className="w-px h-5 bg-border/50 mx-1.5" />

            <ThemeToggle />

            <Link href="/cennik">
              <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Cenník
              </Button>
            </Link>

            <Link href="/kontakt" className="ml-1">
              <Button size="sm">Kontakt</Button>
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" />}
              >
                {open ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetTitle className="text-lg font-bold px-4 pb-2">
                  Menu
                </SheetTitle>
                <nav className="flex flex-col gap-0.5 px-4">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <Link
                        href={`/${cat.slug}`}
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                      >
                        {cat.name}
                      </Link>
                      {cat.subcategories?.length > 0 && (
                        <div className="ml-3 border-l border-border pl-3">
                          {cat.subcategories.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/${cat.slug}/${sub.slug}`}
                              onClick={() => setOpen(false)}
                              className="block px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-border my-3" />
                  <Link
                    href="/cennik"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    Cenník
                  </Link>
                  <Link
                    href="/blog"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    Blog
                  </Link>
                  <Link href="/kontakt" onClick={() => setOpen(false)}>
                    <Button className="w-full mt-2">Kontakt</Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

function CategoryNavItem({
  category,
}: {
  category: Category & { subcategories: Subcategory[] }
}) {
  const linkClasses =
    "text-sm font-medium text-muted-foreground hover:text-foreground"

  if (!category.subcategories || category.subcategories.length === 0) {
    return (
      <Link href={`/${category.slug}`}>
        <Button variant="ghost" className={linkClasses}>
          {category.name}
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className={linkClasses} />}
      >
        {category.name}
        <ChevronDown className="ml-1 h-3 w-3 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[16rem] p-2">
        <DropdownMenuItem render={<Link href={`/${category.slug}`} />}>
          <span className="font-medium">Všetko v {category.name}</span>
        </DropdownMenuItem>
        {category.subcategories.map((sub) => (
          <DropdownMenuItem
            key={sub.id}
            render={<Link href={`/${category.slug}/${sub.slug}`} />}
          >
            {sub.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
