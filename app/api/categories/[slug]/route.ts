import { NextResponse } from "next/server"
import { getCategoryBySlug, getArticlesByCategory } from "@/lib/db"

interface RouteParams {
  params: Promise<{ slug: string }>
}

// GET /api/categories/:slug — категория + её статьи
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params
    const category = await getCategoryBySlug(slug)
    if (!category) {
      return NextResponse.json({ error: "Категория не найдена" }, { status: 404 })
    }
    const articles = await getArticlesByCategory(category.id)
    return NextResponse.json({ category, articles })
  } catch (err) {
    console.error("GET /api/categories/[slug] error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
