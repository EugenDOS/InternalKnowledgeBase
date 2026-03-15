"use client"

// ==========================================
// ArticlesCrud — управление статьями с RBAC
// Практика 7: все операции через HTTP к REST API
// Практика 8: разграничение прав по ролям
//
//   admin — видит ВСЕ статьи, редактирует и удаляет любую
//   user  — видит только СВОИ статьи, редактирует и удаляет только их
//
// Серверная проверка: API-маршруты дополнительно верифицируют ownership
// по заголовкам x-user-id / x-user-role (двойная защита).
// ==========================================

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchArticlesThunk,
  createArticleThunk,
  updateArticleThunk,
  deleteArticleThunk,
  clearError,
} from "@/store/slices/articles-slice"
import { isOwnerOrAdmin } from "@/lib/auth"
import type { Article, Category, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Pencil, Trash2, Plus, Lock } from "lucide-react"

interface ArticlesCrudProps {
  categories: Category[]
  users: User[]
}

interface ArticleFormData {
  title: string
  content: string
  excerpt: string
  categoryId: string
  authorId: string
  tags: string
}

const EMPTY_FORM: ArticleFormData = {
  title: "",
  content: "",
  excerpt: "",
  categoryId: "",
  authorId: "",
  tags: "",
}

export default function ArticlesCrud({ categories, users }: ArticlesCrudProps) {
  const dispatch = useAppDispatch()
  const { items: articles, isLoading, error } = useAppSelector((s) => s.articles)
  const auth = useAppSelector((s) => s.auth)
  const currentUser = auth.user

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ArticleFormData>(EMPTY_FORM)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // При монтировании — HTTP GET /api/articles
  useEffect(() => {
    dispatch(fetchArticlesThunk())
  }, [dispatch])

  // Практика 8: фильтрация статей по роли
  //   admin — все статьи
  //   user  — только свои
  const visibleArticles =
    currentUser?.role === "admin"
      ? articles
      : articles.filter((a) => a.authorId === currentUser?.id)

  function openCreate() {
    setEditingId(null)
    // Практика 8: для user автоматически устанавливаем себя как автора
    setForm({
      ...EMPTY_FORM,
      authorId: currentUser?.role === "user" ? (currentUser.id ?? "") : "",
    })
    dispatch(clearError())
    setDialogOpen(true)
  }

  function openEdit(article: Article) {
    setEditingId(article.id)
    setForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      categoryId: article.categoryId,
      authorId: article.authorId,
      tags: article.tags.join(", "),
    })
    dispatch(clearError())
    setDialogOpen(true)
  }

  async function handleSubmit() {
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    if (editingId) {
      await dispatch(
        updateArticleThunk({
          id: editingId,
          data: {
            title: form.title,
            content: form.content,
            excerpt: form.excerpt,
            categoryId: form.categoryId,
            authorId: form.authorId,
            tags,
          },
        })
      )
    } else {
      await dispatch(
        createArticleThunk({
          title: form.title,
          content: form.content,
          excerpt: form.excerpt,
          categoryId: form.categoryId,
          authorId: form.authorId,
          tags,
        })
      )
    }
    setDialogOpen(false)
  }

  async function handleDelete(id: string) {
    await dispatch(deleteArticleThunk(id))
    setDeleteConfirmId(null)
  }

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id

  const authorName = (id: string) =>
    users.find((u) => u.id === id)?.fullName ?? id

  const isAdmin = currentUser?.role === "admin"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-semibold text-foreground">
            {isAdmin ? "Все статьи" : "Мои статьи"}
          </h2>
          {/* Практика 8: пояснение роли пользователя */}
          <p className="text-xs text-muted-foreground">
            {isAdmin
              ? "Роль: Администратор — полный доступ ко всем статьям"
              : "Роль: Пользователь — управление только своими статьями"}
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate} disabled={!currentUser}>
          <Plus className="h-4 w-4" />
          Добавить статью
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Категория</TableHead>
              {isAdmin && <TableHead>Автор</TableHead>}
              <TableHead>Теги</TableHead>
              <TableHead>Обновлено</TableHead>
              <TableHead className="w-24 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && visibleArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : visibleArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground">
                  {isAdmin ? "Статей пока нет" : "У вас ещё нет статей"}
                </TableCell>
              </TableRow>
            ) : (
              visibleArticles.map((article) => {
                // Практика 8: проверяем право на редактирование/удаление
                const canEdit = isOwnerOrAdmin(auth, article.authorId)

                return (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium text-foreground">
                      {article.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {categoryName(article.categoryId)}
                    </TableCell>
                    {/* Практика 8: колонка автора только для admin */}
                    {isAdmin && (
                      <TableCell className="text-muted-foreground">
                        {authorName(article.authorId)}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(article.updatedAt).toLocaleDateString("ru-RU")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(article)}
                              aria-label="Редактировать"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirmId(article.id)}
                              aria-label="Удалить"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        ) : (
                          // Практика 8: чужая статья — показываем иконку замка
                          <span
                            className="flex items-center justify-center h-8 w-8 text-muted-foreground"
                            title="Нет прав на редактирование чужой статьи"
                          >
                            <Lock className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Диалог создания / редактирования */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Редактировать статью" : "Новая статья"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Заголовок</label>
              <Input
                placeholder="Введите заголовок"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Краткое описание</label>
              <Input
                placeholder="Краткое описание статьи"
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Содержимое</label>
              <Textarea
                placeholder="Текст статьи"
                rows={5}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Категория</label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Автор
                {/* Практика 8: user не может менять автора */}
                {!isAdmin && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (только свои статьи)
                  </span>
                )}
              </label>
              {isAdmin ? (
                <Select
                  value={form.authorId}
                  onValueChange={(v) => setForm((f) => ({ ...f, authorId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите автора" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.fullName}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({u.role})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                // Практика 8: для user поле автора заблокировано — только он сам
                <Input
                  value={currentUser?.fullName ?? ""}
                  disabled
                  className="opacity-70"
                />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Теги{" "}
                <span className="text-muted-foreground font-normal">(через запятую)</span>
              </label>
              <Input
                placeholder="react, typescript, api"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !form.title || !form.categoryId || !form.authorId}
            >
              {isLoading ? "Сохранение..." : editingId ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить статью?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Статья будет безвозвратно удалена из базы данных. Запрос{" "}
            <code className="font-mono text-xs">
              DELETE /api/articles/{deleteConfirmId}
            </code>{" "}
            выполняется с проверкой прав на сервере.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              {isLoading ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
