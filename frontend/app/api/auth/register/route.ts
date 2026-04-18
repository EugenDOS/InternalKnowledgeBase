import { proxyToBackend } from "@/lib/backend-api"

export async function POST(request: Request) {
  return proxyToBackend(request, "/api/auth/register")
}
