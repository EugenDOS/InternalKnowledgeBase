import "server-only"

import type { Article, Category, User } from "@/lib/types"
import { getBackendUrl, getServerCookieHeader } from "@/lib/backend-api"

async function fetchBackend(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  const cookieHeader = await getServerCookieHeader()

  if (cookieHeader && !headers.has("cookie")) {
    headers.set("cookie", cookieHeader)
  }

  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json")
  }

  return fetch(getBackendUrl(path), {
    ...init,
    headers,
    cache: "no-store",
  })
}

async function readJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>
}

export async function getAllArticles(): Promise<Article[]> {
  const response = await fetchBackend("/api/articles")
  return response.ok ? readJson<Article[]>(response) : []
}

export async function getArticleById(id: string): Promise<Article | null> {
  const response = await fetchBackend(`/api/articles/${id}`)

  if (response.status === 404) {
    return null
  }

  return response.ok ? readJson<Article>(response) : null
}

export async function getArticlesByCategory(categoryId: string): Promise<Article[]> {
  const articles = await getAllArticles()
  return articles.filter((article) => article.categoryId === categoryId)
}

export async function searchArticles(query: string): Promise<Article[]> {
  const searchParams = new URLSearchParams({ q: query })
  const response = await fetchBackend(`/api/articles?${searchParams.toString()}`)
  return response.ok ? readJson<Article[]>(response) : []
}

export async function createArticle(
  data: Omit<Article, "id" | "createdAt" | "updatedAt">
): Promise<Article> {
  const response = await fetchBackend("/api/articles", {
    method: "POST",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Не удалось создать статью")
  }

  return readJson<Article>(response)
}

export async function updateArticle(
  id: string,
  data: Partial<Omit<Article, "id" | "createdAt" | "updatedAt">>
): Promise<Article | null> {
  const response = await fetchBackend(`/api/articles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error("Не удалось обновить статью")
  }

  return readJson<Article>(response)
}

export async function deleteArticle(id: string): Promise<boolean> {
  const response = await fetchBackend(`/api/articles/${id}`, {
    method: "DELETE",
  })

  return response.ok
}

export async function getAllCategories(): Promise<Category[]> {
  const response = await fetchBackend("/api/categories")
  return response.ok ? readJson<Category[]>(response) : []
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await getAllCategories()
  return categories.find((category) => category.id === id) ?? null
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const response = await fetchBackend(`/api/categories/${slug}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    return null
  }

  const data = await readJson<{ category: Category }>(response)
  return data.category
}

export async function getAllUsers(): Promise<User[]> {
  const response = await fetchBackend("/api/users")
  return response.ok ? readJson<User[]>(response) : []
}

export async function getUserById(id: string): Promise<User | null> {
  const response = await fetchBackend(`/api/users/${id}`)

  if (response.status === 404) {
    return null
  }

  return response.ok ? readJson<User>(response) : null
}
