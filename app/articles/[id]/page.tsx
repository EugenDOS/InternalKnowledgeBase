import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Article, Category, User } from "@/lib/types"

// Страница конкретной статьи — динамический маршрут (Практика 3: динамические маршруты)
// Практика 7: данные получаются через HTTP GET /api/articles/:id, /api/categories/:slug, /api/users

interface ArticlePageProps {
  params: Promise<{ id: string }>
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

  // HTTP GET /api/articles/:id
  const articleRes = await fetch(`${base}/api/articles/${id}`, { cache: "no-store" })
  if (!articleRes.ok) notFound()
  const article: Article = await articleRes.json()

  // HTTP GET /api/categories и /api/users — для отображения имён
  const [categoriesRes, usersRes] = await Promise.all([
    fetch(`${base}/api/categories`, { cache: "no-store" }),
    fetch(`${base}/api/users`, { cache: "no-store" }),
  ])

  const categories: Category[] = categoriesRes.ok ? await categoriesRes.json() : []
  const users: User[] = usersRes.ok ? await usersRes.json() : []

  const category = categories.find((c) => c.id === article.categoryId) ?? null
  const author = users.find((u) => u.id === article.authorId) ?? null

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link href="/articles">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Назад к статьям
        </Button>
      </Link>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-foreground">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {category && <span>Категория: {category.name}</span>}
              {author && <span>Автор: {author.fullName}</span>}
              <span>
                Обновлено: {new Date(article.updatedAt).toLocaleDateString("ru-RU")}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {article.content}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
