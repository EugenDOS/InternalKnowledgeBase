"use client"

// ==========================================
// Header — подключён к Redux Store
// Практика 5: useAppSelector (чтение auth), useAppDispatch (logout)
// Практика 6: показ имени пользователя, кнопка выхода
// ==========================================

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, BookOpen, User, Menu, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { logoutThunk } from "@/store/slices/auth-slice"
import { isAuthenticated } from "@/lib/auth"

interface HeaderProps {
    onToggleSidebar: () => void
}

// Практика 8: две роли
const roleLabels: Record<string, string> = {
    admin: "Администратор",
    user: "Пользователь",
}

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
    admin: "default",
    user: "secondary",
}

export default function Header({ onToggleSidebar }: HeaderProps) {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [searchQuery, setSearchQuery] = useState("")
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

    // useSelector: читаем только срез auth, не весь state (Практика 5)
    const auth = useAppSelector((state) => state.auth)
    const authenticated = isAuthenticated(auth)
    const user = auth.user

    useEffect(() => {
        setSearchQuery(searchParams.get("q") ?? "")
    }, [searchParams])

    // useDispatch: отправляем action creator logout (Практика 5)
    async function handleLogout() {
        await dispatch(logoutThunk())
        router.replace("/login")
    }

    function runSearch() {
        const trimmedQuery = searchQuery.trim()

        if (!trimmedQuery) {
            router.push("/articles")
        } else {
            router.push(`/articles?q=${encodeURIComponent(trimmedQuery)}`)
        }

        setMobileSearchOpen(false)
    }

    function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        runSearch()
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
                <form onSubmit={handleSearchSubmit} className="relative">
                    <button
                        type="submit"
                        className="absolute left-2.5 top-2.5 text-muted-foreground"
                        aria-label="Искать статьи"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                    <Input
                        type="search"
                        placeholder="Поиск статей..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Escape" && pathname === "/articles") {
                                setSearchQuery("")
                                router.push("/articles")
                            }
                        }}
                    />
                </form>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Поиск статей"
                    onClick={() => setMobileSearchOpen(true)}
                >
                    <Search className="h-4 w-4" />
                </Button>

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

            <Dialog open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Поиск статей</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
                        <Input
                            type="search"
                            placeholder="Поиск статей..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <Button type="submit">Найти</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </header>
    )
}
