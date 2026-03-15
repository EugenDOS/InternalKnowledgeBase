import { NextResponse } from "next/server"
import { getAllArticles, createArticle } from "@/lib/db"

// ==========================================
// REST API для статей (Практика 7: CRUD, Практика 8: RBAC)
// GET  /api/articles — список всех статей (публично)
// POST /api/articles — создание (требует авторизации: любая роль)
//
// Практика 8 — серверный RBAC:
//   Клиент передаёт заголовки:
//     x-user-id   — id текущего пользователя
//     x-user-role — роль текущего пользователя ("admin" | "user")
//   Сервер проверяет наличие заголовков для мутирующих методов.
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
    // Практика 8: проверяем наличие авторизации
    const userId = request.headers.get("x-user-id")
    const userRole = request.headers.get("x-user-role")

    if (!userId || !userRole) {
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
    if (userRole !== "admin" && authorId !== userId) {
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
