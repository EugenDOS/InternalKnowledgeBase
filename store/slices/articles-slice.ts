// ==========================================
// Redux Slice статей
// Практика 5: Redux (Store, Reducers, Action Creators)
// Практика 7: CRUD через HTTP-запросы к REST API (/api/articles)
// Практика 8: RBAC — thunks передают x-user-id и x-user-role в заголовках
// ==========================================

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { ArticlesState, Article } from "@/lib/types"
import type { RootState } from "@/store/index"

// --- Начальное состояние ---
const initialState: ArticlesState = {
  items: [],
  currentArticle: null,
  isLoading: false,
  error: null,
}

// ==========================================
// Вспомогательная функция: строит заголовки с данными текущего пользователя
// Практика 8: серверный RBAC читает x-user-id и x-user-role
// ==========================================
function authHeaders(state: RootState): HeadersInit {
  const user = state.auth.user
  if (!user) return { "Content-Type": "application/json" }
  return {
    "Content-Type": "application/json",
    "x-user-id": user.id,
    "x-user-role": user.role,
  }
}

// ==========================================
// Async Thunks — HTTP-запросы к REST API
// ==========================================

// GET /api/articles — загрузить все статьи (публично, без заголовков)
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

// POST /api/articles — создать статью
// Практика 8: передаём x-user-id и x-user-role; сервер проверяет, что authorId === userId (для role=user)
export const createArticleThunk = createAsyncThunk<
  Article,
  Omit<Article, "id" | "createdAt" | "updatedAt">,
  { rejectValue: string; state: RootState }
>("articles/create", async (articleData, { rejectWithValue, getState }) => {
  const res = await fetch("/api/articles", {
    method: "POST",
    headers: authHeaders(getState()),
    body: JSON.stringify(articleData),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return rejectWithValue((data as { error?: string }).error ?? "Ошибка создания статьи")
  }
  return res.json() as Promise<Article>
})

// PUT /api/articles/:id — обновить статью
// Практика 8: сервер проверяет ownership (admin — любая, user — только своя)
export const updateArticleThunk = createAsyncThunk<
  Article,
  { id: string; data: Partial<Omit<Article, "id" | "createdAt" | "updatedAt">> },
  { rejectValue: string; state: RootState }
>("articles/update", async ({ id, data }, { rejectWithValue, getState }) => {
  const res = await fetch(`/api/articles/${id}`, {
    method: "PUT",
    headers: authHeaders(getState()),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    return rejectWithValue((d as { error?: string }).error ?? "Ошибка обновления статьи")
  }
  return res.json() as Promise<Article>
})

// DELETE /api/articles/:id — удалить статью
// Практика 8: сервер проверяет ownership (admin — любая, user — только своя)
export const deleteArticleThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>("articles/delete", async (id, { rejectWithValue, getState }) => {
  const res = await fetch(`/api/articles/${id}`, {
    method: "DELETE",
    headers: authHeaders(getState()),
  })
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
