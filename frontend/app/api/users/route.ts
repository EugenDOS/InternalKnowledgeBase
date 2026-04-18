import { NextResponse } from "next/server"
import { getAllUsers } from "@/lib/db"
import { getAuthUserFromRequest } from "@/lib/server-auth"

// GET /api/users — список всех пользователей (только для admin)
export async function GET(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Нет прав доступа" }, { status: 403 })
    }

    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (err) {
    console.error("GET /api/users error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
