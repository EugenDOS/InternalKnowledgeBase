import { mockArticles } from "@/lib/mock-data"
import ArticleList from "@/components/articles/article-list"

// Страница списка статей (Практика 3: маршрутизация /articles)

export default function ArticlesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Статьи</h1>
        <p className="text-sm text-muted-foreground">
          Все статьи корпоративной базы знаний
        </p>
      </div>
      <ArticleList articles={mockArticles} />
    </div>
  )
}
