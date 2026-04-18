import { cn } from "@/lib/utils"
import type { DialogMessage } from "@/lib/dialogs"

interface MessageBubbleProps {
  message: DialogMessage
  isCurrentUser: boolean
}

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-xl rounded-xl border px-4 py-3",
          isCurrentUser
            ? "border-primary/20 bg-primary/10"
            : "border-border bg-card"
        )}
      >
        <div className="mb-1 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-foreground">{message.authorName}</span>
          <span className="text-xs text-muted-foreground">{message.sentAt}</span>
        </div>
        <p className="text-sm leading-6 text-foreground">{message.text}</p>
      </div>
    </div>
  )
}
