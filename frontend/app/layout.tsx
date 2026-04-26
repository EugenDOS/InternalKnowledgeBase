import type { Metadata } from "next"
import "./globals.css"
import AppShell from "@/components/layout/app-shell"
import StoreProvider from "@/components/providers/store-provider"

export const metadata: Metadata = {
    title: "База знаний компании",
    description: "Платформа для внутренней базы знаний компании",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ru">
        <body className="font-sans antialiased">
        {/* StoreProvider оборачивает всё приложение — Практика 5 */}
        <StoreProvider>
            <AppShell>{children}</AppShell>
        </StoreProvider>
        </body>
        </html>
    )
}
