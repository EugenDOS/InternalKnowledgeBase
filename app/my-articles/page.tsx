import { headers } from "next/headers"
import type { Category } from "@/lib/types"
import ProtectedRoute from "@/components/auth/protected-route"
import ArticlesCrud from "@/components/admin/articles-crud"

// ==========================================
// Страница "Мои статьи"
// Практика 8: доступна любому авторизованному пользователю (роль user и admin)
//   user  — видит и управляет только своими статьями (фильтрация в ArticlesCrud)
//   admin — видит все статьи (перенаправляется на /admin, но может зайти и сюда)
// ==========================================

export default async function MyArticlesPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

  const [categoriesRes, usersRes] = await Promise.all([
    fetch(`${base}/api/categories`, { cache: "no-store" }),
    fetch(`${base}/api/users`, { cache: "no-store" }),
  ])

  const categories: Category[] = categoriesRes.ok ? await categoriesRes.json() : []
  const users = usersRes.ok ? await usersRes.json() : []

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Мои статьи</h1>
          <p className="text-sm text-muted-foreground">
            Управление статьями в соответствии с вашими правами доступа
          </p>
        </div>

        {/* ArticlesCrud сам определяет, какие статьи показывать по роли из Redux */}
        <ArticlesCrud categories={categories} users={users} />
      </div>
    </ProtectedRoute>
  )
}
