'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-lobby-bg">
      <div className="max-w-md w-full p-8 bg-lobby-card rounded-2xl border border-lobby-border shadow-sm text-center">
        <h1 className="text-xl font-bold text-lobby-text mb-4">
          エラーが発生しました
        </h1>
        <p className="text-lobby-muted mb-6">
          申し訳ありませんが、予期しないエラーが発生しました。
        </p>

        <details className="text-left mb-6">
          <summary className="text-sm text-lobby-muted cursor-pointer hover:text-lobby-text">
            エラー詳細を表示
          </summary>
          <div className="mt-2 p-3 bg-red-50 rounded-lg text-xs text-red-700 font-mono overflow-auto border border-red-200">
            {error.message}
            {error.stack && (
              <pre className="mt-2 text-xs">{error.stack}</pre>
            )}
          </div>
        </details>

        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full bg-lobby-accent hover:bg-lobby-accent-light px-4 py-2.5 rounded-lg font-medium transition-colors text-white"
          >
            再試行
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full border border-lobby-border hover:bg-lobby-hover px-4 py-2.5 rounded-lg font-medium transition-colors text-lobby-muted"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  )
}