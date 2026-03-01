// ==========================================
// Типы данных для платформы базы знаний
// ==========================================

// --- Пользователи и роли (Практика 6, 8: RBAC/ABAC) ---

export type UserRole = "admin" | "editor" | "viewer"

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  fullName: string
  createdAt: string
}

// --- Категории ---

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  articleCount: number
}

// --- Статьи ---

export interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  categoryId: string
  authorId: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

// --- Состояние аутентификации (Практика 5: Redux, Практика 6: Auth) ---

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// --- Состояние статей (Практика 5: Redux) ---

export interface ArticlesState {
  items: Article[]
  currentArticle: Article | null
  isLoading: boolean
  error: string | null
}
