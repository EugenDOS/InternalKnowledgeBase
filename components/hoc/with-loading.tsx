import React from "react"

// HOC (Higher Order Component) — Практика 2: паттерн переиспользования логики
// Оборачивает компонент, добавляя индикатор загрузки

interface WithLoadingProps {
  isLoading: boolean
}

export default function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  function WithLoadingComponent(props: P & WithLoadingProps) {
    const { isLoading, ...rest } = props

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )
    }

    return <WrappedComponent {...(rest as P)} />
  }

  WithLoadingComponent.displayName = `withLoading(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`

  return WithLoadingComponent
}
