"use client"

import Link from "next/link"
import { Search, BookOpen, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

// Презентационный компонент хедера (Практика 2, 4: разделение на контейнеры и презентационные)

interface HeaderProps {
  onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

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
        {/* Кнопка входа — заглушка для Практики 6 (аутентификация) */}
        <Link href="/login">
          <Button variant="ghost" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Войти</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
