-- ==========================================
-- Миграция совместимости: добавление обязательного поля password_hash
-- Запустите вручную в вашей БД:
--   psql -U <user> -d <database> -f database/migrations/002-password-hash.sql
-- ==========================================

-- Добавляем столбец с временной nullable-схемой для обновления существующих записей.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Проставляем индивидуально посоленные PBKDF2-HMAC-SHA256 хэши демо-паролей.
UPDATE users SET password_hash = '07470c7ff72240532c18ea9b0bb523b8:534f08ff1450eb3519474e45bc3fa78a6019bab225eef9fd8ef9cbca125f0bd3' WHERE email = 'admin@company.ru' AND (password_hash IS NULL OR password_hash !~ '^[0-9a-f]{32}:[0-9a-f]{64}$');
UPDATE users SET password_hash = '4b86b0f5f6bf6a751b49843764f390cb:8466a476bbe68cf0cb6b354900aecbf4062ba8e6773be6c5965ac138535827db' WHERE email = 'editor@company.ru' AND (password_hash IS NULL OR password_hash !~ '^[0-9a-f]{32}:[0-9a-f]{64}$');
UPDATE users SET password_hash = 'b087a7de5b48c44e7454ae94b30dfd29:b0d65dce39ae26fa0b848e2ac8c68bd13fe78326996cf9b5cf8257b77b372a5b' WHERE email = 'viewer@company.ru' AND (password_hash IS NULL OR password_hash !~ '^[0-9a-f]{32}:[0-9a-f]{64}$');
UPDATE users SET password_hash = '5b9bcb1bd7d501ef1b05acc514b8294a:84785591a36eed11d38366e5c63c2f87512bf3330347976c9300e0d8aac3966a' WHERE email = 'user1@company.ru' AND (password_hash IS NULL OR password_hash !~ '^[0-9a-f]{32}:[0-9a-f]{64}$');
UPDATE users SET password_hash = '0bf0b01f7f9ca7e61be1612dad4e1fb9:588eb2b70ff1d8f23f20ad8e023073ffa83030ce1ab3fec228d5c8b60521612a' WHERE email = 'user2@company.ru' AND (password_hash IS NULL OR password_hash !~ '^[0-9a-f]{32}:[0-9a-f]{64}$');

-- Неизвестные записи без пароля требуют явного сброса пароля до ужесточения схемы.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM users
        WHERE password_hash IS NULL
           OR password_hash !~ '^[0-9a-f]{32}:[0-9a-f]{64}$'
    ) THEN
        RAISE EXCEPTION 'Найдены пользователи без корректного PBKDF2-хэша; выполните сброс паролей';
    END IF;
END $$;

ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
