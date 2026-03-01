import type { Article, Category, User } from "./types"

// ==========================================
// Мок-данные для разработки
// Будут заменены на реальные API-вызовы (Практика 7)
// ==========================================

export const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@company.ru",
    role: "admin",
    fullName: "Иванов Иван",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    username: "editor1",
    email: "editor@company.ru",
    role: "editor",
    fullName: "Петрова Мария",
    createdAt: "2025-02-01T10:00:00Z",
  },
  {
    id: "3",
    username: "viewer1",
    email: "viewer@company.ru",
    role: "viewer",
    fullName: "Сидоров Алексей",
    createdAt: "2025-03-10T10:00:00Z",
  },
]

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "Руководства",
    slug: "guides",
    description: "Пошаговые инструкции и руководства для сотрудников",
    articleCount: 3,
  },
  {
    id: "2",
    name: "Регламенты",
    slug: "regulations",
    description: "Внутренние регламенты и политики компании",
    articleCount: 2,
  },
  {
    id: "3",
    name: "FAQ",
    slug: "faq",
    description: "Часто задаваемые вопросы и ответы",
    articleCount: 1,
  },
]

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "Как настроить рабочее окружение",
    content:
      "Подробная инструкция по настройке рабочего окружения для новых сотрудников. Включает установку необходимого ПО, настройку VPN и доступ к внутренним ресурсам компании.\n\nШаг 1: Установите Node.js с официального сайта.\nШаг 2: Настройте Git и склонируйте репозиторий.\nШаг 3: Запустите npm install для установки зависимостей.",
    excerpt: "Пошаговая инструкция по настройке рабочего окружения для новых сотрудников",
    categoryId: "1",
    authorId: "1",
    tags: ["онбординг", "настройка", "инструменты"],
    createdAt: "2025-06-01T10:00:00Z",
    updatedAt: "2025-06-15T14:30:00Z",
  },
  {
    id: "2",
    title: "Процесс код-ревью",
    content:
      "Описание процесса проведения код-ревью в команде разработки. Каждый Pull Request должен быть проверен минимум двумя ревьюерами перед мерджем в основную ветку.\n\nОсновные критерии проверки:\n- Соответствие стандартам кодирования\n- Покрытие тестами\n- Отсутствие уязвимостей безопасности",
    excerpt: "Регламент проведения код-ревью в команде",
    categoryId: "2",
    authorId: "2",
    tags: ["разработка", "код-ревью", "процессы"],
    createdAt: "2025-06-05T09:00:00Z",
    updatedAt: "2025-06-20T11:00:00Z",
  },
  {
    id: "3",
    title: "Использование внутреннего API",
    content:
      "Документация по работе с внутренним REST API компании. Все эндпоинты требуют аутентификации через Bearer-токен.\n\nБазовый URL: https://api.internal.company.ru/v1\n\nОсновные эндпоинты:\nGET /articles — получение списка статей\nPOST /articles — создание статьи\nPUT /articles/:id — обновление статьи\nDELETE /articles/:id — удаление статьи",
    excerpt: "Документация по работе с внутренним REST API",
    categoryId: "1",
    authorId: "1",
    tags: ["api", "документация", "rest"],
    createdAt: "2025-06-10T12:00:00Z",
    updatedAt: "2025-06-25T16:00:00Z",
  },
  {
    id: "4",
    title: "Политика информационной безопасности",
    content:
      "Основные правила информационной безопасности, которые должен соблюдать каждый сотрудник компании.\n\n1. Используйте сложные пароли длиной не менее 12 символов\n2. Не передавайте учетные данные третьим лицам\n3. Блокируйте рабочую станцию при отлучении\n4. Сообщайте о подозрительных письмах в отдел ИБ",
    excerpt: "Основные правила информационной безопасности для сотрудников",
    categoryId: "2",
    authorId: "1",
    tags: ["безопасность", "политика", "правила"],
    createdAt: "2025-06-12T08:00:00Z",
    updatedAt: "2025-06-28T10:00:00Z",
  },
  {
    id: "5",
    title: "Руководство по Git-воркфлоу",
    content:
      "Описание принятого в компании Git-воркфлоу на основе Gitflow.\n\nОсновные ветки:\n- main — продакшн-версия\n- develop — ветка разработки\n- feature/* — ветки для новых фич\n- hotfix/* — ветки для срочных исправлений\n\nПроцесс:\n1. Создайте ветку feature/название от develop\n2. Реализуйте функционал\n3. Создайте Pull Request в develop\n4. Пройдите код-ревью",
    excerpt: "Описание Git-воркфлоу, принятого в компании",
    categoryId: "1",
    authorId: "2",
    tags: ["git", "разработка", "воркфлоу"],
    createdAt: "2025-06-18T14:00:00Z",
    updatedAt: "2025-07-01T09:00:00Z",
  },
  {
    id: "6",
    title: "Как запросить доступ к ресурсам",
    content:
      "Инструкция по запросу доступа к внутренним ресурсам компании.\n\nДля получения доступа необходимо:\n1. Заполнить заявку в системе Service Desk\n2. Указать обоснование необходимости доступа\n3. Получить одобрение руководителя\n4. Дождаться подтверждения от администратора",
    excerpt: "Как получить доступ к внутренним ресурсам компании",
    categoryId: "3",
    authorId: "2",
    tags: ["доступ", "faq", "ресурсы"],
    createdAt: "2025-06-22T11:00:00Z",
    updatedAt: "2025-07-05T15:00:00Z",
  },
]

// --- Вспомогательные функции для получения данных ---

export function getArticleById(id: string): Article | undefined {
  return mockArticles.find((a) => a.id === id)
}

export function getArticlesByCategory(categoryId: string): Article[] {
  return mockArticles.filter((a) => a.categoryId === categoryId)
}

export function getCategoryById(id: string): Category | undefined {
  return mockCategories.find((c) => c.id === id)
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id)
}

export function searchArticles(query: string): Article[] {
  const lower = query.toLowerCase()
  return mockArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(lower) ||
      a.excerpt.toLowerCase().includes(lower) ||
      a.tags.some((t) => t.toLowerCase().includes(lower))
  )
}
