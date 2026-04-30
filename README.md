# InternalKnowledgeBase

## Краткое описание проекта
`InternalKnowledgeBase` — это учебное клиент-серверное приложение в формате внутренней базы знаний компании.  
Пользователь может просматривать статьи и категории, искать материалы по названию, входить в систему, работать со своими публикациями, а администратор — управлять контентом и видеть список пользователей.

Архитектура проекта разделена на три части:
- `frontend/` — клиентская часть на `Next.js`
- `backend/` — серверная прослойка на `Spring Boot`
- `PostgreSQL` — отдельная база данных

В текущей версии браузер работает с `Next.js`, `Next.js` передаёт серверные запросы в `Spring Boot`, а уже `Spring Boot` обращается к `PostgreSQL`.  
Такое решение оставляет структуру проекта понятной для учебной защиты и одновременно показывает реальное разделение на фронтенд, бэкенд и БД.

## Реализация по практикам
### ПР1
Реализована базовая клиентская часть на `React/Next.js` с собственной главной страницей, разметкой и стилизацией.  
Главная страница оформлена как обычная страница продукта без учебных пометок в интерфейсе.

### ПР2
Проект разбит на компоненты и модули, используются отдельные UI-компоненты, импорт/экспорт, повторно используемые карточки, формы и layout-элементы.  
Дополнительно оставлен пример `HOC` в `frontend/components/hoc/with-loading.tsx`, чтобы показать паттерн переиспользования логики.

### ПР3
Реализована маршрутизация и передача данных через `props`.  
Есть обычные и динамические страницы:
- `/articles`
- `/articles/[id]`
- `/categories`
- `/categories/[slug]`

Учебный компромисс здесь в том, что используется `Next.js App Router`, а не отдельный `react-router-dom`. По сути задача маршрутизации и динамических параметров выполнена, но через встроенный механизм фреймворка.

### ПР4
Добавлен раздел диалогов:
- список диалогов
- страница отдельного обсуждения
- вывод сообщений и авторов через `props`
- создание новых диалогов
- отправка сообщений авторизованным пользователем

Для упрощения учебной реализации сами диалоги и сообщения хранятся локально на устройстве в `localStorage`, а не в отдельной таблице БД. Это сохраняет требуемую логику раздела, но не перегружает проект лишней серверной сложностью.

### ПР5
Подключён `Redux Toolkit`:
- `auth-slice`
- `articles-slice`
- `agreement-slice`
- единый `store`

Также реализовано пользовательское соглашение.  
В текущей версии оно показывается как модальное окно при первом входе/регистрации на устройстве, а не как постоянный отдельный раздел. Для учебного проекта это делает сценарий короче и ближе к реальному UX.

### ПР6
Реализованы:
- регистрация
- вход
- выход
- восстановление сессии
- защищённые маршруты
- хранение паролей в хэшированном виде
- серверная cookie-сессия

Учебная версия использует собственную серверную cookie-аутентификацию, а не внешнюю OAuth-интеграцию. Это упрощает структуру проекта, но при этом сохраняет ключевые идеи аутентификации и защиты доступа.

### ПР7
Реализована работа с `PostgreSQL`:
- схема БД и seed-данные в SQL-скриптах
- таблицы пользователей, категорий и статей
- REST API для статей, категорий, авторизации и пользователей
- CRUD для статей
- подключение БД через `Spring Boot + JPA`

Отдельно добавлена серверная прослойка `Spring Boot` с привычной учебной структурой:
- `controller`
- `service`
- `repository`
- `entity`
- `dto`

Чтобы сохранить совместимость текущего фронтенда и не переписывать весь интерфейс заново, `Next.js API` оставлен как прокси-слой, а основная серверная работа с БД вынесена в `Spring Boot`.

### ПР8
Реализована ролевая модель `admin / user`:
- `admin` видит админ-панель и список пользователей
- обычный пользователь работает только со своими статьями
- на сервере проверяются роль и владение статьёй

Таким образом в проекте есть и разделение интерфейса по ролям, и серверные проверки прав доступа.

## Стек и версии
Критичные версии, на которых основан текущий проект:
- `Node.js 22` — для контейнера фронтенда
- `Next.js 16.1.6`
- `React 19.2.4`
- `Java 25`
- `Spring Boot 3.5.13`
- `PostgreSQL 17` (`postgres:17-alpine` в Docker)
- `Docker` + `docker-compose` / `Docker Compose`

