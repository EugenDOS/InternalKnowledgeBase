-- ==========================================
-- Практика 8: Миграция ролевой модели
-- Применять после migrate.sql:
--   psql -U postgres -d knowledge_base -f scripts/migrate-rbac.sql
-- ==========================================

-- Шаг 1: снять старый CHECK constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Шаг 2: привести существующие данные к новым ролям
--   editor -> user
--   viewer -> user
--   admin  -> admin (без изменений)
UPDATE users SET role = 'user' WHERE role IN ('editor', 'viewer');

-- Шаг 3: добавить новый CHECK constraint (admin | user)
ALTER TABLE users
    ADD CONSTRAINT users_role_check
        CHECK (role IN ('admin', 'user'));

-- Шаг 4: обновить seed-пользователей под новые роли
--   Пользователь 1: admin  (без изменений)
--   Пользователь 2: user   (бывший editor)
--   Пользователь 3: user   (бывший viewer)
INSERT INTO users (id, username, email, role, full_name, created_at) VALUES
    ('1', 'admin',  'admin@company.ru',  'admin', 'Иванов Иван',       '2025-01-15T10:00:00Z'),
    ('2', 'user1',  'user1@company.ru',  'user',  'Петрова Мария',     '2025-02-01T10:00:00Z'),
    ('3', 'user2',  'user2@company.ru',  'user',  'Сидоров Алексей',   '2025-03-10T10:00:00Z')
ON CONFLICT (id) DO UPDATE
    SET username = EXCLUDED.username,
        email    = EXCLUDED.email,
        role     = EXCLUDED.role,
        full_name = EXCLUDED.full_name;
