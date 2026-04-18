"use client"

import { useEffect, useMemo, useState } from "react"
import MessageBubble from "@/components/dialogs/message-bubble"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  appendDialogMessage,
  DEVICE_OWNER_MESSAGE_AUTHOR_ID,
  getStoredDialogThreadById,
  type DialogMessage,
  type DialogThread,
} from "@/lib/dialogs"
import { getDeviceOwnerProfile } from "@/lib/device-storage"
import { useAppSelector } from "@/store/hooks"

interface DialogThreadViewProps {
  initialThread: DialogThread
}

export default function DialogThreadView({ initialThread }: DialogThreadViewProps) {
  const user = useAppSelector((state) => state.auth.user)
  const [messages, setMessages] = useState<DialogMessage[]>(initialThread.messages)
  const [text, setText] = useState("")

  useEffect(() => {
    const storedThread = getStoredDialogThreadById(initialThread.id)
    setMessages(storedThread?.messages ?? initialThread.messages)
  }, [initialThread.id, initialThread.messages, user?.id])

  const resolvedMessages = useMemo(() => {
    const deviceOwner = getDeviceOwnerProfile()
    const currentUserId = user?.id ?? null
    const currentUserName = user?.fullName ?? null
    const deviceOwnerId = deviceOwner?.id ?? null

    return messages.map((message) => {
      const isDeviceOwnerMessage = message.authorId === DEVICE_OWNER_MESSAGE_AUTHOR_ID
      const resolvedAuthorName =
        isDeviceOwnerMessage && deviceOwner?.fullName
          ? deviceOwner.fullName
          : message.authorName

      const isCurrentUser =
        currentUserId !== null &&
        (message.authorId === currentUserId ||
          (isDeviceOwnerMessage && deviceOwnerId === currentUserId))

      return {
        ...message,
        authorName: resolvedAuthorName,
        isCurrentUser,
      }
    })
  }, [messages, user])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const messageText = text.trim()
    if (!user || !messageText) return

    const nextMessage: DialogMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      authorId: user.id,
      authorName: user.fullName,
      text: messageText,
      sentAt: new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    const updatedThread = appendDialogMessage(initialThread.id, nextMessage)
    setMessages(updatedThread?.messages ?? [...messages, nextMessage])
    setText("")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {resolvedMessages.length === 0 ? (
          <Alert>
            <AlertDescription>
              Обсуждение создано. Здесь пока нет сообщений.
            </AlertDescription>
          </Alert>
        ) : (
          resolvedMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.isCurrentUser}
            />
          ))
        )}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-border pt-4">
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Введите сообщение"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!text.trim()}>
              Отправить
            </Button>
          </div>
        </form>
      ) : (
        <Alert>
          <AlertDescription>
            Чтобы отправлять сообщения, нужно войти в систему.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
