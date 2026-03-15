"use client"

// ==========================================
// Страница входа в систему
// Практика 5: useSelector (чтение state), useDispatch (отправка actions)
// Практика 6: loginThunk → API → Redux Store → редирект
// ==========================================

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { loginThunk, clearError } from "@/store/slices/auth-slice"
import { isAuthenticated } from "@/lib/auth"
import { useForm } from "react-hook-form"

interface LoginFormValues {
  email: string
  password: string
}

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  // useSelector: читаем состояние auth из Redux Store (Практика 5)
  const authState = useAppSelector((state) => state)
  const authenticated = isAuthenticated(authState)
  const isLoading = authState.auth.isLoading
  const error = authState.auth.error

  // Редирект на главную при авторизации (уже вошёл или после успешного входа)
  useEffect(() => {
    if (authenticated) {
      router.replace("/")
    }
  }, [authenticated, router])

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>()

  // useDispatch: отправляем action creator loginThunk (Практика 5)
  function onSubmit(values: LoginFormValues) {
    dispatch(clearError())
    dispatch(loginThunk({ email: values.email, password: values.password }))
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 py-12">
      <div className="flex items-center gap-2 text-foreground">
        <BookOpen className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">База знаний</span>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-lg">Вход в систему</CardTitle>
          <CardDescription className="text-center text-xs">
            Используйте корпоративный email и пароль
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@company.ru"
                autoComplete="email"
                {...register("email", {
                  required: "Введите email",
                  pattern: { value: /\S+@\S+\.\S+/, message: "Некорректный email" },
                })}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                autoComplete="current-password"
                {...register("password", { required: "Введите пароль" })}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Ошибка из Redux Store (loginThunk.rejected) */}
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              <LogIn className="h-4 w-4" />
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Зарегистрироваться
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
