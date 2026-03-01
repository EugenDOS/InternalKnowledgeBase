import { NextResponse } from "next/server"
import { mockArticles } from "@/lib/mock-data"

// ==========================================
// REST API для статей (Практика 7: CRUD, Express-подобные эндпоинты)
// GET /api/articles — получение списка статей
// POST /api/articles — создание статьи
// В будущем: подключение PostgreSQL + Sequelize (Практика 7, 8)
// ==========================================

export async function GET() {
  // TODO: Практика 7 — заменить на запрос к PostgreSQL через Sequelize
  return NextResponse.json(mockArticles)
}

export async function POST(request: Request) {
  // TODO: Практика 7 — сохранение в PostgreSQL
  const body = await request.json()
  const newArticle = {
    id: String(mockArticles.length + 1),
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return NextResponse.json(newArticle, { status: 201 })
}
