import CategoryCard from "@/components/categories/category-card"
import { getAllCategories } from "@/lib/backend-data"

export const dynamic = "force-dynamic"

// Страница списка категорий (Практика 3: маршрутизация /categories)
// Практика 7: данные получаются через HTTP GET /api/categories

export default async function CategoriesPage() {
  const categories = await getAllCategories()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Категории</h1>
        <p className="text-sm text-muted-foreground">Категории статей базы знаний</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}
