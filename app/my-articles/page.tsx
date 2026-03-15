import ProtectedRoute from "@/components/auth/protected-route"
import MyArticlesCrud from "@/components/user/my-articles-crud"
import type { Category } from "@/lib/types"

// Страница "Мои публикации" (Практика 8: RBAC — доступна любому авторизованному пользователю)
// Server Component: категории загружаются через HTTP GET к API.
// Client Component MyArticlesCrud показывает и управляет только статьями текущего пользователя.

export default async function MyArticlesPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

  const categoriesRes = await fetch(`${base}/api/categories`, { cache: "no-store" })
  const categories: Category[] = categoriesRes.ok ? await categoriesRes.json() : []

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Мои публикации</h1>
          <p className="text-sm text-muted-foreground">
            Управление вашими статьями: создание, редактирование и удаление
          </p>
        </div>

        <MyArticlesCrud categories={categories} />
      </div>
    </ProtectedRoute>
  )
}
