import { cookies } from "next/headers"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { User } from "@/lib/types"

vi.mock("server-only", () => ({}))
vi.mock("next/headers", () => ({ cookies: vi.fn() }))

import { getAuthUserFromRequest, getAuthUserFromServer } from "@/lib/server-auth"

const user: User = {
  id: "user-1",
  username: "tester",
  email: "test@company.ru",
  role: "user",
  fullName: "Test User",
  createdAt: "2026-01-01T00:00:00Z",
}

beforeEach(() => {
  process.env.BACKEND_INTERNAL_URL = "http://backend:8080"
  process.env.BACKEND_AUTH_COOKIE_NAME = "session"
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
  delete process.env.BACKEND_INTERNAL_URL
  delete process.env.BACKEND_AUTH_COOKIE_NAME
})

describe("server authentication", () => {
  it("returns null without a request cookie", async () => {
    vi.stubGlobal("fetch", vi.fn())
    await expect(getAuthUserFromRequest(new Request("http://frontend"))).resolves.toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("returns authenticated user and forwards cookie", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user }), { status: 200 })
    )
    vi.stubGlobal("fetch", fetchMock)

    const request = {
      headers: { get: () => "session=token" },
    } as unknown as Request
    const result = await getAuthUserFromRequest(request)

    expect(result).toEqual(user)
    expect(fetchMock.mock.calls[0][1].headers.cookie).toBe("session=token")
  })

  it("handles rejected, malformed and unsuccessful backend responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }))
      .mockRejectedValueOnce(new Error("offline"))
    vi.stubGlobal("fetch", fetchMock)
    const request = {
      headers: { get: () => "session=token" },
    } as unknown as Request

    await expect(getAuthUserFromRequest(request)).resolves.toBeNull()
    await expect(getAuthUserFromRequest(request)).resolves.toBeNull()
    await expect(getAuthUserFromRequest(request)).resolves.toBeNull()
  })

  it("builds cookie header from server cookie store", async () => {
    vi.mocked(cookies)
      .mockResolvedValueOnce({ get: () => ({ name: "session", value: "a b" }) } as never)
      .mockResolvedValueOnce({ get: () => undefined } as never)
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user }), { status: 200 })
    )
    vi.stubGlobal("fetch", fetchMock)

    await expect(getAuthUserFromServer()).resolves.toEqual(user)
    expect(fetchMock.mock.calls[0][1].headers.cookie).toBe("session=a%20b")
    await expect(getAuthUserFromServer()).resolves.toBeNull()
  })
})
