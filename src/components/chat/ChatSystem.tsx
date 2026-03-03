'use client'

import { useEffect, useRef } from 'react'
import { ChatMessage, UserPresence } from '@/lib/supabase'

interface ChatSystemProps {
  messages: ChatMessage[]
  message: string
  onMessageChange: (message: string) => void
  onSendMessage: () => void
  isConnected: boolean
  currentUser?: UserPresence
}

export function ChatSystem({
  messages,
  message,
  onMessageChange,
  onSendMessage,
  isConnected,
  currentUser
}: ChatSystemProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-campfire-bg/50">
      {/* Chat header */}
      <div className="px-3 py-2 sm:px-4 sm:py-3 border-b border-campfire-orange/20 bg-campfire-warm/20">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-campfire-text text-sm sm:text-base">チャット</h3>
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-campfire-ember' : 'bg-campfire-text/30'
              }`}
            />
            <span className="text-campfire-text/50">
              {isConnected ? '接続中' : '切断中'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 sm:px-4 space-y-2 sm:space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-campfire-text/40 py-8">
            <div>まだメッセージがありません</div>
            <div className="text-sm mt-1">最初のメッセージを送信してみましょう</div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2 sm:gap-3 group">
              {/* Avatar */}
              <div
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 border"
                style={{
                  backgroundColor: msg.color + '20',
                  borderColor: msg.color + '40',
                  color: msg.color
                }}
              >
                {msg.user_name.charAt(0).toUpperCase()}
              </div>

              {/* Message content */}
              <div className="flex-1 min-w-0">
                {/* User name and timestamp */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className="font-medium text-sm"
                    style={{ color: msg.color }}
                  >
                    {msg.user_name}
                  </span>
                  <span className="text-xs text-campfire-text/30 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>

                {/* Message text */}
                <div className="text-sm text-campfire-text break-words">
                  {msg.content}
                </div>
              </div>

              {/* Current user indicator */}
              {currentUser && msg.user_id === currentUser.user_id && (
                <div className="text-xs text-campfire-yellow opacity-60">
                  (あなた)
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="px-3 py-2 sm:px-4 sm:py-3 border-t border-campfire-orange/20 bg-campfire-warm/20">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
            className="flex-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base bg-campfire-bg/80 border border-campfire-ember/30 rounded-md focus:outline-none focus:ring-1 focus:ring-campfire-ember text-campfire-text placeholder-campfire-text/30 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={isConnected ? "メッセージを入力..." : "接続中..."}
            maxLength={200}
          />
          <button
            onClick={onSendMessage}
            disabled={!message.trim() || !isConnected}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-campfire-ember hover:bg-campfire-ember/80 disabled:bg-campfire-warm disabled:cursor-not-allowed rounded-md font-medium transition-colors text-campfire-text"
          >
            送信
          </button>
        </div>

        {/* Character count */}
        <div className="text-right text-xs text-campfire-text/30 mt-1">
          {message.length}/200
        </div>
      </div>
    </div>
  )
}