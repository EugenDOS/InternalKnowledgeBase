// ==========================================
// API Route: POST /api/auth/login
// Практика 6: Аутентификация пользователя
// Практика 7: REST API endpoint + PostgreSQL
// Практика 8: Возвращает роль пользователя (admin | user) для RBAC
// ==========================================

import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"

// Демонстрационные пароли (в production заменить на bcrypt-хэши в БД)
// Практика 8: две роли — admin и user
const DEMO_PASSWORDS: Record<string, string> = {
  "admin@company.ru": "admin123",
  "user1@company.ru": "user123",
  "user2@company.ru": "user123",
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 }
      )
    }

    // Ищем пользователя в PostgreSQL
    const user = await getUserByEmail(email)

    if (!user || DEMO_PASSWORDS[email] !== password) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      )
    }

    // Возвращаем данные пользователя с ролью (admin | user)
    // Практика 8: роль используется клиентом для RBAC в UI и в заголовках x-user-role
    return NextResponse.json({ user }, { status: 200 })
  } catch (err) {
    console.error("POST /api/auth/login error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
