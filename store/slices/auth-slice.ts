// ==========================================
// Заглушка Redux Slice для аутентификации
// Практика 5: Redux (Store, Reducers, Action Creators)
// Практика 6: Аутентификация и RBAC
// ==========================================
//
// Для реализации:
// 1. Установить: npm install @reduxjs/toolkit react-redux
// 2. Раскомментировать код ниже
// 3. Подключить в store/index.ts
//
// import { createSlice, PayloadAction } from "@reduxjs/toolkit"
// import type { AuthState, User } from "@/lib/types"
//
// const initialState: AuthState = {
//   user: null,
//   isAuthenticated: false,
//   isLoading: false,
// }
//
// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     loginStart(state) {
//       state.isLoading = true
//     },
//     loginSuccess(state, action: PayloadAction<User>) {
//       state.user = action.payload
//       state.isAuthenticated = true
//       state.isLoading = false
//     },
//     loginFailure(state) {
//       state.isLoading = false
//     },
//     logout(state) {
//       state.user = null
//       state.isAuthenticated = false
//     },
//   },
// })
//
// export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions
// export default authSlice.reducer

export {}
