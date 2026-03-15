import { NextResponse } from "next/server"
import { getArticleById, updateArticle, deleteArticle } from "@/lib/db"

// ==========================================
// REST API для одной статьи (Практика 7: CRUD, Практика 8: RBAC)
// GET    /api/articles/:id — публично
// PUT    /api/articles/:id — авторизация + ownership check
// DELETE /api/articles/:id — авторизация + ownership check
//
// Практика 8 — серверный RBAC (ownership):
//   admin  — может PUT/DELETE любой статьи
//   user   — может PUT/DELETE только своей статьи (authorId === userId)
//
// Заголовки от клиента:
//   x-user-id   — id текущего пользователя
//   x-user-role — роль ("admin" | "user")
// ==========================================

interface RouteParams {
  params: Promise<{ id: string }>
}

// Вспомогательная функция: извлекает и проверяет auth-заголовки
function getAuthHeaders(request: Request): { userId: string; userRole: string } | null {
  const userId = request.headers.get("x-user-id")
  const userRole = request.headers.get("x-user-role")
  if (!userId || !userRole) return null
  return { userId, userRole }
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const article = await getArticleById(id)
    if (!article) {
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
    }
    return NextResponse.json(article)
  } catch (err) {
    console.error("GET /api/articles/[id] error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    // Практика 8: требуем авторизацию
    const auth = getAuthHeaders(request)
    if (!auth) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 })
    }

    const { id } = await params
    const article = await getArticleById(id)
    if (!article) {
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
    }

    // Практика 8: user редактирует только свою статью; admin — любую
    if (auth.userRole !== "admin" && article.authorId !== auth.userId) {
      return NextResponse.json(
        { error: "Нет прав: можно редактировать только свои статьи" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const updated = await updateArticle(id, body)
    return NextResponse.json(updated)
  } catch (err) {
    console.error("PUT /api/articles/[id] error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Практика 8: требуем авторизацию
    const auth = getAuthHeaders(request)
    if (!auth) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 })
    }

    const { id } = await params
    const article = await getArticleById(id)
    if (!article) {
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
    }

    // Практика 8: user удаляет только свою статью; admin — любую
    if (auth.userRole !== "admin" && article.authorId !== auth.userId) {
      return NextResponse.json(
        { error: "Нет прав: можно удалять только свои статьи" },
        { status: 403 }
      )
    }

    await deleteArticle(id)
    return NextResponse.json({ message: "Статья удалена" })
  } catch (err) {
    console.error("DELETE /api/articles/[id] error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
