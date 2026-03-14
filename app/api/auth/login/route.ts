// ==========================================
// API Route: POST /api/auth/login
// Практика 6: Аутентификация пользователя
// Практика 7: REST API endpoint + PostgreSQL
// ==========================================
//
// Пользователи хранятся в таблице users локальной PostgreSQL.
// Пароли для демонстрации захардкожены (в Практике 8 будут заменены
// на bcrypt-хэши, хранящиеся непосредственно в БД).

import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"

// Демонстрационные пароли (Практика 8: заменить на bcrypt + поле password_hash в таблице users)
const DEMO_PASSWORDS: Record<string, string> = {
  "admin@company.ru": "admin123",
  "editor@company.ru": "editor123",
  "viewer@company.ru": "viewer123",
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

    // Возвращаем данные пользователя (без пароля)
    // В Практике 8 здесь будет устанавливаться HttpOnly cookie с JWT
    return NextResponse.json({ user }, { status: 200 })
  } catch (err) {
    console.error("POST /api/auth/login error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
