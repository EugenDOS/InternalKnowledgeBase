"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, FolderOpen, Shield, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Навигация бокового меню (Практика 3, 4: маршрутизация, вложенные маршруты)

const navItems = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/articles", label: "Статьи", icon: FileText },
  { href: "/categories", label: "Категории", icon: FolderOpen },
  { href: "/admin", label: "Админ-панель", icon: Shield },
]

interface SidebarNavProps {
  open: boolean
  onClose: () => void
}

export default function SidebarNav({ open, onClose }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Оверлей для мобильных */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-card pt-14 transition-transform lg:static lg:z-auto lg:translate-x-0 lg:pt-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
          <span className="text-sm font-semibold">Навигация</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
