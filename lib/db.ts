// ==========================================
// Практика 7: Подключение к локальной PostgreSQL через pg.Pool
// Переменная DATABASE_URL задаётся в .env.local:
//   DATABASE_URL=postgresql://postgres:password@localhost:5432/knowledge_base
// ==========================================

import { Pool } from "pg"
import type { Article, Category, User } from "@/lib/types"

// Синглтон-пул соединений — переиспользуется между запросами в Next.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export default pool

// ==========================================
// Вспомогательные типы для raw-строк из БД
// ==========================================

interface ArticleRow {
  id: string
  title: string
  content: string
  excerpt: string
  category_id: string
  author_id: string
  tags: string[]
  created_at: Date
  updated_at: Date
}

interface CategoryRow {
  id: string
  name: string
  slug: string
  description: string
  article_count: string | number
}

interface UserRow {
  id: string
  username: string
  email: string
  role: string
  full_name: string
  created_at: Date
}

// ==========================================
// Конвертеры: snake_case (БД) → camelCase (приложение)
// ==========================================

function rowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    excerpt: row.excerpt,
    categoryId: row.category_id,
    authorId: row.author_id,
    tags: row.tags ?? [],
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
    updatedAt: row.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : String(row.updated_at),
  }
}

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    articleCount: Number(row.article_count),
  }
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role as User["role"],
    fullName: row.full_name,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
  }
}

// ==========================================
// Запросы: Articles
// ==========================================

export async function getAllArticles(): Promise<Article[]> {
  const { rows } = await pool.query<ArticleRow>(
    "SELECT * FROM articles ORDER BY created_at DESC"
  )
  return rows.map(rowToArticle)
}

export async function getArticleById(id: string): Promise<Article | null> {
  const { rows } = await pool.query<ArticleRow>(
    "SELECT * FROM articles WHERE id = $1",
    [id]
  )
  return rows[0] ? rowToArticle(rows[0]) : null
}

export async function getArticlesByCategory(categoryId: string): Promise<Article[]> {
  const { rows } = await pool.query<ArticleRow>(
    "SELECT * FROM articles WHERE category_id = $1 ORDER BY created_at DESC",
    [categoryId]
  )
  return rows.map(rowToArticle)
}

export async function searchArticles(query: string): Promise<Article[]> {
  const { rows } = await pool.query<ArticleRow>(
    `SELECT * FROM articles
     WHERE title ILIKE $1
        OR excerpt ILIKE $1
        OR $2 = ANY(tags)
     ORDER BY created_at DESC`,
    [`%${query}%`, query.toLowerCase()]
  )
  return rows.map(rowToArticle)
}

export async function createArticle(
  data: Omit<Article, "id" | "createdAt" | "updatedAt">
): Promise<Article> {
  const { rows } = await pool.query<ArticleRow>(
    `INSERT INTO articles (title, content, excerpt, category_id, author_id, tags)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.title, data.content, data.excerpt, data.categoryId, data.authorId, data.tags]
  )
  return rowToArticle(rows[0])
}

export async function updateArticle(
  id: string,
  data: Partial<Omit<Article, "id" | "createdAt" | "updatedAt">>
): Promise<Article | null> {
  const fields: string[] = []
  const values: unknown[] = []
  let idx = 1

  if (data.title !== undefined)      { fields.push(`title = $${idx++}`);       values.push(data.title) }
  if (data.content !== undefined)    { fields.push(`content = $${idx++}`);     values.push(data.content) }
  if (data.excerpt !== undefined)    { fields.push(`excerpt = $${idx++}`);     values.push(data.excerpt) }
  if (data.categoryId !== undefined) { fields.push(`category_id = $${idx++}`); values.push(data.categoryId) }
  if (data.authorId !== undefined)   { fields.push(`author_id = $${idx++}`);   values.push(data.authorId) }
  if (data.tags !== undefined)       { fields.push(`tags = $${idx++}`);        values.push(data.tags) }

  if (fields.length === 0) return getArticleById(id)

  values.push(id)
  const { rows } = await pool.query<ArticleRow>(
    `UPDATE articles SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  )
  return rows[0] ? rowToArticle(rows[0]) : null
}

export async function deleteArticle(id: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    "DELETE FROM articles WHERE id = $1",
    [id]
  )
  return (rowCount ?? 0) > 0
}

// ==========================================
// Запросы: Categories
// ==========================================

export async function getAllCategories(): Promise<Category[]> {
  const { rows } = await pool.query<CategoryRow>(
    "SELECT * FROM categories ORDER BY name"
  )
  return rows.map(rowToCategory)
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { rows } = await pool.query<CategoryRow>(
    "SELECT * FROM categories WHERE id = $1",
    [id]
  )
  return rows[0] ? rowToCategory(rows[0]) : null
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { rows } = await pool.query<CategoryRow>(
    "SELECT * FROM categories WHERE slug = $1",
    [slug]
  )
  return rows[0] ? rowToCategory(rows[0]) : null
}

// ==========================================
// Запросы: Users
// ==========================================

export async function getAllUsers(): Promise<User[]> {
  const { rows } = await pool.query<UserRow>(
    "SELECT * FROM users ORDER BY created_at"
  )
  return rows.map(rowToUser)
}

export async function getUserById(id: string): Promise<User | null> {
  const { rows } = await pool.query<UserRow>(
    "SELECT * FROM users WHERE id = $1",
    [id]
  )
  return rows[0] ? rowToUser(rows[0]) : null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { rows } = await pool.query<UserRow>(
    "SELECT * FROM users WHERE email = $1",
    [email]
  )
  return rows[0] ? rowToUser(rows[0]) : null
}
