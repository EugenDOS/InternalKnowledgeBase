export interface DialogMessage {
  id: string
  authorId: string
  authorName: string
  text: string
  sentAt: string
}

export interface DialogThread {
  id: string
  title: string
  articleId: string | null
  articleTitle: string | null
  preview: string
  updatedAt: string
  messages: DialogMessage[]
}

export const DEVICE_OWNER_MESSAGE_AUTHOR_ID = "device-owner"
const DIALOGS_STORAGE_KEY = "knowledge-base-dialogs"

const defaultDialogThreads: DialogThread[] = [
  {
    id: "frontend-guidelines",
    title: "Обновление интерфейса",
    articleId: "1",
    articleTitle: "Как настроить рабочее окружение",
    preview: "Подготовила список правок для главной страницы.",
    updatedAt: "2026-04-16 10:30",
    messages: [
      {
        id: "m1",
        authorId: "anna-smirnova",
        authorName: "Анна Смирнова",
        text: "Подготовила список правок для главной страницы. Нужно обновить заголовок и блок со статистикой.",
        sentAt: "10:10",
      },
      {
        id: "m2",
        authorId: DEVICE_OWNER_MESSAGE_AUTHOR_ID,
        authorName: "Алексей Петров",
        text: "Хорошо, сначала обновлю структуру страницы, потом покажу результат.",
        sentAt: "10:18",
      },
      {
        id: "m3",
        authorId: "anna-smirnova",
        authorName: "Анна Смирнова",
        text: "Отлично. После этого нужно будет проверить, что карточки одинаково выглядят на мобильной версии.",
        sentAt: "10:30",
      },
    ],
  },
  {
    id: "content-review",
    title: "Проверка статей",
    articleId: "2",
    articleTitle: "Процесс код-ревью",
    preview: "Добавил замечания по двум новым материалам.",
    updatedAt: "2026-04-15 15:45",
    messages: [
      {
        id: "m1",
        authorId: "igor-volkov",
        authorName: "Игорь Волков",
        text: "Добавил замечания по двум новым материалам. В одной статье нужно сократить введение.",
        sentAt: "15:20",
      },
      {
        id: "m2",
        authorId: DEVICE_OWNER_MESSAGE_AUTHOR_ID,
        authorName: "Алексей Петров",
        text: "Принял. Отредактирую текст и обновлю краткое описание.",
        sentAt: "15:32",
      },
      {
        id: "m3",
        authorId: "igor-volkov",
        authorName: "Игорь Волков",
        text: "После обновления повторно посмотрю обе статьи.",
        sentAt: "15:45",
      },
    ],
  },
  {
    id: "category-structure",
    title: "Структура категорий",
    articleId: "3",
    articleTitle: "Использование внутреннего API",
    preview: "Предлагаю объединить две близкие категории в одну.",
    updatedAt: "2026-04-14 09:10",
    messages: [
      {
        id: "m1",
        authorId: "maria-lebedeva",
        authorName: "Мария Лебедева",
        text: "Предлагаю объединить две близкие категории в одну, чтобы навигация стала проще.",
        sentAt: "08:55",
      },
      {
        id: "m2",
        authorId: DEVICE_OWNER_MESSAGE_AUTHOR_ID,
        authorName: "Алексей Петров",
        text: "Согласен. Тогда перенесу статьи в общий раздел и обновлю названия.",
        sentAt: "09:02",
      },
      {
        id: "m3",
        authorId: "maria-lebedeva",
        authorName: "Мария Лебедева",
        text: "Хорошо, после этого останется только проверить количество статей в списке категорий.",
        sentAt: "09:10",
      },
    ],
  },
]

function cloneDialogThreads(threads: DialogThread[]): DialogThread[] {
  return JSON.parse(JSON.stringify(threads)) as DialogThread[]
}

