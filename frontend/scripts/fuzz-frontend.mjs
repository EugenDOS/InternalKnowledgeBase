if (!process.env.FRONTEND_BASE_URL) {
  throw new Error("FRONTEND_BASE_URL must be configured")
}

const baseUrl = process.env.FRONTEND_BASE_URL.replace(/\/$/, "")

const interestingValues = [
  "",
  " ",
  "test",
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "<script>alert(1)</script>",
  "\"'`{}[]()",
  "../../../etc/passwd",
  "Поиск знаний",
  "DROP TABLE users;",
]

function randomString(length) {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 !@#$%^&*()_+-={}[]:;\"'<>,.?/\\|~`абвгдежзийклмнопрстуфхцчшщъыьэюя"

  let value = ""
  for (let index = 0; index < length; index += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)]
  }

  return value
}

async function request(label, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
  })

  const text = await response.text()

  if (response.status >= 500) {
    throw new Error(`${label} returned ${response.status}\n${text.slice(0, 400)}`)
  }

  console.log(`[OK] ${label}: ${response.status}`)
  return { response, text }
}

async function testPages() {
  await request("Главная страница", "/")
  await request("Статьи без фильтра", "/articles")

  for (const query of [...interestingValues, randomString(128), randomString(256)]) {
    await request("Поиск статей", `/articles?q=${encodeURIComponent(query)}`)
  }

  await request("Несуществующая категория", `/categories/${encodeURIComponent(randomString(24))}`)
  await request("Несуществующий диалог", `/dialogs/${encodeURIComponent(randomString(24))}`)
}

async function testApi() {
  const jsonHeaders = {
    "content-type": "application/json",
    accept: "application/json",
  }

  await request("Текущий пользователь без сессии", "/api/auth/me")
  await request("Список пользователей без сессии", "/api/users")
  await request("Создание статьи без сессии", "/api/articles", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      title: "Новая статья",
      categoryId: "unknown-category",
      authorId: "unknown-user",
    }),
  })

  await request("Некорректный JSON логина", "/api/auth/login", {
    method: "POST",
    headers: jsonHeaders,
    body: "{",
  })

  for (const value of [...interestingValues, randomString(120)]) {
    await request("Логин с ошибочными данными", "/api/auth/login", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        email: value,
        password: value,
      }),
    })

    await request("Регистрация с ошибочными данными", "/api/auth/register", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        email: value,
        password: value,
        username: value,
        fullName: value,
      }),
    })
  }
}

async function main() {
  console.log(`Running frontend negative/fuzz checks against ${baseUrl}`)
  await testPages()
  await testApi()
  console.log("Frontend negative/fuzz checks finished without server-side crashes.")
}

main().catch((error) => {
  console.error("Frontend negative/fuzz checks failed.")
  console.error(error)
  process.exit(1)
})
