import { getAllArticles, searchArticles } from "@/lib/db"
import type { Article } from "@/lib/types"
import ArticleList from "@/components/articles/article-list"

// Страница списка статей (Практика 3: маршрутизация /articles)
// Практика 7: данные получаются через HTTP GET /api/articles

interface ArticlesPageProps {
  searchParams?: Promise<{
    q?: string | string[]
  }>
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const rawQuery = resolvedSearchParams?.q
  const query = Array.isArray(rawQuery) ? rawQuery[0] ?? "" : rawQuery ?? ""
  const normalizedQuery = query.trim()

  const articles: Article[] = normalizedQuery
    ? await searchArticles(normalizedQuery)
    : await getAllArticles()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Статьи</h1>
        <p className="text-sm text-muted-foreground">
          {normalizedQuery
            ? `Результаты поиска по запросу "${normalizedQuery}"`
            : "Все статьи корпоративной базы знаний"}
        </p>
      </div>
      <ArticleList articles={articles} />
    </div>
  )
}
