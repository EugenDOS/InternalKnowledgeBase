import Link from "next/link"
import { FileText, FolderOpen, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Article, Category, User } from "@/lib/types"
import HomeGuard from "@/components/layout/home-guard"

// Главная страница — дашборд со статистикой
// Практика 7: данные получаются через HTTP GET-запросы к REST API (/api/articles, /api/categories, /api/users)

async function getStats() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

  const [articlesRes, categoriesRes, usersRes] = await Promise.all([
    fetch(`${base}/api/articles`, { cache: "no-store" }),
    fetch(`${base}/api/categories`, { cache: "no-store" }),
    fetch(`${base}/api/users`, { cache: "no-store" }),
  ])

  const [articles, categories, users]: [Article[], Category[], User[]] =
    await Promise.all([
      articlesRes.ok ? articlesRes.json() : [],
      categoriesRes.ok ? categoriesRes.json() : [],
      usersRes.ok ? usersRes.json() : [],
    ])

  return { articles, categories, users }
}

export default async function HomePage() {
  const { articles, categories, users } = await getStats()

  const stats = [
    { title: "Статьи",       value: articles.length,   icon: FileText,  href: "/articles"   },
    { title: "Категории",    value: categories.length, icon: FolderOpen, href: "/categories" },
    { title: "Пользователи", value: users.length,      icon: Users,     href: "/admin"       },
  ]

  return (
    <HomeGuard>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Главная</h1>
          <p className="text-sm text-muted-foreground">
            Добро пожаловать в корпоративную базу знаний
          </p>
        </div>

        {/* Карточки со статистикой */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Последние статьи */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Последние статьи</h2>
          <div className="flex flex-col gap-3">
            {articles.slice(0, 3).map((article) => (
              <Link key={article.id} href={`/articles/${article.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardContent className="pt-4">
                    <h3 className="font-medium text-foreground">{article.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{article.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </HomeGuard>
  )
}
