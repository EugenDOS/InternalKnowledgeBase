import Link from "next/link"
import { FileSearch, Home, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function NotFound() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Страница не найдена</h1>
        <p className="text-sm text-muted-foreground">
          Возможно, материал был удалён, перемещён или адрес введён с ошибкой.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ошибка 404</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty className="border border-dashed border-border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileSearch className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Запрошенная страница недоступна</EmptyTitle>
              <EmptyDescription>
                Попробуйте перейти на главную страницу или открыть список статей и
                категорий.
              </EmptyDescription>
            </EmptyHeader>

            <EmptyContent className="sm:max-w-none">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild>
                  <Link href="/" className="gap-2">
                    <Home className="h-4 w-4" />
                    На главную
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/articles" className="gap-2">
                    <FileSearch className="h-4 w-4" />
                    К статьям
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/categories" className="gap-2">
                    <FolderOpen className="h-4 w-4" />
                    К категориям
                  </Link>
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    </div>
  )
}
