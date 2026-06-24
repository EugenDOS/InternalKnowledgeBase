import { cookies } from "next/headers"

function normalizeBaseUrl(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value
}

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} must be configured`)
  }

  return value
}

export function getBackendCookieName(): string {
  return getRequiredEnvironmentVariable("BACKEND_AUTH_COOKIE_NAME")
}

export function getBackendBaseUrl(): string {
  return normalizeBaseUrl(getRequiredEnvironmentVariable("BACKEND_INTERNAL_URL"))
}

export function getBackendUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${getBackendBaseUrl()}${normalizedPath}`
}

export async function getServerCookieHeader(): Promise<string | undefined> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(getBackendCookieName())

  if (!authCookie) {
    return undefined
  }

  return `${authCookie.name}=${encodeURIComponent(authCookie.value)}`
}

function getBackendCookieHeaderFromRawCookieHeader(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) {
    return undefined
  }

  const cookieName = getBackendCookieName()
  const parts = cookieHeader.split(";").map((part) => part.trim())
  const authCookie = parts.find((part) => part.startsWith(`${cookieName}=`))

  return authCookie
}

export async function proxyToBackend(request: Request, path: string): Promise<Response> {
  const headers = new Headers()
  const cookieHeader = getBackendCookieHeaderFromRawCookieHeader(request.headers.get("cookie"))
  const contentType = request.headers.get("content-type")
  const accept = request.headers.get("accept")

  if (cookieHeader) {
    headers.set("cookie", cookieHeader)
  }

  if (contentType) {
    headers.set("content-type", contentType)
  }

  if (accept) {
    headers.set("accept", accept)
  }

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text()

  let backendResponse: Response

  try {
    backendResponse = await fetch(getBackendUrl(path), {
      method: request.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
      cache: "no-store",
    })
  } catch {
    return new Response(JSON.stringify({ message: "Сервис временно недоступен" }), {
      status: 503,
      headers: {
        "content-type": "application/json",
      },
    })
  }

  const responseHeaders = new Headers()
  const backendContentType = backendResponse.headers.get("content-type")
  const backendSetCookie = backendResponse.headers.get("set-cookie")

  if (backendContentType) {
    responseHeaders.set("content-type", backendContentType)
  }

  if (backendSetCookie) {
    responseHeaders.append("set-cookie", backendSetCookie)
  }

  return new Response(await backendResponse.text(), {
    status: backendResponse.status,
    headers: responseHeaders,
  })
}
