/**
 * Практика 7: Создание локальной БД и применение миграции
 * Запуск: node scripts/setup-db.js
 *
 * Требования:
 *   - PostgreSQL запущен локально
 *   - Переменная окружения DATABASE_URL задана в .env.local
 *     Пример: DATABASE_URL=postgresql://postgres:password@localhost:5432/knowledge_base
 */

import { execSync } from "child_process"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import pg from "pg"
import dotenv from "dotenv"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Загружаем .env.local
dotenv.config({ path: resolve(__dirname, "../.env.local") })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error("Ошибка: переменная DATABASE_URL не задана в .env.local")
  console.error("Пример: DATABASE_URL=postgresql://postgres:password@localhost:5432/knowledge_base")
  process.exit(1)
}

const sql = readFileSync(resolve(__dirname, "migrate.sql"), "utf-8")

const client = new pg.Client({ connectionString: DATABASE_URL })

try {
  await client.connect()
  console.log("Подключено к PostgreSQL.")
  await client.query(sql)
  console.log("Миграция и seed успешно применены.")
} catch (err) {
  console.error("Ошибка при выполнении миграции:", err.message)
  process.exit(1)
} finally {
  await client.end()
}
