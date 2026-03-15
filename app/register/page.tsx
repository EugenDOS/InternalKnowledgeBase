"use client"

// ==========================================
// Страница регистрации нового пользователя
// ==========================================

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { loginThunk, clearError } from "@/store/slices/auth-slice"
import { isAuthenticated } from "@/lib/auth"
import { useForm } from "react-hook-form"

interface RegisterFormValues {
  fullName: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const authState = useAppSelector((state) => state)
  const authenticated = isAuthenticated(authState)

  // Если уже вошёл — на главную
  useEffect(() => {
    if (authenticated) {
      router.replace("/")
    }
  }, [authenticated, router])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>()

  const password = watch("password")

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName,
          username: values.username,
          email: values.email,
          password: values.password,
        }),
      })

      const data = (await res.json()) as { user?: unknown; error?: string }

      if (!res.ok) {
        setServerError(data.error ?? "Ошибка регистрации")
        return
      }

      // После успешной регистрации сразу входим
      dispatch(clearError())
      await dispatch(loginThunk({ email: values.email, password: values.password }))
    } catch {
      setServerError("Ошибка сети. Попробуйте ещё раз.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 py-12">
      <div className="flex items-center gap-2 text-foreground">
        <BookOpen className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">База знаний</span>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-lg">Создать аккаунт</CardTitle>
          <CardDescription className="text-center text-xs">
            Заполните все поля для регистрации
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* Полное имя */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Полное имя</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Иван Иванов"
                autoComplete="name"
                {...register("fullName", {
                  required: "Введите полное имя",
                  minLength: { value: 2, message: "Минимум 2 символа" },
                })}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            {/* Имя пользователя */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                type="text"
                placeholder="ivan_ivanov"
                autoComplete="username"
                {...register("username", {
                  required: "Введите имя пользователя",
                  minLength: { value: 3, message: "Минимум 3 символа" },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: "Только латинские буквы, цифры и _",
                  },
                })}
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
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

            {/* Пароль */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Минимум 6 символов"
                autoComplete="new-password"
                {...register("password", {
                  required: "Введите пароль",
                  minLength: { value: 6, message: "Минимум 6 символов" },
                })}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Подтверждение пароля */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                autoComplete="new-password"
                {...register("confirmPassword", {
                  required: "Подтвердите пароль",
                  validate: (val) => val === password || "Пароли не совпадают",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Ошибка с сервера */}
            {serverError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              <UserPlus className="h-4 w-4" />
              {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Войти
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
