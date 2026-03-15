import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Category, User } from "@/lib/types"
import ProtectedRoute from "@/components/auth/protected-route"
import ArticlesCrud from "@/components/admin/articles-crud"

// Админ-панель (Практика 6: RBAC, Практика 7: CRUD через HTTP)
// Server Component: категории и пользователи загружаются через HTTP GET к API
// Client Component ArticlesCrud выполняет GET/POST/PUT/DELETE через Redux async thunks

// Практика 8: только две роли — admin и user
const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  user: "secondary",
}

const roleLabels: Record<string, string> = {
  admin: "Администратор",
  user: "Пользователь",
}

export default async function AdminPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

  // HTTP GET /api/users и /api/categories
  const [usersRes, categoriesRes] = await Promise.all([
    fetch(`${base}/api/users`, { cache: "no-store" }),
    fetch(`${base}/api/categories`, { cache: "no-store" }),
  ])

  const users: User[] = usersRes.ok ? await usersRes.json() : []
  const categories: Category[] = categoriesRes.ok ? await categoriesRes.json() : []

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Админ-панель</h1>
          <p className="text-sm text-muted-foreground">
            Управление пользователями и контентом
          </p>
        </div>

        {/* Таблица пользователей — только просмотр */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Пользователи</h2>
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
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-foreground">
                      {user.fullName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant[user.role] ?? "outline"}>
                        {roleLabels[user.role] ?? user.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* CRUD статей — клиентский компонент, все операции через HTTP */}
        <ArticlesCrud categories={categories} users={users} />
      </div>
    </ProtectedRoute>
  )
}
