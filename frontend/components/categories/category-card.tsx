import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Category } from "@/lib/types"

interface CategoryCardProps {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const articleLabel = category.articleCount === 1 ? "статья" : "статей"

  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="h-full transition-colors hover:bg-accent">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">{category.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{category.description}</p>
          <Badge variant="secondary" className="mt-3">
            {category.articleCount} {articleLabel}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  )
}
