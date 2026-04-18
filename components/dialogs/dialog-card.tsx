import Link from "next/link"
import { FileText, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DialogThread } from "@/lib/dialogs"

interface DialogCardProps {
  thread: DialogThread
}

export default function DialogCard({ thread }: DialogCardProps) {
  return (
    <Link href={`/dialogs/${thread.id}`}>
      <Card className="h-full transition-colors hover:bg-accent">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base text-foreground">{thread.title}</CardTitle>
            {thread.articleTitle ? (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                {thread.articleTitle}
              </p>
            ) : null}
          </div>
          <div className="rounded-lg bg-secondary p-2 text-secondary-foreground">
            <MessageSquare className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">{thread.preview}</p>
          <p className="text-xs text-muted-foreground">Обновлено: {thread.updatedAt}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
