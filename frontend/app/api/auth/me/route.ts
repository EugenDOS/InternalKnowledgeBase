import { NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/server-auth"

export async function GET(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Пользователь не авторизован" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("GET /api/auth/me error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
