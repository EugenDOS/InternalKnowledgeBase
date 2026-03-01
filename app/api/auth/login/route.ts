import { NextResponse } from "next/server"

// ==========================================
// REST API для аутентификации (Практика 6, 7: Auth + REST)
// POST /api/auth/login — вход пользователя
// В будущем: JWT-токены, bcrypt, OAuth/PKCE
// ==========================================

export async function POST(request: Request) {
  const body = await request.json()
  const { email, password } = body

  // TODO: Практика 6, 7 — проверка в PostgreSQL, bcrypt, JWT
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email и пароль обязательны" },
      { status: 400 }
    )
  }

  // Заглушка — всегда возвращает ошибку
  return NextResponse.json(
    { error: "Аутентификация будет реализована в Практике 6" },
    { status: 501 }
  )
}
