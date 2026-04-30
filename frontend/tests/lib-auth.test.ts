import { describe, expect, it } from "vitest"
import {
  getCurrentRole,
  hasRole,
  isAuthenticated,
  isOwnerOrAdmin,
} from "@/lib/auth"
import type { AuthState, User } from "@/lib/types"

function user(role: User["role"] = "user", id = "user-1"): User {
  return {
    id,
    username: id,
    email: `${id}@company.ru`,
    role,
    fullName: `User ${id}`,
    createdAt: "2026-01-01T00:00:00Z",
  }
}

function auth(currentUser: User | null, isAuth = currentUser !== null): AuthState {
  return {
    user: currentUser,
    isAuthenticated: isAuth,
    isLoading: false,
    error: null,
  }
}

describe("auth helpers", () => {
  it("checks authentication by flag and user presence", () => {
    expect(isAuthenticated(auth(user()))).toBe(true)
    expect(isAuthenticated(auth(null, false))).toBe(false)
    expect(isAuthenticated(auth(null, true))).toBe(false)
  })

  it("checks role hierarchy", () => {
    expect(hasRole(auth(user("admin")), "admin")).toBe(true)
    expect(hasRole(auth(user("admin")), "user")).toBe(true)
    expect(hasRole(auth(user("user")), "user")).toBe(true)
    expect(hasRole(auth(user("user")), "admin")).toBe(false)
    expect(hasRole(auth({ ...user("user"), role: "broken" as "user" }), "user")).toBe(false)
    expect(hasRole(auth(user("user")), "broken" as "user")).toBe(true)
    expect(hasRole(auth(null), "user")).toBe(false)
  })

  it("returns current role", () => {
    expect(getCurrentRole(auth(user("admin")))).toBe("admin")
    expect(getCurrentRole(auth(null))).toBeNull()
  })

  it("checks owner or admin access", () => {
    expect(isOwnerOrAdmin(auth(user("admin", "admin-1")), "user-1")).toBe(true)
    expect(isOwnerOrAdmin(auth(user("user", "user-1")), "user-1")).toBe(true)
    expect(isOwnerOrAdmin(auth(user("user", "user-1")), "user-2")).toBe(false)
    expect(isOwnerOrAdmin(auth(null), "user-1")).toBe(false)
  })
})
