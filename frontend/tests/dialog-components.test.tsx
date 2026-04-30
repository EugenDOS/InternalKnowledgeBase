import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import DialogCard from "@/components/dialogs/dialog-card"
import MessageBubble from "@/components/dialogs/message-bubble"
import type { DialogThread } from "@/lib/dialogs"

const thread: DialogThread = {
  id: "thread-1",
  title: "Тема обсуждения",
  articleId: "article-1",
  articleTitle: "Статья",
  preview: "Последнее сообщение",
  updatedAt: "2026-04-30 12:00",
  messages: [],
}

describe("dialog components", () => {
  it("renders dialog card with article metadata", () => {
    render(<DialogCard thread={thread} />)

    expect(screen.getByRole("link")).toHaveAttribute("href", "/dialogs/thread-1")
    expect(screen.getByText("Тема обсуждения")).toBeInTheDocument()
    expect(screen.getByText("Статья")).toBeInTheDocument()
    expect(screen.getByText("Последнее сообщение")).toBeInTheDocument()
    expect(screen.getByText("Обновлено: 2026-04-30 12:00")).toBeInTheDocument()
  })

  it("renders dialog card without article metadata", () => {
    render(<DialogCard thread={{ ...thread, articleTitle: null }} />)

    expect(screen.queryByText("Статья")).not.toBeInTheDocument()
  })

  it("renders current and foreign messages with different alignment", () => {
    const message = {
      id: "message-1",
      authorId: "user-1",
      authorName: "Автор",
      text: "Текст сообщения",
      sentAt: "12:01",
    }

    const { rerender } = render(<MessageBubble message={message} isCurrentUser />)
    expect(screen.getByText("Автор")).toBeInTheDocument()
    expect(screen.getByText("Текст сообщения").closest(".justify-end")).toBeInTheDocument()

    rerender(<MessageBubble message={message} isCurrentUser={false} />)
    expect(screen.getByText("Текст сообщения").closest(".justify-start")).toBeInTheDocument()
    expect(screen.getByText("12:01")).toBeInTheDocument()
  })
})
