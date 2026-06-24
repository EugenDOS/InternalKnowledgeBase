-- ==========================================
-- Миграция ролевой модели
-- Применять после migrate.sql:
--   psql -U <user> -d <database> -f database/migrations/003-rbac.sql
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
INSERT INTO users (id, username, email, role, full_name, password_hash, created_at) VALUES
        ('1', 'admin',  'admin@company.ru',  'admin', 'Иванов Иван',     '07470c7ff72240532c18ea9b0bb523b8:534f08ff1450eb3519474e45bc3fa78a6019bab225eef9fd8ef9cbca125f0bd3', '2025-01-15T10:00:00Z'),
        ('2', 'user1',  'user1@company.ru',  'user',  'Петрова Мария',   '5b9bcb1bd7d501ef1b05acc514b8294a:84785591a36eed11d38366e5c63c2f87512bf3330347976c9300e0d8aac3966a', '2025-02-01T10:00:00Z'),
        ('3', 'user2',  'user2@company.ru',  'user',  'Сидоров Алексей', '0bf0b01f7f9ca7e61be1612dad4e1fb9:588eb2b70ff1d8f23f20ad8e023073ffa83030ce1ab3fec228d5c8b60521612a', '2025-03-10T10:00:00Z')
    ON CONFLICT (id) DO UPDATE
        SET username = EXCLUDED.username,
        email     = EXCLUDED.email,
        role      = EXCLUDED.role,
        full_name = EXCLUDED.full_name;
