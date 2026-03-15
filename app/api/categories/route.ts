import { NextResponse } from "next/server"
import { getAllCategories } from "@/lib/db"

// GET /api/categories — список всех категорий
export async function GET() {
  try {
    const categories = await getAllCategories()
    return NextResponse.json(categories)
  } catch (err) {
    console.error("GET /api/categories error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
