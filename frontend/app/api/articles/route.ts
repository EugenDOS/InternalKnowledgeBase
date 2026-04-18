import { proxyToBackend } from "@/lib/backend-api"

export async function GET(request: Request) {
  return proxyToBackend(request, "/api/articles")
}

export async function POST(request: Request) {
  return proxyToBackend(request, "/api/articles")
}
