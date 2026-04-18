"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, FileText } from "lucide-react"
import DialogThreadView from "@/components/dialogs/dialog-thread-view"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getStoredDialogThreadById, type DialogThread } from "@/lib/dialogs"

interface DialogPageViewProps {
  threadId: string
  initialThread: DialogThread | null
}

export default function DialogPageView({ threadId, initialThread }: DialogPageViewProps) {
  const [thread, setThread] = useState<DialogThread | null>(initialThread)
  const [isResolved, setIsResolved] = useState(false)

  useEffect(() => {
    const storedThread = getStoredDialogThreadById(threadId)
    setThread(storedThread ?? initialThread)
    setIsResolved(true)
  }, [threadId, initialThread])

  if (!thread && isResolved) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Link href="/dialogs">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад к диалогам
          </Button>
        </Link>

        <Alert>
          <AlertDescription>Диалог не найден.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Link href="/dialogs">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад к диалогам
          </Button>
        </Link>

        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Загрузка диалога...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Link href="/dialogs">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Назад к диалогам
        </Button>
      </Link>

      <Card>
        <CardHeader className="gap-1">
          <CardTitle className="text-xl">{thread.title}</CardTitle>
          {thread.articleId && thread.articleTitle ? (
            <div className="pt-1">
              <Link
                href={`/articles/${thread.articleId}`}
                className="inline-flex"
              >
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs hover:bg-accent"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Статья: {thread.articleTitle}
                </Badge>
              </Link>
            </div>
          ) : null}
        </CardHeader>
        <div className="p-6 pt-0">
          <DialogThreadView initialThread={thread} />
        </div>
      </Card>
    </div>
  )
}
