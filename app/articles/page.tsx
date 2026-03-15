import type { Article } from "@/lib/types"
import ArticleList from "@/components/articles/article-list"

// Страница списка статей (Практика 3: маршрутизация /articles)
// Практика 7: данные получаются через HTTP GET /api/articles

export default async function ArticlesPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  const res = await fetch(`${base}/api/articles`, { cache: "no-store" })
  const articles: Article[] = res.ok ? await res.json() : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Статьи</h1>
        <p className="text-sm text-muted-foreground">
          Все статьи корпоративной базы знаний
        </p>
      </div>
      <ArticleList articles={articles} />
    </div>
  )
}
