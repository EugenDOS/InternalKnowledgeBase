import type { Article } from "@/lib/types"
import ArticleCard from "./article-card"

// Контейнерный компонент списка статей (Практика 4: контейнер + презентационный)
// В будущем будет получать данные из Redux Store (Практика 5) или через API (Практика 7)

interface ArticleListProps {
  articles: Article[]
}

export default function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Статьи не найдены.</p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
