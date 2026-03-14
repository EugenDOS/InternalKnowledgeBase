-- ==========================================
-- Практика 7: Инициализация локальной PostgreSQL БД
-- Запускать: psql -U postgres -d knowledge_base -f scripts/migrate.sql
-- ==========================================

-- Расширение для UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- Таблица пользователей
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    username    TEXT        NOT NULL UNIQUE,
    email       TEXT        NOT NULL UNIQUE,
    role        TEXT        NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    full_name   TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- Таблица категорий
-- ==========================================
CREATE TABLE IF NOT EXISTS categories (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name          TEXT NOT NULL,
    slug          TEXT NOT NULL UNIQUE,
    description   TEXT NOT NULL DEFAULT '',
    article_count INT  NOT NULL DEFAULT 0
);

-- ==========================================
-- Таблица статей
-- ==========================================
CREATE TABLE IF NOT EXISTS articles (
    id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title       TEXT        NOT NULL,
    content     TEXT        NOT NULL DEFAULT '',
    excerpt     TEXT        NOT NULL DEFAULT '',
    category_id TEXT        NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    author_id   TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tags        TEXT[]      NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- Триггер: автоматически обновляет article_count в categories
-- ==========================================
CREATE OR REPLACE FUNCTION update_article_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE categories SET article_count = article_count + 1 WHERE id = NEW.category_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE categories SET article_count = article_count - 1 WHERE id = OLD.category_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.category_id <> NEW.category_id THEN
        UPDATE categories SET article_count = article_count - 1 WHERE id = OLD.category_id;
        UPDATE categories SET article_count = article_count + 1 WHERE id = NEW.category_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_article_count ON articles;
CREATE TRIGGER trg_article_count
AFTER INSERT OR UPDATE OR DELETE ON articles
FOR EACH ROW EXECUTE FUNCTION update_article_count();

-- ==========================================
-- Триггер: автоматически обновляет updated_at у статей
-- ==========================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_articles_updated_at ON articles;
CREATE TRIGGER trg_articles_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==========================================
-- Seed: пользователи
-- ==========================================
INSERT INTO users (id, username, email, role, full_name, created_at) VALUES
    ('1', 'admin',   'admin@company.ru',  'admin',  'Иванов Иван',     '2025-01-15T10:00:00Z'),
    ('2', 'editor1', 'editor@company.ru', 'editor', 'Петрова Мария',   '2025-02-01T10:00:00Z'),
    ('3', 'viewer1', 'viewer@company.ru', 'viewer', 'Сидоров Алексей', '2025-03-10T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- Seed: категории
-- ==========================================
INSERT INTO categories (id, name, slug, description, article_count) VALUES
    ('1', 'Руководства', 'guides',      'Пошаговые инструкции и руководства для сотрудников', 0),
    ('2', 'Регламенты',  'regulations', 'Внутренние регламенты и политики компании',          0),
    ('3', 'FAQ',         'faq',         'Часто задаваемые вопросы и ответы',                  0)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- Seed: статьи (article_count обновится триггером)
-- ==========================================
INSERT INTO articles (id, title, content, excerpt, category_id, author_id, tags, created_at, updated_at) VALUES
(
    '1',
    'Как настроить рабочее окружение',
    E'Подробная инструкция по настройке рабочего окружения для новых сотрудников. Включает установку необходимого ПО, настройку VPN и доступ к внутренним ресурсам компании.\n\nШаг 1: Установите Node.js с официального сайта.\nШаг 2: Настройте Git и склонируйте репозиторий.\nШаг 3: Запустите npm install для установки зависимостей.',
    'Пошаговая инструкция по настройке рабочего окружения для новых сотрудников',
    '1', '1', ARRAY['онбординг','настройка','инструменты'],
    '2025-06-01T10:00:00Z', '2025-06-15T14:30:00Z'
),
(
    '2',
    'Процесс код-ревью',
    E'Описание процесса проведения код-ревью в команде разработки. Каждый Pull Request должен быть проверен минимум двумя ревьюерами перед мерджем в основную ветку.\n\nОсновные критерии проверки:\n- Соответствие стандартам кодирования\n- Покрытие тестами\n- Отсутствие уязвимостей безопасности',
    'Регламент проведения код-ревью в команде',
    '2', '2', ARRAY['разработка','код-ревью','процессы'],
    '2025-06-05T09:00:00Z', '2025-06-20T11:00:00Z'
),
(
    '3',
    'Использование внутреннего API',
    E'Документация по работе с внутренним REST API компании. Все эндпоинты требуют аутентификации через Bearer-токен.\n\nБазовый URL: https://api.internal.company.ru/v1\n\nОсновные эндпоинты:\nGET /articles — получение списка статей\nPOST /articles — создание статьи\nPUT /articles/:id — обновление статьи\nDELETE /articles/:id — удаление статьи',
    'Документация по работе с внутренним REST API',
    '1', '1', ARRAY['api','документация','rest'],
    '2025-06-10T12:00:00Z', '2025-06-25T16:00:00Z'
),
(
    '4',
    'Политика информационной безопасности',
    E'Основные правила информационной безопасности, которые должен соблюдать каждый сотрудник компании.\n\n1. Используйте сложные пароли длиной не менее 12 символов\n2. Не передавайте учетные данные третьим лицам\n3. Блокируйте рабочую станцию при отлучении\n4. Сообщайте о подозрительных письмах в отдел ИБ',
    'Основные правила информационной безопасности для сотрудников',
    '2', '1', ARRAY['безопасность','политика','правила'],
    '2025-06-12T08:00:00Z', '2025-06-28T10:00:00Z'
),
(
    '5',
    'Руководство по Git-воркфлоу',
    E'Описание принятого в компании Git-воркфлоу на основе Gitflow.\n\nОсновные ветки:\n- main — продакшн-версия\n- develop — ветка разработки\n- feature/* — ветки для новых фич\n- hotfix/* — ветки для срочных исправлений\n\nПроцесс:\n1. Создайте ветку feature/название от develop\n2. Реализуйте функционал\n3. Создайте Pull Request в develop\n4. Пройдите код-ревью',
    'Описание Git-воркфлоу, принятого в компании',
    '1', '2', ARRAY['git','разработка','воркфлоу'],
    '2025-06-18T14:00:00Z', '2025-07-01T09:00:00Z'
),
(
    '6',
    'Как запросить доступ к ресурсам',
    E'Инструкция по запросу доступа к внутренним ресурсам компании.\n\nДля получения доступа необходимо:\n1. Заполнить заявку в системе Service Desk\n2. Указать обоснование необходимости доступа\n3. Получить одобрение руководителя\n4. Дождаться подтверждения от администратора',
    'Как получить доступ к внутренним ресурсам компании',
    '3', '2', ARRAY['доступ','faq','ресурсы'],
    '2025-06-22T11:00:00Z', '2025-07-05T15:00:00Z'
)
ON CONFLICT (id) DO NOTHING;
