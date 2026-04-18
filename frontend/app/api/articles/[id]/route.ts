import { proxyToBackend } from "@/lib/backend-api"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params
  return proxyToBackend(request, `/api/articles/${id}`)
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params
  return proxyToBackend(request, `/api/articles/${id}`)
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params
  return proxyToBackend(request, `/api/articles/${id}`)
}
