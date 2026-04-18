import "server-only"

import { cookies } from "next/headers"
import type { User } from "@/lib/types"
import { getBackendUrl } from "@/lib/backend-api"

async function getAuthUserByCookieHeader(cookieHeader: string | null | undefined): Promise<User | null> {
  if (!cookieHeader) {
    return null
  }

  const response = await fetch(getBackendUrl("/api/auth/me"), {
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as { user?: User }
  return data.user ?? null
}

export async function getAuthUserFromRequest(request: Request): Promise<User | null> {
  return getAuthUserByCookieHeader(request.headers.get("cookie"))
}

export async function getAuthUserFromServer(): Promise<User | null> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ")

  return getAuthUserByCookieHeader(cookieHeader)
}
