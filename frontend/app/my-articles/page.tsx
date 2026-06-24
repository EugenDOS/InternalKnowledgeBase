import { redirect } from "next/navigation"
import ProtectedRoute from "@/components/auth/protected-route"
import MyArticlesCrud from "@/components/user/my-articles-crud"
import { getAllCategories } from "@/lib/backend-data"
import { getAuthUserFromServer } from "@/lib/server-auth"
import type { Category } from "@/lib/types"

export const dynamic = "force-dynamic"

// Страница "Мои публикации" (Практика 8: RBAC — доступна любому авторизованному пользователю)
// Server Component: категории загружаются через HTTP GET к API.
// Client Component MyArticlesCrud показывает и управляет только статьями текущего пользователя.

export default async function MyArticlesPage() {
  const currentUser = await getAuthUserFromServer()

  if (!currentUser) {
    redirect("/login")
  }

  const categories: Category[] = await getAllCategories()

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
