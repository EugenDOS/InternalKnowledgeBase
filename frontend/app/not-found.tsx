import Link from "next/link"
import { FileSearch, Home, FolderOpen, FileText } from "lucide-react"
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
      <EmptyContent className="w-full max-w-none items-start">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-start">
          <Button asChild>
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              На главную
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/articles" className="gap-2">
              <FileText className="h-4 w-4" />
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
    </div>
  )
}
