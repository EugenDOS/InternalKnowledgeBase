import Link from "next/link"
import { FileText, FolderOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllArticles, getAllCategories } from "@/lib/backend-data"

export const dynamic = "force-dynamic"

async function getHomeData() {
  const [articles, categories] = await Promise.all([
    getAllArticles(),
    getAllCategories(),
  ])

  return { articles, categories }
}

const sections = [
  {
    title: "Статьи",
    description: "Все материалы корпоративной базы знаний в одном разделе.",
    href: "/articles",
    icon: FileText,
  },
  {
    title: "Категории",
    description: "Разделы базы знаний для удобной навигации по темам.",
    href: "/categories",
    icon: FolderOpen,
  },
]

export default async function HomePage() {
  const { articles, categories } = await getHomeData()

  const sectionCounts = {
    "/articles": articles.length,
    "/categories": categories.length,
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Главная</h1>
        <p className="text-sm text-muted-foreground">
          Корпоративная база знаний для хранения и просмотра внутренних материалов.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon
          const count = sectionCounts[section.href as keyof typeof sectionCounts]

          return (
            <Link key={section.href} href={section.href}>
              <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary p-2 text-secondary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{count}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Последние статьи</h2>
          <p className="text-sm text-muted-foreground">
            Недавно добавленные материалы базы знаний.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {articles.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Статьи пока не добавлены.</p>
              </CardContent>
            </Card>
          ) : (
            articles.slice(0, 3).map((article) => (
              <Link key={article.id} href={`/articles/${article.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardContent className="pt-4">
                    <h3 className="font-medium text-foreground">{article.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{article.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
