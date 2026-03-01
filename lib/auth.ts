// ==========================================
// Утилиты аутентификации и RBAC
// Практика 6: isAuthenticated, hasRole, roleHierarchy
// ==========================================
//
// Функции принимают AuthState (state.auth), а не весь RootState.
// Это позволяет компонентам делать точечный useAppSelector((s) => s.auth)
// и избегать предупреждения Redux о возврате root state целиком.

import type { AuthState, UserRole } from "@/lib/types"

// Иерархия ролей: admin > editor > viewer
// Ключ — роль, значение — числовой уровень доступа
const ROLE_HIERARCHY: Record<UserRole, number> = {
    admin: 3,
    editor: 2,
    viewer: 1,
}

/**
 * Практика 6: Проверяет, аутентифицирован ли пользователь.
 * @param auth — срез state.auth из Redux Store
 */
export function isAuthenticated(auth: AuthState): boolean {
    return auth.isAuthenticated && auth.user !== null
}

/**
 * Практика 6: Проверяет наличие требуемой роли с учётом иерархии.
 * Если у пользователя роль "admin", он проходит проверку и на "editor", и на "viewer".
 * @param auth     — срез state.auth из Redux Store
 * @param required — минимально необходимая роль
 */
export function hasRole(auth: AuthState, required: UserRole): boolean {
    const user = auth.user
    if (!user) return false
    return (ROLE_HIERARCHY[user.role] ?? 0) >= (ROLE_HIERARCHY[required] ?? 0)
}

/**
 * Практика 6: Возвращает роль текущего пользователя или null.
 * @param auth — срез state.auth из Redux Store
 */
export function getCurrentRole(auth: AuthState): UserRole | null {
    return auth.user?.role ?? null
}
