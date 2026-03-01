"use client"

import { useState } from "react"
import Header from "./header"
import SidebarNav from "./sidebar-nav"

// Контейнерный компонент-обертка для всего приложения (Практика 4: контейнеры и презентационные)

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <SidebarNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
