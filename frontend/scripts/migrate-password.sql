-- ==========================================
-- Миграция совместимости: добавление поля password_hash в таблицу users
-- Запустите вручную в вашей БД:
--   psql -U postgres -d knowledge_base -f scripts/migrate-password.sql
-- ==========================================

-- Добавляем столбец password_hash (nullable для совместимости с существующими записями)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Проставляем демо-пароли для существующих пользователей.
-- Поддерживаем и старые email из ранней схемы, и текущие email проекта.
UPDATE users SET password_hash = 'admin123' WHERE email = 'admin@company.ru' AND password_hash IS NULL;
UPDATE users SET password_hash = 'user123'  WHERE email = 'editor@company.ru' AND password_hash IS NULL;
UPDATE users SET password_hash = 'user123'  WHERE email = 'viewer@company.ru' AND password_hash IS NULL;
UPDATE users SET password_hash = 'user123'  WHERE email = 'user1@company.ru'  AND password_hash IS NULL;
UPDATE users SET password_hash = 'user123'  WHERE email = 'user2@company.ru'  AND password_hash IS NULL;
