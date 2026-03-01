// ==========================================
// API Route: POST /api/auth/login
// Практика 6: Аутентификация пользователя
// Практика 7: REST API endpoint
// ==========================================
//
// В реальном приложении (Практика 8) здесь будет:
// - Проверка пароля через bcrypt против записи в PostgreSQL
// - Выдача JWT-токена (OAuth/PKCE flow)
// - Установка HttpOnly cookie
//
// Сейчас: проверка по мок-данным для демонстрации потока Redux + Auth.

import { NextResponse } from "next/server"
import { mockUsers } from "@/lib/mock-data"
import type { User } from "@/lib/types"

// Мок-пароли: в реальности хранятся в БД в виде bcrypt-хэша
const MOCK_PASSWORDS: Record<string, string> = {
  "admin@company.ru": "admin123",
  "editor@company.ru": "editor123",
  "viewer@company.ru": "viewer123",
}

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string }
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 }
    )
  }

  const user: User | undefined = mockUsers.find((u) => u.email === email)

  if (!user || MOCK_PASSWORDS[email] !== password) {
    return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
    )
  }

  // Возвращаем данные пользователя (без пароля)
  // В реальном приложении (Практика 8) здесь устанавливается HttpOnly cookie с JWT
  return NextResponse.json({ user }, { status: 200 })
}