## Структура проекта
```text
InternalKnowledgeBase/
├─ frontend/             # Next.js frontend + proxy API + UI
├─ backend/              # Spring Boot backend
├─ Dockerfile.db         # образ PostgreSQL с тестовыми данными
├─ docker-compose-dev.yml
├─ docker-compose-prod.yml
└─ README.md
```

## Запуск и развёртывание
### Рекомендуемый способ для разработки: Docker Compose
Проект рассчитан на запуск в трёх контейнерах:
- `frontend`
- `backend`
- `postgres`

База данных хранит данные в `volume`, поэтому при обычном перезапуске контейнеров данные сохраняются.

### Первый запуск
Из корня проекта:

```powershell
docker compose -f docker-compose-dev.yml up --build -d
```

После запуска будут доступны:
- frontend: `http://localhost:3000`
- backend: `http://localhost:8080`

`PostgreSQL` наружу не публикуется, потому что по текущей архитектуре к ней должен обращаться только `backend`.

### Остановка
```powershell
docker compose -f docker-compose-dev.yml down
```

### Полный сброс с удалением данных БД
```powershell
docker compose -f docker-compose-dev.yml down -v
```

Это удалит volume `postgres_data`, и при следующем запуске база инициализируется заново из:
- `frontend/scripts/migrate.sql`

### Повторный запуск без пересборки
```powershell
docker compose -f docker-compose-dev.yml up -d
```

## Публикация образов в Docker Hub
Для production-режима используются готовые образы из Docker Hub:
- `eugendos/knowledge-base-frontend:latest`
- `eugendos/knowledge-base-backend:latest`
- `eugendos/knowledge-base-postgres:latest`

### 1. Авторизация в Docker Hub
```powershell
docker login
```

### 2. Создание buildx builder
Команда выполняется один раз на машине сборки:

```powershell
docker buildx create --use --name multi-arch-builder
```

Если builder уже существует, можно просто активировать его:

```powershell
docker buildx use multi-arch-builder
```

### 3. Кроссплатформенная сборка и публикация frontend
Из корня проекта:

```powershell
docker buildx build --platform linux/amd64,linux/arm64 -t eugendos/knowledge-base-frontend:latest ./frontend --push
```

### 4. Кроссплатформенная сборка и публикация backend
Из корня проекта:

```powershell
docker buildx build --platform linux/amd64,linux/arm64 -t eugendos/knowledge-base-backend:latest ./backend --push
```

### 5. Кроссплатформенная сборка и публикация PostgreSQL с тестовыми данными
Из корня проекта:

```powershell
docker buildx build --platform linux/amd64,linux/arm64 -t eugendos/knowledge-base-postgres:latest -f Dockerfile.db . --push
```

Этот образ нужен потому, что production-compose не использует локальный `migrate.sql`, а получает PostgreSQL уже со встроенным SQL-скриптом инициализации.

## Production-запуск на другом устройстве
Файл [docker-compose-prod.yml](/c:/Users/emche/Projects/InternalKnowledgeBase/docker-compose-prod.yml) рассчитан на запуск без исходного кода проекта, если образы уже опубликованы в Docker Hub.

### Запуск
На целевом устройстве достаточно иметь:
- `docker-compose-prod.yml`
- при необходимости `.env` с переопределёнными переменными окружения

Команда запуска:

```powershell
docker compose -f docker-compose-prod.yml up -d
```

### Остановка
```powershell
docker compose -f docker-compose-prod.yml down
```

### Полный сброс БД
```powershell
docker compose -f docker-compose-prod.yml down -v
```

Важно:
- тестовые данные из `Dockerfile.db` применяются только при первом старте на пустом volume;
- если volume `postgres_data` уже существует, PostgreSQL не выполнит инициализацию повторно.

## CI на GitHub Actions
В проекте настроен базовый `CI` через GitHub Actions.  
Workflow находится в файле:

- `.github/workflows/ci.yml`

Он запускается в трёх случаях:
- при `push` в ветку `master`;
- при `pull request` в ветку `master`;
- вручную через `workflow_dispatch` из вкладки `Actions` на GitHub.

