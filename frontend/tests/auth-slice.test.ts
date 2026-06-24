import { configureStore } from "@reduxjs/toolkit"
import { afterEach, describe, expect, it, vi } from "vitest"
import reducer, {
  clearError,
  loginThunk,
  logout,
  logoutThunk,
  restoreSessionThunk,
  setUser,
} from "@/store/slices/auth-slice"
import type { User } from "@/lib/types"

const user: User = {
  id: "user-1",
  username: "tester",
  email: "test@company.ru",
  role: "user",
  fullName: "Test User",
  createdAt: "2026-01-01T00:00:00Z",
}

function createStore() {
  return configureStore({ reducer: { auth: reducer } })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("auth slice", () => {
  it("handles synchronous actions", () => {
    let state = reducer(undefined, setUser(user))
    expect(state.user).toEqual(user)
    expect(state.isAuthenticated).toBe(true)

    state = reducer({ ...state, error: "error" }, clearError())
    expect(state.error).toBeNull()

    state = reducer(state, logout())
    expect(state).toMatchObject({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  })

  it("logs in and logs out through the API", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ user }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", fetchMock)
    const store = createStore()

    await store.dispatch(loginThunk({ email: user.email, password: "password123" }))
    expect(store.getState().auth).toMatchObject({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })

    await store.dispatch(logoutThunk())
    expect(store.getState().auth).toMatchObject({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  })

  it("stores backend and fallback login errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Неверные данные" }), { status: 401 })
      )
      .mockResolvedValueOnce(new Response("not-json", { status: 500 }))
    vi.stubGlobal("fetch", fetchMock)
    const store = createStore()

    await store.dispatch(loginThunk({ email: user.email, password: "wrong" }))
    expect(store.getState().auth.error).toBe("Неверные данные")

    await store.dispatch(loginThunk({ email: user.email, password: "wrong" }))
    expect(store.getState().auth.error).toBe("Ошибка входа")
  })

  it("restores present, absent and failed sessions", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ user }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockRejectedValueOnce(new Error("network"))
    vi.stubGlobal("fetch", fetchMock)
    const store = createStore()

    await store.dispatch(restoreSessionThunk())
    expect(store.getState().auth.user).toEqual(user)

    await store.dispatch(restoreSessionThunk())
    expect(store.getState().auth).toMatchObject({ user: null, isAuthenticated: false })

    await store.dispatch(restoreSessionThunk())
    expect(store.getState().auth).toMatchObject({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  })
})
