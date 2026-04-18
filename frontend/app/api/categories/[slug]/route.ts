import { proxyToBackend } from "@/lib/backend-api"

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params
  return proxyToBackend(request, `/api/categories/${slug}`)
}
