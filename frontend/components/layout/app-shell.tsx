"use client"

import { Suspense, useState } from "react"
import Header from "./header"
import SidebarNav from "./sidebar-nav"

// Контейнерный компонент-обертка для всего приложения (Практика 4: контейнеры и презентационные)

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col">
      <Suspense fallback={<div className="h-14 border-b border-border bg-card" />}>
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
      </Suspense>
      <div className="flex flex-1 overflow-hidden">
        <SidebarNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