function getLegacyArticleMeta(threadId: string): {
  articleId: string | null
  articleTitle: string | null
} {
  switch (threadId) {
    case "frontend-guidelines":
      return {
        articleId: "1",
        articleTitle: "Как настроить рабочее окружение",
      }
    case "content-review":
      return {
        articleId: "2",
        articleTitle: "Процесс код-ревью",
      }
    case "category-structure":
      return {
        articleId: "3",
        articleTitle: "Использование внутреннего API",
      }
    default:
      return {
        articleId: null,
        articleTitle: null,
      }
  }
}

function normalizeDialogThread(thread: Partial<DialogThread> & { id: string; title: string }): DialogThread {
  const legacyArticleMeta = getLegacyArticleMeta(thread.id)

  return {
    id: thread.id,
    title: thread.title,
    articleId: thread.articleId ?? legacyArticleMeta.articleId,
    articleTitle: thread.articleTitle ?? legacyArticleMeta.articleTitle,
    preview: thread.preview ?? "Сообщений пока нет.",
    updatedAt: thread.updatedAt ?? formatThreadTimestamp(new Date()),
    messages: Array.isArray(thread.messages) ? thread.messages : [],
  }
}

export const dialogThreads: DialogThread[] = cloneDialogThreads(defaultDialogThreads)

export function getDialogThreadById(id: string): DialogThread | null {
  return dialogThreads.find((thread) => thread.id === id) ?? null
}

function formatThreadTimestamp(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function canUseStorage(): boolean {
  return typeof window !== "undefined"
}

function getStoredThreads(): DialogThread[] {
  if (!canUseStorage()) {
    return cloneDialogThreads(defaultDialogThreads)
  }

  const rawValue = window.localStorage.getItem(DIALOGS_STORAGE_KEY)
  if (!rawValue) {
    const initialThreads = cloneDialogThreads(defaultDialogThreads)
    window.localStorage.setItem(DIALOGS_STORAGE_KEY, JSON.stringify(initialThreads))
    return initialThreads
  }

  try {
    const parsedThreads = JSON.parse(rawValue) as Array<Partial<DialogThread> & { id: string; title: string }>
    const normalizedThreads = parsedThreads.map(normalizeDialogThread)
    setStoredThreads(normalizedThreads)
    return normalizedThreads
  } catch {
    return cloneDialogThreads(defaultDialogThreads)
  }
}

function setStoredThreads(threads: DialogThread[]): void {
  if (!canUseStorage()) return
  window.localStorage.setItem(DIALOGS_STORAGE_KEY, JSON.stringify(threads))
}

export function getStoredDialogThreads(): DialogThread[] {
  return getStoredThreads()
}

export function getStoredDialogThreadById(id: string): DialogThread | null {
  return getStoredThreads().find((thread) => thread.id === id) ?? null
}

interface CreateDialogThreadInput {
  title: string
  articleId: string
  articleTitle: string
}

export function createDialogThread(input: CreateDialogThreadInput): DialogThread | null {
  if (!canUseStorage()) return null

  const now = new Date()
  const title = input.title.trim()

  const nextThread: DialogThread = {
    id: `dialog-${Date.now()}`,
    title,
    articleId: input.articleId,
    articleTitle: input.articleTitle,
    preview: "Сообщений пока нет.",
    updatedAt: formatThreadTimestamp(now),
    messages: [],
  }

  const threads = [nextThread, ...getStoredThreads()]
  setStoredThreads(threads)

  return nextThread
}

export function appendDialogMessage(threadId: string, message: DialogMessage): DialogThread | null {
  const threads = getStoredThreads()
  const threadIndex = threads.findIndex((thread) => thread.id === threadId)

  if (threadIndex === -1) return null

  const updatedThread: DialogThread = {
    ...threads[threadIndex],
    preview: message.text,
    updatedAt: message.sentAt,
    messages: [...threads[threadIndex].messages, message],
  }

  threads[threadIndex] = updatedThread
  setStoredThreads(threads)

  return updatedThread
}
