import { cookies } from "next/headers"

function normalizeBaseUrl(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value
}

export function getBackendBaseUrl(): string {
  return normalizeBaseUrl(process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080")
}

export function getBackendUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${getBackendBaseUrl()}${normalizedPath}`
}

export async function getServerCookieHeader(): Promise<string | undefined> {
  const cookieStore = await cookies()
  const values = cookieStore.getAll()

  if (values.length === 0) {
    return undefined
  }

  return values.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ")
}

export async function proxyToBackend(request: Request, path: string): Promise<Response> {
  const headers = new Headers()
  const cookieHeader = request.headers.get("cookie")
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

  const backendResponse = await fetch(getBackendUrl(path), {
    method: request.method,
    headers,
    body: body && body.length > 0 ? body : undefined,
    cache: "no-store",
  })

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
