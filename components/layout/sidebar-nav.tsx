"use client"

// ==========================================
// SidebarNav — навигация с RBAC-фильтрацией пунктов
// Навигация бокового меню (Практика 3, 4: маршрутизация, вложенные маршруты)
// Практика 5: useAppSelector (чтение auth из Store)
// Практика 6: пункт "Админ-панель" виден только роли admin
// ==========================================

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, FolderOpen, Shield, BookMarked, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppSelector } from "@/store/hooks"
import { hasRole, isAuthenticated } from "@/lib/auth"
import type { UserRole } from "@/lib/types"

// Описание навигационного пункта
interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  // Если указана requiredRole — пункт виден только пользователям с этой ролью (RBAC)
  // Если requiresAuth: true — пункт виден любому авторизованному пользователю
  requiredRole?: UserRole
  requiresAuth?: boolean
}

// Практика 8: навигация с RBAC — пункты фильтруются по роли
const navItems: NavItem[] = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/articles", label: "Статьи", icon: FileText },
  { href: "/categories", label: "Категории", icon: FolderOpen },
  // Практика 8: "Мои статьи" — для любого авторизованного (user и admin)
  { href: "/my-articles", label: "Мои публикации", icon: BookMarked, requiresAuth: true },
  // Практика 8: "Админ-панель" — только для admin (полный доступ ко всем статьям)
  { href: "/admin", label: "Админ-панель", icon: Shield, requiredRole: "admin" },
]

interface SidebarNavProps {
  open: boolean
  onClose: () => void
}

export default function SidebarNav({ open, onClose }: SidebarNavProps) {
  const pathname = usePathname()

  // useSelector: считываем только срез auth для RBAC-фильтрации (Практика 5, 6)
  const auth = useAppSelector((state) => state.auth)

  // Практика 8: фильтрация навигации по ролям
  const authenticated = isAuthenticated(auth)
  const visibleItems = navItems.filter((item) => {
    // Пункт только для залогиненных (любая роль)
    if (item.requiresAuth) return authenticated
    // Пункт требует конкретной роли (с учётом иерархии)
    if (item.requiredRole) return hasRole(auth, item.requiredRole)
    // Публичный пункт
    return true
  })

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
            {visibleItems.map((item) => {
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