CI специально сделан базовым и учебно-практичным:
- он проверяет, что проект собирается и проходит тесты;
- он не публикует Docker-образы в Docker Hub;
- он не выполняет автодеплой на сервер.

Внутри workflow есть три независимые job, которые выполняются параллельно:

### `frontend-test`
Проверяет клиентскую часть проекта:
- устанавливает зависимости через `npm ci`;
- выполняет проверку типов командой `npx tsc --noEmit`;
- запускает unit/component-тесты и проверку покрытия командой `npm test`;
- выполняет production-сборку командой `npm run build`.

Frontend-тесты запускаются через `npm test`. Команда использует `Vitest` и `happy-dom`; для критичной frontend-логики настроен coverage gate `100%` по строкам, веткам, функциям и инструкциям. HTML-отчёт формируется в `frontend/coverage/`.

Для корректной работы этой job в репозиторий добавлен файл:
- `frontend/package-lock.json`

Это позволяет:
- стабильно использовать `npm ci`;
- включить кэширование npm-зависимостей в GitHub Actions;
- сделать сборку более воспроизводимой.

### `backend-test`
Проверяет серверную часть проекта:
- настраивает `Java 25`;
- подготавливает `Gradle Wrapper`;
- запускает серверные тесты и проверку покрытия командой `./gradlew check`.

Backend-тесты запускаются стандартной для Spring Boot/Gradle командой `./gradlew check`. Используются `JUnit 5`, `Mockito`, `MockMvc` и `JaCoCo`; для критичного backend-слоя (`UserService`, `CategoryService`, `ApiMapper`, `GlobalExceptionHandler`) требуется `100%` покрытия строк и веток. HTML-отчёт JaCoCo формируется в `backend/build/reports/jacoco/test/html/`.

### `docker-build-test`
Проверяет, что Docker-образы вообще собираются:
- тестовая сборка frontend-образа;
- тестовая сборка backend-образа;
- тестовая сборка PostgreSQL-образа через `Dockerfile.db`.

Эта job не публикует образы, а только подтверждает, что Dockerfile-ы и контекст сборки валидны.

Дополнительно в проекте есть локальный сценарий `fuzz` для frontend:

```powershell
cd frontend
npm run fuzz
```

Он предназначен для расширенной negative/fuzz-проверки интерфейса и API, но не включён в обязательный GitHub CI, чтобы не усложнять базовый pipeline.

## Локальная проверка тестов и покрытия
Frontend запускается через `npm`:

```powershell
cd frontend
npm test
```

Backend запускается через Gradle Wrapper:

```powershell
cd backend
.\gradlew.bat check
```

Обе команды завершаются ошибкой, если тесты не проходят или если проверяемые критичные модули не достигают настроенного порога покрытия.

## Локальный запуск без Docker
Этот вариант полезен для отладки по частям.

### 1. PostgreSQL
Нужна локальная БД `knowledge_base`.  
После создания базы можно применить:

```powershell
psql -U postgres -d knowledge_base -f frontend/scripts/migrate.sql
```

При необходимости доступны дополнительные миграции:
- `frontend/scripts/migrate-password.sql`
- `frontend/scripts/migrate-rbac.sql`

### 2. Backend
Из папки `backend`:

```powershell
.\gradlew.bat bootRun
```

Если нужно явно передать параметры БД, используются переменные:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

### 3. Frontend
Из папки `frontend`:

```powershell
npm install
npm run dev
```

Для локальной работы фронтенду нужен доступ к backend по адресу:
- `http://localhost:8080`

По умолчанию это уже учтено в серверных helper-функциях.

## Демо-доступ
В `migrate.sql` добавлены демонстрационные пользователи:
- `admin@company.ru` / `admin123`
- `user1@company.ru` / `user123`
- `user2@company.ru` / `user123`

## Примечания
- При первом запуске в браузере может появляться пользовательское соглашение — это штатная часть учебной логики проекта.
- Раздел диалогов предназначен для демонстрации маршрутизации и работы интерфейса; сообщения сохраняются локально в браузере.
- Для наглядности и простоты часть серверной логики фронтенда сохранена в виде `Next.js API`-прокси, а доступ к базе централизован в `Spring Boot`.
