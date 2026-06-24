import { describe, expect, it } from "vitest"
import { store } from "@/store"
import { resetAgreement, setAccepted } from "@/store/slices/agreement-slice"
import { logout, setUser } from "@/store/slices/auth-slice"

describe("redux store", () => {
  it("registers application reducers with the expected initial state", () => {
    store.dispatch(logout())
    store.dispatch(resetAgreement())

    expect(store.getState()).toMatchObject({
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
      articles: {
        items: [],
        currentArticle: null,
        isLoading: false,
        error: null,
      },
      agreement: {
        isAccepted: false,
        isConfirmed: false,
        confirmedAt: null,
      },
    })
  })

  it("dispatches actions through the configured store", () => {
    store.dispatch(
      setUser({
        id: "u1",
        username: "admin",
        email: "admin@example.test",
        role: "admin",
        fullName: "Admin User",
        createdAt: "2026-06-23T00:00:00.000Z",
      })
    )
    store.dispatch(setAccepted(true))

    expect(store.getState().auth).toMatchObject({
      isAuthenticated: true,
      user: { id: "u1", role: "admin" },
    })
    expect(store.getState().agreement.isAccepted).toBe(true)

    store.dispatch(logout())
    store.dispatch(resetAgreement())
  })
})
