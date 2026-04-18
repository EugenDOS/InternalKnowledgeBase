import { NextResponse } from "next/server"
import { getArticleById, updateArticle, deleteArticle } from "@/lib/db"
import { getAuthUserFromRequest } from "@/lib/server-auth"

// ==========================================
// REST API для одной статьи (Практика 7: CRUD, Практика 8: RBAC)
// GET    /api/articles/:id — публично
// PUT    /api/articles/:id — авторизация + ownership check
// DELETE /api/articles/:id — авторизация + ownership check
//
// Практика 8 — серверный RBAC (ownership):
//   admin  — может PUT/DELETE любой статьи
//   user   — может PUT/DELETE только своей статьи (authorId === userId)
// ==========================================

interface RouteParams {
  params: Promise<{ id: string }>
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
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 })
    }

    const { id } = await params
    const article = await getArticleById(id)
    if (!article) {
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
    }

    // Практика 8: user редактирует только свою статью; admin — любую
    if (user.role !== "admin" && article.authorId !== user.id) {
      return NextResponse.json(
          { error: "Нет прав: можно редактировать только свои статьи" },
          { status: 403 }
      )
    }

    const body = await request.json()
    if (user.role !== "admin" && body.authorId !== undefined && body.authorId !== user.id) {
      return NextResponse.json(
        { error: "Нет прав: нельзя менять автора статьи" },
        { status: 403 }
      )
    }

    const updated = await updateArticle(
      id,
      user.role === "admin"
        ? body
        : {
            ...body,
            authorId: user.id,
          }
    )
    return NextResponse.json(updated)
  } catch (err) {
    console.error("PUT /api/articles/[id] error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 })
    }

    const { id } = await params
    const article = await getArticleById(id)
    if (!article) {
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
    }

    // Практика 8: user удаляет только свою статью; admin — любую
    if (user.role !== "admin" && article.authorId !== user.id) {
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
