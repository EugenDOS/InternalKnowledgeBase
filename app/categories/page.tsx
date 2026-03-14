import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllCategories } from "@/lib/db"

// Страница списка категорий (Практика 3: маршрутизация /categories)
// Практика 7: данные загружаются из локальной PostgreSQL через lib/db.ts

export default async function CategoriesPage() {
  const categories = await getAllCategories()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Категории</h1>
        <p className="text-sm text-muted-foreground">
          Категории статей базы знаний
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Card className="transition-colors hover:bg-accent">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-foreground">
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
                <Badge variant="secondary" className="mt-3">
                  {category.articleCount}{" "}
                  {category.articleCount === 1 ? "статья" : "статей"}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
