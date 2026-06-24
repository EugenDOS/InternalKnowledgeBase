import { cookies } from "next/headers"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next/headers", () => ({ cookies: vi.fn() }))

import {
  getBackendBaseUrl,
  getBackendCookieName,
  getBackendUrl,
  getServerCookieHeader,
  proxyToBackend,
} from "@/lib/backend-api"

beforeEach(() => {
  process.env.BACKEND_INTERNAL_URL = "http://backend:8080/"
  process.env.BACKEND_AUTH_COOKIE_NAME = "session"
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
  delete process.env.BACKEND_INTERNAL_URL
  delete process.env.BACKEND_AUTH_COOKIE_NAME
})

describe("backend API helpers", () => {
  it("requires and normalizes environment configuration", () => {
    expect(getBackendCookieName()).toBe("session")
    expect(getBackendBaseUrl()).toBe("http://backend:8080")
    expect(getBackendUrl("api/articles")).toBe("http://backend:8080/api/articles")
    expect(getBackendUrl("/api/articles")).toBe("http://backend:8080/api/articles")

    delete process.env.BACKEND_INTERNAL_URL
    expect(() => getBackendBaseUrl()).toThrow("BACKEND_INTERNAL_URL must be configured")
  })

  it("reads a server cookie when present", async () => {
    vi.mocked(cookies)
      .mockResolvedValueOnce({ get: () => undefined } as never)
      .mockResolvedValueOnce({ get: () => ({ name: "session", value: "a b" }) } as never)

    await expect(getServerCookieHeader()).resolves.toBeUndefined()
    await expect(getServerCookieHeader()).resolves.toBe("session=a%20b")
  })

  it("proxies headers, body, status and response headers", async () => {
    const backendResponse = {
      status: 201,
      headers: {
        get: (name: string) => ({
          "content-type": "text/plain",
          "set-cookie": "session=new-token; Path=/; HttpOnly",
        })[name] ?? null,
      },
      text: vi.fn().mockResolvedValue("created"),
    } as unknown as Response
    const fetchMock = vi.fn().mockResolvedValue(backendResponse)
    vi.stubGlobal("fetch", fetchMock)
    const request = {
      method: "POST",
      headers: {
        get: (name: string) => ({
          cookie: "other=value; session=token",
          "content-type": "application/json",
          accept: "application/json",
        })[name] ?? null,
      },
      text: vi.fn().mockResolvedValue(JSON.stringify({ title: "Article" })),
    } as unknown as Request

    const response = await proxyToBackend(request, "/api/articles")

    expect(response.status).toBe(201)
    expect(await response.text()).toBe("created")
    const [, init] = fetchMock.mock.calls[0]
    expect(init.body).toBe(JSON.stringify({ title: "Article" }))
  })

  it("omits body and optional headers for GET", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("[]", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await proxyToBackend(new Request("http://frontend/api/articles"), "/api/articles")

    const [, init] = fetchMock.mock.calls[0]
    expect(init.body).toBeUndefined()
    expect((init.headers as Headers).get("cookie")).toBeNull()
  })

  it("returns 503 when backend is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))

    const response = await proxyToBackend(
      new Request("http://frontend/api/articles"),
      "/api/articles"
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({ message: "Сервис временно недоступен" })
  })
})
