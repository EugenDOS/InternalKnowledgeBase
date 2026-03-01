import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { mockUsers, mockArticles } from "@/lib/mock-data"
import ProtectedRoute from "@/components/auth/protected-route"

// Админ-панель (Практика 6: RBAC, Практика 8: разграничение прав)
// Обернута в ProtectedRoute — при реализации Практики 6 доступ будет ограничен

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  editor: "secondary",
  viewer: "outline",
}

const roleLabels: Record<string, string> = {
  admin: "Администратор",
  editor: "Редактор",
  viewer: "Читатель",
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Админ-панель</h1>
          <p className="text-sm text-muted-foreground">
            Управление пользователями и контентом
          </p>
        </div>

        {/* Таблица пользователей */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Пользователи
          </h2>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-foreground">
                      {user.fullName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant[user.role] || "outline"}>
                        {roleLabels[user.role] || user.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Таблица статей */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Статьи
          </h2>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Теги</TableHead>
                  <TableHead>Обновлено</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium text-foreground">
                      {article.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(article.updatedAt).toLocaleDateString("ru-RU")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
