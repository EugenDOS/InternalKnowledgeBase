import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  appendDialogMessage,
  createDialogThread,
  dialogThreads,
  getDialogThreadById,
  getStoredDialogThreadById,
  getStoredDialogThreads,
  type DialogMessage,
} from "@/lib/dialogs"

const storageKey = "knowledge-base-dialogs"

beforeEach(() => {
  localStorage.clear()
  vi.setSystemTime(new Date("2026-04-30T12:34:00"))
})

afterEach(() => {
  localStorage.clear()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("dialog storage", () => {
  it("keeps exported seed threads immutable", () => {
    const firstTitle = dialogThreads[0].title
    dialogThreads[0].title = "changed"

    expect(getDialogThreadById("frontend-guidelines")?.title).toBe("changed")
    dialogThreads[0].title = firstTitle
    expect(getDialogThreadById("unknown")).toBeNull()
  })

  it("initializes browser storage with default threads", () => {
    const threads = getStoredDialogThreads()

    expect(threads).toHaveLength(3)
    expect(JSON.parse(localStorage.getItem(storageKey) ?? "[]")).toHaveLength(3)
    expect(getStoredDialogThreadById("frontend-guidelines")?.articleTitle).toBe(
      "Как настроить рабочее окружение"
    )
    expect(getStoredDialogThreadById("missing")).toBeNull()
  })

  it("normalizes legacy and malformed stored threads", () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        { id: "content-review", title: "Legacy" },
        {
          id: "custom",
          title: "Custom",
          articleId: "42",
          articleTitle: "Custom article",
          preview: "Existing preview",
          updatedAt: "2026-04-30 10:00",
          messages: [],
        },
        {
          id: "unknown-legacy",
          title: "Unknown legacy",
          messages: "bad",
        },
      ])
    )

    const threads = getStoredDialogThreads()

    expect(threads[0]).toMatchObject({
      id: "content-review",
      articleId: "2",
      articleTitle: "Процесс код-ревью",
      preview: "Сообщений пока нет.",
    })
    expect(threads[1].messages).toEqual([])
    expect(threads[1]).toMatchObject({
      preview: "Existing preview",
      updatedAt: "2026-04-30 10:00",
    })
    expect(threads[2]).toMatchObject({
      articleId: null,
      articleTitle: null,
      preview: "Сообщений пока нет.",
      messages: [],
    })
  })

  it("falls back to default threads for broken localStorage JSON", () => {
    localStorage.setItem(storageKey, "{")

    expect(getStoredDialogThreads()).toHaveLength(3)
  })

  it("creates a thread and appends messages", () => {
    const created = createDialogThread({
      title: "  Новая тема  ",
      articleId: "article-1",
      articleTitle: "Статья",
    })

    expect(created).toMatchObject({
      id: `dialog-${new Date("2026-04-30T12:34:00").getTime()}`,
      title: "Новая тема",
      preview: "Сообщений пока нет.",
      updatedAt: "2026-04-30 12:34",
      messages: [],
    })

    const message: DialogMessage = {
      id: "message-1",
      authorId: "user-1",
      authorName: "Пользователь",
      text: "Сообщение",
      sentAt: "12:35",
    }

    const updated = appendDialogMessage(created!.id, message)

    expect(updated?.preview).toBe("Сообщение")
    expect(updated?.updatedAt).toBe("12:35")
    expect(updated?.messages).toEqual([message])
    expect(appendDialogMessage("unknown", message)).toBeNull()
  })

  it("returns defaults and null creation when window is unavailable", () => {
    vi.stubGlobal("window", undefined)

    expect(
      appendDialogMessage("frontend-guidelines", {
        id: "message-1",
        authorId: "user-1",
        authorName: "User",
        text: "Message",
        sentAt: "12:00",
      })?.preview
    ).toBe("Message")
    expect(getStoredDialogThreads()).toHaveLength(3)
    expect(createDialogThread({ title: "x", articleId: "1", articleTitle: "a" })).toBeNull()
  })
})
