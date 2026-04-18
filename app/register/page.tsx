"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, UserPlus } from "lucide-react"
import AgreementDialog from "@/components/agreement/agreement-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getDeviceOwnerProfile, hasAcceptedAgreementOnDevice, markAgreementAcceptedOnDevice, setDeviceOwnerProfile } from "@/lib/device-storage"
import { isAuthenticated } from "@/lib/auth"
import type { User } from "@/lib/types"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { loginThunk, clearError } from "@/store/slices/auth-slice"
import { resetAgreement } from "@/store/slices/agreement-slice"
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
  const [agreementOpen, setAgreementOpen] = useState(false)
  const [pendingLogin, setPendingLogin] = useState<{
    email: string
    password: string
    user: User
  } | null>(null)

  const auth = useAppSelector((state) => state.auth)
  const authenticated = isAuthenticated(auth)

  useEffect(() => {
    if (authenticated && !agreementOpen && !pendingLogin) {
      router.replace("/")
    }
  }, [authenticated, agreementOpen, pendingLogin, router])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>()

  const password = watch("password")

  async function finishLogin(email: string, passwordValue: string) {
    dispatch(clearError())

    const result = await dispatch(loginThunk({ email, password: passwordValue }))

    if (loginThunk.fulfilled.match(result)) {
      router.replace("/")
    } else {
      setServerError("Не удалось автоматически выполнить вход после регистрации.")
    }
  }

  function handleAgreementOpenChange(nextOpen: boolean) {
    setAgreementOpen(nextOpen)

    if (!nextOpen) {
      setPendingLogin(null)
    }
  }

  async function handleAgreementConfirm() {
    if (!pendingLogin) return

    markAgreementAcceptedOnDevice()

    if (!getDeviceOwnerProfile()) {
      setDeviceOwnerProfile({
        id: pendingLogin.user.id,
        fullName: pendingLogin.user.fullName,
        email: pendingLogin.user.email,
        username: pendingLogin.user.username,
      })
    }

    setAgreementOpen(false)
    await finishLogin(pendingLogin.email, pendingLogin.password)
    setPendingLogin(null)
  }

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

      const data = (await res.json()) as { user?: User; error?: string }

      if (!res.ok) {
        setServerError(data.error ?? "Ошибка регистрации")
        return
      }

      if (!data.user) {
        setServerError("Сервер не вернул данные нового пользователя.")
        return
      }

      if (!hasAcceptedAgreementOnDevice()) {
        dispatch(resetAgreement())
        setPendingLogin({
          email: values.email,
          password: values.password,
          user: data.user,
        })
        setAgreementOpen(true)
        return
      }

      if (!getDeviceOwnerProfile()) {
        setDeviceOwnerProfile({
          id: data.user.id,
          fullName: data.user.fullName,
          email: data.user.email,
          username: data.user.username,
        })
      }

      await finishLogin(values.email, values.password)
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

      <AgreementDialog
        open={agreementOpen}
        onOpenChange={handleAgreementOpenChange}
        onConfirm={handleAgreementConfirm}
        isSubmitting={isSubmitting}
      />

      <Card className="w-full max-w-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-lg">Создать аккаунт</CardTitle>
          <CardDescription className="text-center text-xs">
            Заполните все поля для регистрации
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                autoComplete="new-password"
                {...register("confirmPassword", {
                  required: "Подтвердите пароль",
                  validate: (value) => value === password || "Пароли не совпадают",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

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
