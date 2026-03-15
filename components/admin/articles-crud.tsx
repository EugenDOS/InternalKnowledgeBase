"use client"

// ==========================================
// ArticlesCrud — клиентский компонент управления статьями
// Практика 7: все операции с БД выполняются через HTTP-запросы к REST API:
//   GET    /api/articles        — загрузить список
//   POST   /api/articles        — создать статью
//   PUT    /api/articles/:id    — обновить статью
//   DELETE /api/articles/:id    — удалить статью
// Redux async thunks отправляют эти запросы и обновляют Store
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
import { Pencil, Trash2, Plus } from "lucide-react"

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

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ArticleFormData>(EMPTY_FORM)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // При монтировании — HTTP GET /api/articles через Redux thunk
  useEffect(() => {
    dispatch(fetchArticlesThunk())
  }, [dispatch])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
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
      // HTTP PUT /api/articles/:id
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
      // HTTP POST /api/articles
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
    // HTTP DELETE /api/articles/:id
    await dispatch(deleteArticleThunk(id))
    setDeleteConfirmId(null)
  }

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Статьи</h2>
        <Button size="sm" className="gap-2" onClick={openCreate}>
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
              <TableHead>Теги</TableHead>
              <TableHead>Обновлено</TableHead>
              <TableHead className="w-24 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Статей пока нет
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium text-foreground">
                    {article.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {categoryName(article.categoryId)}
                  </TableCell>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
              <label className="text-sm font-medium text-foreground">Автор</label>
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
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Теги{" "}
                <span className="text-muted-foreground font-normal">
                  (через запятую)
                </span>
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
            Это действие нельзя отменить. Статья будет удалена из базы данных через
            HTTP DELETE-запрос к{" "}
            <code className="font-mono text-xs">/api/articles/{deleteConfirmId}</code>.
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
