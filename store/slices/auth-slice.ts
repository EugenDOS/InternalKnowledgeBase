// ==========================================
// Redux Slice аутентификации
// Практика 5: Redux (Store, Reducers, Action Creators)
// Практика 6: Аутентификация и RBAC
// ==========================================

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { AuthState, User } from "@/lib/types"

// --- Начальное состояние ---
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
}

// --- Async Thunk: логин через API ---
// Практика 6: отправляет запрос на /api/auth/login, получает User
export const loginThunk = createAsyncThunk<
    User,
    { email: string; password: string },
    { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        return rejectWithValue((data as { error?: string }).error ?? "Ошибка входа")
    }

    const data = (await res.json()) as { user: User }
    return data.user
})

// --- Slice ---
const authSlice = createSlice({
    name: "auth",
    initialState,
    // Синхронные редюсеры (Action Creators генерируются автоматически)
    reducers: {
        // Action Creator: logout — сбрасывает состояние аутентификации
        logout(state) {
            state.user = null
            state.isAuthenticated = false
            state.error = null
        },
        // Action Creator: clearError — сброс ошибки
        clearError(state) {
            state.error = null
        },
        // Action Creator: setUser — прямая установка пользователя (для SSR/hydration)
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload
            state.isAuthenticated = true
        },
    },
    // Обработка состояний async thunk
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.isLoading = false
                state.isAuthenticated = true
                state.user = action.payload
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload ?? "Неизвестная ошибка"
            })
    },
})

export const { logout, clearError, setUser } = authSlice.actions
export default authSlice.reducer
