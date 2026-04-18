import { NextResponse } from "next/server"
import { getAllArticles, createArticle } from "@/lib/db"
import { getAuthUserFromRequest } from "@/lib/server-auth"

// ==========================================
// REST API для статей (Практика 7: CRUD, Практика 8: RBAC)
// GET  /api/articles — список всех статей (публично)
// POST /api/articles — создание (требует авторизации: любая роль)
//
// Практика 8 — серверный RBAC:
//   Для POST сервер берёт текущего пользователя из защищённой cookie-сессии.
// ==========================================

export async function GET() {
  try {
    const articles = await getAllArticles()
    return NextResponse.json(articles)
  } catch (err) {
    console.error("GET /api/articles error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
          { error: "Требуется авторизация" },
          { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, excerpt, categoryId, authorId, tags } = body

    if (!title || !categoryId || !authorId) {
      return NextResponse.json(
          { error: "Поля title, categoryId, authorId обязательны" },
          { status: 400 }
      )
    }

    // Практика 8: user может создавать статьи только от своего имени
    if (user.role !== "admin" && authorId !== user.id) {
      return NextResponse.json(
          { error: "Нет прав: нельзя создавать статьи от имени другого пользователя" },
          { status: 403 }
      )
    }

    const article = await createArticle({
      title,
      content: content ?? "",
      excerpt: excerpt ?? "",
      categoryId,
      authorId,
      tags: Array.isArray(tags) ? tags : [],
    })

    return NextResponse.json(article, { status: 201 })
  } catch (err) {
    console.error("POST /api/articles error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
