import { NextResponse } from "next/server"
import { getAllUsers } from "@/lib/db"

// GET /api/users — список всех пользователей (только для admin)
export async function GET() {
  try {
    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (err) {
    console.error("GET /api/users error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
