// ==========================================
// API Route: POST /api/auth/register
// Регистрация нового пользователя с ролью "user"
// ==========================================

import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { hashPassword } from "@/lib/server-auth"
import type { User } from "@/lib/types"

interface UserRow {
  id: string
  username: string
  email: string
  role: string
  full_name: string
  created_at: Date
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
      username?: string
      fullName?: string
    }

    const { email, password, username, fullName } = body

    if (!email || !password || !username || !fullName) {
      return NextResponse.json(
        { error: "Все поля обязательны" },
        { status: 400 }
      )
    }

    // Проверяем минимальную длину пароля
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль должен содержать не менее 6 символов" },
        { status: 400 }
      )
    }

    // Проверяем уникальность email
    const existingEmail = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    )
    if ((existingEmail.rowCount ?? 0) > 0) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      )
    }

    // Проверяем уникальность username
    const existingUsername = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    )
    if ((existingUsername.rowCount ?? 0) > 0) {
      return NextResponse.json(
        { error: "Имя пользователя уже занято" },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)

    // Создаём пользователя с ролью "user"
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users (username, email, role, full_name, password_hash)
       VALUES ($1, $2, 'user', $3, $4)
       RETURNING *`,
      [username, email, fullName, passwordHash]
    )

    const row = rows[0]
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

    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    console.error("POST /api/auth/register error:", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
