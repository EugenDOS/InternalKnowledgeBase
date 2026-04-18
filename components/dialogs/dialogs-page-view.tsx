"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DialogCard from "@/components/dialogs/dialog-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createDialogThread,
  getStoredDialogThreads,
  type DialogThread,
} from "@/lib/dialogs"
import type { Article } from "@/lib/types"
import { useAppSelector } from "@/store/hooks"

interface DialogsPageViewProps {
  initialThreads: DialogThread[]
  articles: Article[]
}

interface DialogFormState {
  title: string
  articleId: string
}

const EMPTY_FORM: DialogFormState = {
  title: "",
  articleId: "",
}

export default function DialogsPageView({ initialThreads, articles }: DialogsPageViewProps) {
  const router = useRouter()
  const user = useAppSelector((state) => state.auth.user)
  const [threads, setThreads] = useState<DialogThread[]>(initialThreads)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<DialogFormState>(EMPTY_FORM)

  useEffect(() => {
    setThreads(getStoredDialogThreads())
  }, [])

  function openCreateDialog() {
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function handleCreateDialog() {
    if (!user) return
    const article = articles.find((item) => item.id === form.articleId)
    if (!article) return

    const nextThread = createDialogThread({
      title: form.title,
      articleId: article.id,
      articleTitle: article.title,
    })

    if (!nextThread) return

    setThreads(getStoredDialogThreads())
    setDialogOpen(false)
    router.push(`/dialogs/${nextThread.id}`)
  }

  const isCreateDisabled =
    !form.title.trim() || !form.articleId

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Диалоги</h1>
          <p className="text-sm text-muted-foreground">
            Рабочие обсуждения команды по материалам базы знаний.
          </p>
        </div>

        {user ? (
          <Button onClick={openCreateDialog}>Новый диалог</Button>
        ) : null}
      </div>

      {!user ? (
        <Alert>
          <AlertDescription>
            Создавать новые диалоги могут только авторизованные пользователи.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {threads.map((thread) => (
          <DialogCard key={thread.id} thread={thread} />
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Новый диалог</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Тема</label>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Введите тему диалога"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Статья</label>
              <Select
                value={form.articleId}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, articleId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статью" />
                </SelectTrigger>
                <SelectContent>
                  {articles.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateDialog} disabled={isCreateDisabled}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
