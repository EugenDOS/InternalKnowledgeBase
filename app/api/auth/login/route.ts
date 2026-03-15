// ==========================================
// API Route: POST /api/auth/login
// Практика 6: Аутентификация пользователя
// Практика 7: REST API endpoint + PostgreSQL
// Практика 8: Возвращает роль пользователя (admin | user) для RBAC
// ==========================================

import { NextResponse } from "next/server"
import pool from "@/lib/db"
import type { User } from "@/lib/types"

interface UserRow {
  id: string
  username: string
  email: string
  role: string
  full_name: string
  password_hash: string | null
  created_at: Date
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

    // Ищем пользователя в PostgreSQL вместе с password_hash
    // Практика 8: две роли — admin и user
    const result = await pool.query<UserRow>(
      "SELECT id, username, email, role, full_name, password_hash, created_at FROM users WHERE email = $1",
      [email]
    )

    const row = result.rows[0]

    if (!row || row.password_hash !== password) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      )
    }

    const user: User = {
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role as User["role"],
      fullName: row.full_name,
      createdAt: row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    }

    // Возвращаем данные пользователя с ролью (admin | user)
    // Практика 8: роль используется клиентом для RBAC в UI и в заголовках x-user-role
    return NextResponse.json({ user }, { status: 200 })
  } catch (err) {
    console.error("POST /api/auth/login error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
