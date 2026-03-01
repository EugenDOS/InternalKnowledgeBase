"use client"

// ==========================================
// Header — подключён к Redux Store
// Практика 5: useAppSelector (чтение auth), useAppDispatch (logout)
// Практика 6: показ имени пользователя, кнопка выхода
// ==========================================

import Link from "next/link"
import { Search, BookOpen, User, Menu, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { logout } from "@/store/slices/auth-slice"
import { isAuthenticated } from "@/lib/auth"
import { useState } from "react"

interface HeaderProps {
    onToggleSidebar: () => void
}

const roleLabels: Record<string, string> = {
    admin: "Администратор",
    editor: "Редактор",
    viewer: "Читатель",
}

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
    admin: "default",
    editor: "secondary",
    viewer: "outline",
}

export default function Header({ onToggleSidebar }: HeaderProps) {
    const dispatch = useAppDispatch()
    const [searchQuery, setSearchQuery] = useState("")

    // useSelector: читаем только срез auth, не весь state (Практика 5)
    const auth = useAppSelector((state) => state.auth)
    const authenticated = isAuthenticated(auth)
    const user = auth.user

    // useDispatch: отправляем action creator logout (Практика 5)
    function handleLogout() {
        dispatch(logout())
    }

    return (
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onToggleSidebar}
                    aria-label="Открыть меню"
                >
                    <Menu className="h-5 w-5" />
                </Button>
                <Link href="/" className="flex items-center gap-2 text-foreground">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold">База знаний</span>
                </Link>
            </div>

            <div className="hidden max-w-sm flex-1 px-4 md:block">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Поиск статей..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                {authenticated && user ? (
                    // Пользователь авторизован — показываем меню с именем и кнопкой выхода
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">{user.fullName}</span>
                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {user.fullName}
                </span>
                                <span className="text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5">
                                <Badge
                                    variant={roleBadgeVariant[user.role] ?? "outline"}
                                    className="text-xs"
                                >
                                    {roleLabels[user.role] ?? user.role}
                                </Badge>
                            </div>
                            <DropdownMenuSeparator />
                            {/* logout — диспатчит action creator из auth-slice (Практика 5) */}
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="gap-2 text-destructive focus:text-destructive"
                            >
                                <LogOut className="h-4 w-4" />
                                Выйти
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    // Не авторизован — кнопка входа
                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Войти</span>
                        </Button>
                    </Link>
                )}
            </div>
        </header>
    )
}
