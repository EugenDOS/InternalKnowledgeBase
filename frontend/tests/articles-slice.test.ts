import { configureStore } from "@reduxjs/toolkit"
import { afterEach, describe, expect, it, vi } from "vitest"
import reducer, {
  clearError,
  createArticleThunk,
  deleteArticleThunk,
  fetchArticleByIdThunk,
  fetchArticlesThunk,
  setCurrentArticle,
  updateArticleThunk,
} from "@/store/slices/articles-slice"
import type { Article } from "@/lib/types"

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

function createStore() {
  return configureStore({ reducer: { articles: reducer } })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("articles slice", () => {
  it("handles synchronous current article and error actions", () => {
    let state = reducer(undefined, setCurrentArticle(article))
    expect(state.currentArticle).toEqual(article)

    state = reducer({ ...state, error: "error" }, clearError())
    expect(state.error).toBeNull()

    state = reducer(state, setCurrentArticle(null))
    expect(state.currentArticle).toBeNull()
  })

  it("covers successful CRUD lifecycle", async () => {
    const updated = { ...article, title: "Updated" }
    const created = { ...article, id: "article-2" }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([article]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(article), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(created), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(updated), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", fetchMock)
    const store = createStore()

    await store.dispatch(fetchArticlesThunk())
    expect(store.getState().articles.items).toEqual([article])

    await store.dispatch(fetchArticleByIdThunk(article.id))
    expect(store.getState().articles.currentArticle).toEqual(article)

    await store.dispatch(
      createArticleThunk({
        title: created.title,
        content: created.content,
        excerpt: created.excerpt,
        categoryId: created.categoryId,
        authorId: created.authorId,
        authorFullName: created.authorFullName,
        tags: created.tags,
      })
    )
    expect(store.getState().articles.items[0]).toEqual(created)

    await store.dispatch(updateArticleThunk({ id: article.id, data: { title: "Updated" } }))
    expect(store.getState().articles.currentArticle).toEqual(updated)
    expect(store.getState().articles.items.find((item) => item.id === article.id)).toEqual(updated)

    await store.dispatch(deleteArticleThunk(article.id))
    expect(store.getState().articles.items.some((item) => item.id === article.id)).toBe(false)
    expect(store.getState().articles.currentArticle).toBeNull()
  })

  it("stores API and fallback errors for every operation", async () => {
    const responses = [
      ["Ошибка списка", 500],
      ["Статья отсутствует", 404],
      ["Ошибка создания", 400],
      ["Ошибка обновления", 400],
      ["Ошибка удаления", 403],
    ] as const
    const fetchMock = vi.fn()
    for (const [error, status] of responses) {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error }), { status })
      )
    }
    vi.stubGlobal("fetch", fetchMock)
    const store = createStore()

    await store.dispatch(fetchArticlesThunk())
    expect(store.getState().articles.error).toBe("Ошибка списка")
    await store.dispatch(fetchArticleByIdThunk("missing"))
    expect(store.getState().articles.error).toBe("Статья отсутствует")
    await store.dispatch(
      createArticleThunk({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        categoryId: article.categoryId,
        authorId: article.authorId,
        authorFullName: article.authorFullName,
        tags: article.tags,
      })
    )
    expect(store.getState().articles.error).toBe("Ошибка создания")
    await store.dispatch(updateArticleThunk({ id: article.id, data: { title: "Updated" } }))
    expect(store.getState().articles.error).toBe("Ошибка обновления")
    await store.dispatch(deleteArticleThunk(article.id))
    expect(store.getState().articles.error).toBe("Ошибка удаления")
  })

  it("uses fallback errors and leaves unmatched updates untouched", () => {
    const state = reducer(undefined, fetchArticlesThunk.rejected(null, "request", undefined))
    expect(state.error).toBe("Неизвестная ошибка")

    const unchanged = reducer(
      state,
      updateArticleThunk.fulfilled(article, "request", {
        id: article.id,
        data: { title: article.title },
      })
    )
    expect(unchanged.items).toEqual([])
  })

  it("uses operation-specific fallback errors when API error body is absent", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("not-json", { status: 500 }))
      .mockResolvedValueOnce(new Response("not-json", { status: 404 }))
      .mockResolvedValueOnce(new Response("not-json", { status: 400 }))
      .mockResolvedValueOnce(new Response("not-json", { status: 400 }))
      .mockResolvedValueOnce(new Response("not-json", { status: 403 }))
    vi.stubGlobal("fetch", fetchMock)
    const store = createStore()

    await store.dispatch(fetchArticlesThunk())
    expect(store.getState().articles.error).toBe("Ошибка загрузки статей")

    await store.dispatch(fetchArticleByIdThunk("missing"))
    expect(store.getState().articles.error).toBe("Статья не найдена")

    await store.dispatch(
      createArticleThunk({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        categoryId: article.categoryId,
        authorId: article.authorId,
        authorFullName: article.authorFullName,
        tags: article.tags,
      })
    )
    expect(store.getState().articles.error).toBe("Ошибка создания статьи")

    await store.dispatch(updateArticleThunk({ id: article.id, data: { title: "Updated" } }))
    expect(store.getState().articles.error).toBe("Ошибка обновления статьи")

    await store.dispatch(deleteArticleThunk(article.id))
    expect(store.getState().articles.error).toBe("Ошибка удаления статьи")
  })

  it("uses generic fallback errors for rejected actions without payload", () => {
    let state = reducer(undefined, fetchArticleByIdThunk.rejected(null, "request", article.id))
    expect(state.error).toBe("Неизвестная ошибка")

    state = reducer(state, createArticleThunk.rejected(null, "request", {
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      categoryId: article.categoryId,
      authorId: article.authorId,
      authorFullName: article.authorFullName,
      tags: article.tags,
    }))
    expect(state.error).toBe("Неизвестная ошибка")

    state = reducer(state, updateArticleThunk.rejected(null, "request", {
      id: article.id,
      data: { title: "Updated" },
    }))
    expect(state.error).toBe("Неизвестная ошибка")

    state = reducer(state, deleteArticleThunk.rejected(null, "request", article.id))
    expect(state.error).toBe("Неизвестная ошибка")
  })

  it("keeps current article when updated or deleted article does not match it", () => {
    const otherArticle = { ...article, id: "article-2", title: "Other" }
    const initialState = {
      items: [article],
      currentArticle: otherArticle,
      isLoading: true,
      error: null,
    }

    const afterUpdate = reducer(
      initialState,
      updateArticleThunk.fulfilled({ ...article, title: "Updated" }, "request", {
        id: article.id,
        data: { title: "Updated" },
      })
    )
    expect(afterUpdate.items[0].title).toBe("Updated")
    expect(afterUpdate.currentArticle).toEqual(otherArticle)

    const afterDelete = reducer(
      afterUpdate,
      deleteArticleThunk.fulfilled(article.id, "request", article.id)
    )
    expect(afterDelete.items).toEqual([])
    expect(afterDelete.currentArticle).toEqual(otherArticle)
  })
})
