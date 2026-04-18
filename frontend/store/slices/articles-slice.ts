// ==========================================
// Redux Slice статей
// Практика 5: Redux (Store, Reducers, Action Creators)
// Практика 7: CRUD через HTTP-запросы к REST API (/api/articles)
// ==========================================

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { ArticlesState, Article } from "@/lib/types"

// --- Начальное состояние ---
const initialState: ArticlesState = {
  items: [],
  currentArticle: null,
  isLoading: false,
  error: null,
}

// ==========================================
// Async Thunks — HTTP-запросы к REST API
// ==========================================

// GET /api/articles — загрузить все статьи
export const fetchArticlesThunk = createAsyncThunk<
  Article[],
  void,
  { rejectValue: string }
>("articles/fetchAll", async (_, { rejectWithValue }) => {
  const res = await fetch("/api/articles")
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return rejectWithValue((data as { error?: string }).error ?? "Ошибка загрузки статей")
  }
  return res.json() as Promise<Article[]>
})

// GET /api/articles/:id — загрузить одну статью
export const fetchArticleByIdThunk = createAsyncThunk<
  Article,
  string,
  { rejectValue: string }
>("articles/fetchById", async (id, { rejectWithValue }) => {
  const res = await fetch(`/api/articles/${id}`)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return rejectWithValue((data as { error?: string }).error ?? "Статья не найдена")
  }
  return res.json() as Promise<Article>
})

// POST /api/articles — создать новую статью
export const createArticleThunk = createAsyncThunk<
  Article,
  Omit<Article, "id" | "createdAt" | "updatedAt">,
  { rejectValue: string }
>("articles/create", async (articleData, { rejectWithValue }) => {
  const res = await fetch("/api/articles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(articleData),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return rejectWithValue((data as { error?: string }).error ?? "Ошибка создания статьи")
  }
  return res.json() as Promise<Article>
})

// PUT /api/articles/:id — обновить статью
export const updateArticleThunk = createAsyncThunk<
  Article,
  { id: string; data: Partial<Omit<Article, "id" | "createdAt" | "updatedAt">> },
  { rejectValue: string }
>("articles/update", async ({ id, data }, { rejectWithValue }) => {
  const res = await fetch(`/api/articles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    return rejectWithValue((d as { error?: string }).error ?? "Ошибка обновления статьи")
  }
  return res.json() as Promise<Article>
})

// DELETE /api/articles/:id — удалить статью
export const deleteArticleThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("articles/delete", async (id, { rejectWithValue }) => {
  const res = await fetch(`/api/articles/${id}`, { method: "DELETE" })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return rejectWithValue((data as { error?: string }).error ?? "Ошибка удаления статьи")
  }
  return id
})

// ==========================================
// Slice
// ==========================================

const articlesSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {
    setCurrentArticle(state, action: PayloadAction<Article | null>) {
      state.currentArticle = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // fetchAll
    builder
      .addCase(fetchArticlesThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchArticlesThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchArticlesThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? "Неизвестная ошибка"
      })

    // fetchById
    builder
      .addCase(fetchArticleByIdThunk.fulfilled, (state, action) => {
        state.currentArticle = action.payload
      })
      .addCase(fetchArticleByIdThunk.rejected, (state, action) => {
        state.error = action.payload ?? "Неизвестная ошибка"
      })

    // create
    builder
      .addCase(createArticleThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createArticleThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
      })
      .addCase(createArticleThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? "Неизвестная ошибка"
      })

    // update
    builder
      .addCase(updateArticleThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateArticleThunk.fulfilled, (state, action) => {
        state.isLoading = false
        const idx = state.items.findIndex((a) => a.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
        if (state.currentArticle?.id === action.payload.id) {
          state.currentArticle = action.payload
        }
      })
      .addCase(updateArticleThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? "Неизвестная ошибка"
      })

    // delete
    builder
      .addCase(deleteArticleThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteArticleThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = state.items.filter((a) => a.id !== action.payload)
        if (state.currentArticle?.id === action.payload) {
          state.currentArticle = null
        }
      })
      .addCase(deleteArticleThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? "Неизвестная ошибка"
      })
  },
})

export const { setCurrentArticle, clearError } = articlesSlice.actions
export default articlesSlice.reducer
