"use client"

// ==========================================
// StoreProvider — обёртка с Redux Provider
// Практика 5: Оборачиваем корневой компонент в Provider
// ==========================================
//
// Это отдельный Client Component, потому что Redux Provider
// требует клиентского контекста React. В Next.js App Router
// нельзя напрямую использовать <Provider> внутри Server Component.

import { Provider } from "react-redux"
import { store } from "@/store"

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>
}
