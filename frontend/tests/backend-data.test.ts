import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { Article, Category, User } from "@/lib/types"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/backend-api", () => ({
  getBackendUrl: (path: string) => `http://backend${path}`,
  getServerCookieHeader: vi.fn().mockResolvedValue("session=token"),
}))

import {
  createArticle,
  deleteArticle,
  getAllArticles,
  getAllCategories,
  getAllUsers,
  getArticleById,
  getArticlesByCategory,
  getCategoryById,
  getCategoryBySlug,
  getUserById,
  searchArticles,
  updateArticle,
} from "@/lib/backend-data"

const article: Article = {
  id: "article-1",
  title: "Article",
  content: "Content",
  excerpt: "Excerpt",
  categoryId: "category-1",
  authorId: "user-1",
  authorFullName: "Test User",
  tags: ["test"],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
}
const category: Category = {
  id: "category-1",
  name: "Category",
  slug: "category",
  description: "Description",
  articleCount: 1,
}
const user: User = {
  id: "user-1",
  username: "tester",
  email: "test@company.ru",
  role: "user",
  fullName: "Test User",
  createdAt: "2026-01-01T00:00:00Z",
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("backend data helpers", () => {
  it("reads, filters and searches articles", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify([article]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(article), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([article]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([article]), { status: 200 }))

    await expect(getAllArticles()).resolves.toEqual([article])
    await expect(getArticleById(article.id)).resolves.toEqual(article)
    await expect(getArticleById("missing")).resolves.toBeNull()
    await expect(getArticlesByCategory(category.id)).resolves.toEqual([article])
    await expect(searchArticles("Article")).resolves.toEqual([article])
    expect(vi.mocked(fetch).mock.calls.at(-1)?.[0]).toContain("q=Article")
  })

  it("uses safe fallbacks for article read failures", async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockRejectedValueOnce(new Error("offline"))

    await expect(getAllArticles()).resolves.toEqual([])
    await expect(getArticleById(article.id)).resolves.toBeNull()
    await expect(searchArticles("Article")).resolves.toEqual([])
  })

  it("creates, updates and deletes articles", async () => {
    const input = {
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      categoryId: article.categoryId,
      authorId: article.authorId,
      authorFullName: article.authorFullName,
      tags: article.tags,
    }
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(article), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(article), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(createArticle(input)).resolves.toEqual(article)
    await expect(updateArticle(article.id, { title: "Updated" })).resolves.toEqual(article)
    await expect(deleteArticle(article.id)).resolves.toBe(true)
  })

  it("reports mutation failures and missing updates", async () => {
    const input = {
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      categoryId: article.categoryId,
      authorId: article.authorId,
      authorFullName: article.authorFullName,
      tags: article.tags,
    }
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 500 }))

    await expect(createArticle(input)).rejects.toThrow("Не удалось создать статью")
    await expect(updateArticle("missing", { title: "Updated" })).resolves.toBeNull()
    await expect(updateArticle(article.id, { title: "Updated" })).rejects.toThrow(
      "Не удалось обновить статью"
    )
  })

  it("reads categories with not-found and fallback paths", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify([category]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([category]), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ category }), { status: 200 })
      )
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockRejectedValueOnce(new Error("offline"))

    await expect(getAllCategories()).resolves.toEqual([category])
    await expect(getCategoryById(category.id)).resolves.toEqual(category)
    await expect(getCategoryBySlug(category.slug)).resolves.toEqual(category)
    await expect(getCategoryBySlug("missing")).resolves.toBeNull()
    await expect(getAllCategories()).resolves.toEqual([])
  })

  it("reads users with not-found and fallback paths", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify([user]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(user), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockRejectedValueOnce(new Error("offline"))

    await expect(getAllUsers()).resolves.toEqual([user])
    await expect(getUserById(user.id)).resolves.toEqual(user)
    await expect(getUserById("missing")).resolves.toBeNull()
    await expect(getAllUsers()).resolves.toEqual([])
  })
})
