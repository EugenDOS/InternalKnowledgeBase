import React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Article } from "@/lib/types"

// Презентационный компонент карточки статьи (Практика 2, 4)
// Обернут в React.memo для оптимизации перерисовок (Практика 4)

interface ArticleCardProps {
  article: Article
}

function ArticleCardComponent({ article }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.id}`}>
      <Card className="transition-colors hover:bg-accent">
        <CardContent className="pt-4">
          <h3 className="font-medium text-foreground">{article.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {article.excerpt}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// React.memo — предотвращение лишних перерисовок (Практика 4)
const ArticleCard = React.memo(ArticleCardComponent)
ArticleCard.displayName = "ArticleCard"

export default ArticleCard
