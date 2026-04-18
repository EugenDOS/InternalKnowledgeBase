import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto"
import { promisify } from "util"
import { cookies } from "next/headers"
import type { NextResponse } from "next/server"
import pool, { getUserById } from "@/lib/db"
import type { User } from "@/lib/types"

const scrypt = promisify(scryptCallback)

const AUTH_COOKIE_NAME = "knowledge-base-session"
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7
const SESSION_SECRET = process.env.AUTH_SECRET ?? "knowledge-base-demo-secret"

interface SessionPayload {
  userId: string
  expiresAt: number
}

function sign(value: string): string {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("base64url")
}

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url")
}

function decodePayload(value: string): SessionPayload | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionPayload
  } catch {
    return null
  }
}

function createSessionToken(userId: string): string {
  const payload = encodePayload({
    userId,
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  })

  return `${payload}.${sign(payload)}`
}

function readSessionToken(token: string | null | undefined): SessionPayload | null {
  if (!token) return null

  const [payload, signature] = token.split(".")
  if (!payload || !signature) return null
  if (sign(payload) !== signature) return null

  const decoded = decodePayload(payload)
  if (!decoded || decoded.expiresAt <= Date.now()) return null

  return decoded
}

function parseCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null

  const cookiesList = cookieHeader.split(";").map((part) => part.trim())
  const cookie = cookiesList.find((part) => part.startsWith(`${name}=`))

  return cookie ? cookie.slice(name.length + 1) : null
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer

  return `${salt}:${derivedKey.toString("hex")}`
}

export async function verifyPassword(
  password: string,
  storedPasswordHash: string | null
): Promise<boolean> {
  if (!storedPasswordHash) return false

  // Поддерживаем старые демо-записи с открытым паролем и постепенно обновляем их.
  if (!storedPasswordHash.includes(":")) {
    return storedPasswordHash === password
  }

  const [salt, storedHash] = storedPasswordHash.split(":")
  if (!salt || !storedHash) return false

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer
  const storedBuffer = Buffer.from(storedHash, "hex")

  if (derivedKey.length !== storedBuffer.length) return false

  return timingSafeEqual(derivedKey, storedBuffer)
}

export async function upgradeLegacyPasswordHash(
  userId: string,
  password: string,
  storedPasswordHash: string | null
): Promise<void> {
  if (!storedPasswordHash || storedPasswordHash.includes(":")) return

  const nextPasswordHash = await hashPassword(password)
  await pool.query(
    "UPDATE users SET password_hash = $1 WHERE id = $2",
    [nextPasswordHash, userId]
  )
}

export function setAuthCookie(response: NextResponse, userId: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  })
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
}

async function getUserFromSessionToken(token: string | null | undefined): Promise<User | null> {
  const session = readSessionToken(token)
  if (!session) return null

  return getUserById(session.userId)
}

export async function getAuthUserFromRequest(request: Request): Promise<User | null> {
  const token = parseCookieValue(request.headers.get("cookie"), AUTH_COOKIE_NAME)
  return getUserFromSessionToken(token)
}

export async function getAuthUserFromServer(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  return getUserFromSessionToken(token)
}
