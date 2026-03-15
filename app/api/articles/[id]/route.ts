import { NextResponse } from "next/server"
import { getArticleById, updateArticle, deleteArticle } from "@/lib/db"

// ==========================================
// REST API для одной статьи (Практика 7: CRUD + PostgreSQL)
// GET    /api/articles/:id — получение статьи по id
// PUT    /api/articles/:id — обновление статьи
// DELETE /api/articles/:id — удаление статьи
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
    const { id } = await params
    const body = await request.json()
    const updated = await updateArticle(id, body)
    if (!updated) {
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (err) {
    console.error("PUT /api/articles/[id] error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const deleted = await deleteArticle(id)
    if (!deleted) {
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
    }
    return NextResponse.json({ message: "Статья удалена" })
  } catch (err) {
    console.error("DELETE /api/articles/[id] error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
