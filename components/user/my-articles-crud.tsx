"use client"

// ==========================================
// MyArticlesCrud — управление статьями текущего пользователя (роль user)
// Показывает и позволяет редактировать/удалять только свои статьи.
// Создание новой статьи автоматически подставляет authorId из auth.
// ==========================================

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchArticlesThunk,
  createArticleThunk,
  updateArticleThunk,
  deleteArticleThunk,
  clearError,
} from "@/store/slices/articles-slice"
import type { Article, Category } from "@/lib/types"
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

interface MyArticlesCrudProps {
  categories: Category[]
}

interface ArticleFormData {
  title: string
  content: string
  excerpt: string
  categoryId: string
  tags: string
}

const EMPTY_FORM: ArticleFormData = {
  title: "",
  content: "",
  excerpt: "",
  categoryId: "",
  tags: "",
}

export default function MyArticlesCrud({ categories }: MyArticlesCrudProps) {
  const dispatch = useAppDispatch()
  const { items: allArticles, isLoading, error } = useAppSelector((s) => s.articles)
  const currentUser = useAppSelector((s) => s.auth.user)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ArticleFormData>(EMPTY_FORM)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchArticlesThunk())
  }, [dispatch])

  // Фильтруем только статьи текущего пользователя
  const myArticles = currentUser
    ? allArticles.filter((a) => a.authorId === currentUser.id)
    : []

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
      tags: article.tags.join(", "),
    })
    dispatch(clearError())
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!currentUser) return
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
          // authorId всегда равен id текущего пользователя
          authorId: currentUser.id,
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Мои публикации</h2>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Новая статья
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
            {isLoading && myArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : myArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  У вас пока нет публикаций
                </TableCell>
              </TableRow>
            ) : (
              myArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium text-foreground">
                    <Link
                      href={`/articles/${article.id}`}
                      className="hover:underline hover:text-primary"
                    >
                      {article.title}
                    </Link>
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
              disabled={isLoading || !form.title || !form.categoryId}
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
            Это действие нельзя отменить. Статья будет безвозвратно удалена.
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
