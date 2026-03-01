import { NextResponse } from "next/server"
import { getArticleById } from "@/lib/mock-data"

// ==========================================
// REST API для одной статьи (Практика 7: CRUD)
// GET    /api/articles/:id — получение статьи
// PUT    /api/articles/:id — обновление статьи
// DELETE /api/articles/:id — удаление статьи
// ==========================================

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const article = getArticleById(id)
  if (!article) {
    return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
  }
  return NextResponse.json(article)
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params
  const article = getArticleById(id)
  if (!article) {
    return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
  }
  // TODO: Практика 7 — обновление в PostgreSQL
  const body = await request.json()
  const updated = { ...article, ...body, updatedAt: new Date().toISOString() }
  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const article = getArticleById(id)
  if (!article) {
    return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
  }
  // TODO: Практика 7 — удаление из PostgreSQL
  return NextResponse.json({ message: "Статья удалена" })
}
