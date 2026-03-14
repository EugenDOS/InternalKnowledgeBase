import { NextResponse } from "next/server"
import { getAllArticles, createArticle } from "@/lib/db"

// ==========================================
// REST API для статей (Практика 7: CRUD + PostgreSQL)
// GET  /api/articles — список всех статей
// POST /api/articles — создание новой статьи
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
    const body = await request.json()
    const { title, content, excerpt, categoryId, authorId, tags } = body

    if (!title || !categoryId || !authorId) {
      return NextResponse.json(
        { error: "Поля title, categoryId, authorId обязательны" },
        { status: 400 }
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
