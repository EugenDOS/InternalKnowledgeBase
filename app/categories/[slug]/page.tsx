import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCategoryBySlug, getArticlesByCategory } from "@/lib/db"
import ArticleList from "@/components/articles/article-list"

// Вложенный маршрут категории (Практика 3, 4: динамические и вложенные маршруты)
// Практика 7: данные загружаются из локальной PostgreSQL через lib/db.ts

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const articles = await getArticlesByCategory(category.id)

  return (
    <div className="flex flex-col gap-6">
      <Link href="/categories">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Назад к категориям
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
        <p className="text-sm text-muted-foreground">
          {category.description}
        </p>
      </div>

      <ArticleList articles={articles} />
    </div>
  )
}
