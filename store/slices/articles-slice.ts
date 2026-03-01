// ==========================================
// Redux Slice статей
// Практика 5: Redux (Store, Reducers, Action Creators)
// Практика 7 (подготовка): CRUD через REST API
// ==========================================

import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { ArticlesState, Article } from "@/lib/types"

// --- Начальное состояние ---
const initialState: ArticlesState = {
    items: [],
    currentArticle: null,
    isLoading: false,
    error: null,
}

// --- Slice ---
const articlesSlice = createSlice({
    name: "articles",
    initialState,
    reducers: {
        // Action Creator: загрузить все статьи в store
        setArticles(state, action: PayloadAction<Article[]>) {
            state.items = action.payload
            state.isLoading = false
        },
        // Action Creator: установить текущую открытую статью
        setCurrentArticle(state, action: PayloadAction<Article | null>) {
            state.currentArticle = action.payload
        },
        // Action Creator: добавить новую статью (Практика 7: POST)
        addArticle(state, action: PayloadAction<Article>) {
            state.items.push(action.payload)
        },
        // Action Creator: обновить существующую статью (Практика 7: PUT)
        updateArticle(state, action: PayloadAction<Article>) {
            const index = state.items.findIndex((a) => a.id === action.payload.id)
            if (index !== -1) state.items[index] = action.payload
            if (state.currentArticle?.id === action.payload.id) {
                state.currentArticle = action.payload
            }
        },
        // Action Creator: удалить статью по id (Практика 7: DELETE)
        removeArticle(state, action: PayloadAction<string>) {
            state.items = state.items.filter((a) => a.id !== action.payload)
            if (state.currentArticle?.id === action.payload) {
                state.currentArticle = null
            }
        },
        // Action Creator: переключить состояние загрузки
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload
        },
        // Action Creator: установить сообщение об ошибке
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload
            state.isLoading = false
        },
    },
})

export const {
    setArticles,
    setCurrentArticle,
    addArticle,
    updateArticle,
    removeArticle,
    setLoading,
    setError,
} = articlesSlice.actions

export default articlesSlice.reducer
