"use client"

import type { UserRole } from "@/lib/types"

// Компонент-обертка для защиты маршрутов (Практика 6: аутентификация, RBAC)
// Заглушка — в будущем будет проверять реальное состояние из Redux Store

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

// Функции проверки доступа — заглушки для Практики 6
export function isAuthenticated(): boolean {
  // TODO: Практика 6 — проверка через Redux Store / cookie / JWT
  return false
}

export function hasRole(role: UserRole): boolean {
  // TODO: Практика 6, 8 — проверка роли пользователя (RBAC)
  void role
  return false
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  // TODO: Практика 6 — реализовать реальную проверку
  // if (!isAuthenticated()) redirect("/login")
  // if (requiredRole && !hasRole(requiredRole)) redirect("/")

  void requiredRole
  return <>{children}</>
}
