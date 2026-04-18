"use client"

// ==========================================
// ProtectedRoute — компонент-обертка защиты маршрутов
// Практика 6: RBAC, блокировка доступа по роли
// ==========================================

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { isAuthenticated, hasRole } from "@/lib/auth"
import type { UserRole } from "@/lib/types"

interface ProtectedRouteProps {
    children: React.ReactNode
    // Минимальная роль для доступа. Если не указана — достаточно просто быть залогиненным.
    requiredRole?: UserRole
    // Куда редиректить неавторизованного пользователя
    redirectTo?: string
}

/**
 * Практика 6: Обёртка для защищённых страниц.
 *
 * Принцип работы:
 * 1. Считывает состояние auth из Redux Store через useAppSelector
 * 2. Вызывает isAuthenticated() и hasRole() из lib/auth.ts
 * 3. Перенаправляет через useRouter, если доступ запрещён
 */
export default function ProtectedRoute({
                                           children,
                                           requiredRole,
                                           redirectTo = "/login",
                                       }: ProtectedRouteProps) {
    const router = useRouter()

    // useSelector: считываем только срез auth из Store (Практика 5)
    const auth = useAppSelector((state) => state.auth)
    const authenticated = isAuthenticated(auth)
    const roleAllowed = requiredRole ? hasRole(auth, requiredRole) : true
    const isLoading = auth.isLoading

    useEffect(() => {
        // Не редиректим во время загрузки
        if (isLoading) return

        if (!authenticated) {
            router.replace(redirectTo)
            return
        }

        if (!roleAllowed) {
            // Авторизован, но нет нужной роли → на главную
            router.replace("/")
        }
    }, [authenticated, roleAllowed, isLoading, router, redirectTo])

    // Пока идёт проверка или редирект — ничего не рендерим
    if (isLoading || !authenticated || !roleAllowed) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">Проверка доступа...</p>
            </div>
        )
    }

    return <>{children}</>
}
