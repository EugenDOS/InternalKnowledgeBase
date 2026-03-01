// ==========================================
// Redux Store — единое хранилище приложения
// Практика 5: configureStore, RootState, AppDispatch
// ==========================================

import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/auth-slice"
import articlesReducer from "./slices/articles-slice"

// Создаём единое хранилище (Store) с двумя редюсерами
export const store = configureStore({
    reducer: {
        auth: authReducer,         // Практика 6: состояние аутентификации
        articles: articlesReducer, // Практика 5/7: состояние статей
    },
})

// --- Типы для useSelector / useDispatch ---
// RootState — тип всего состояния хранилища
export type RootState = ReturnType<typeof store.getState>
// AppDispatch — тип функции dispatch (важен для typed thunks)
export type AppDispatch = typeof store.dispatch
