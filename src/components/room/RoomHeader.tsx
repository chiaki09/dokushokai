'use client'

import { Room } from '@/lib/supabase'

interface RoomHeaderProps {
  room: Room
  userCount: number
  onSwitchMode: (mode: 'impression' | 'chat') => Promise<boolean>
  onLeaveRoom: () => void
}

export function RoomHeader({ room, userCount, onSwitchMode, onLeaveRoom }: RoomHeaderProps) {
  const formatTimeRemaining = (expiresAt: string): string => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return '期限切れ'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}`
    }
    return `${minutes}分`
  }

  const handleModeSwitch = async (newMode: 'impression' | 'chat') => {
    if (newMode === room.current_mode) return
    await onSwitchMode(newMode)
  }

  const isExpiringSoon = new Date(room.expires_at).getTime() - Date.now() < 30 * 60 * 1000 // 30 minutes

  return (
    <header className="bg-campfire-warm/60 border-b border-campfire-ember/20 px-3 py-2 sm:px-6 sm:py-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-0 sm:justify-between">
        {/* Room Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-campfire-text truncate">{room.name}</h1>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-campfire-text/60 mt-0.5 sm:mt-1">
            {room.book_title && (
              <span className="text-campfire-yellow truncate max-w-[120px] sm:max-w-none">{room.book_title}</span>
            )}
            <span className="shrink-0">{userCount}/12名</span>
            <span className={`shrink-0 ${isExpiringSoon ? 'text-campfire-orange' : ''}`}>
              残り{formatTimeRemaining(room.expires_at)}
            </span>
          </div>
        </div>

        {/* Leave Button */}
        <button
          onClick={onLeaveRoom}
          className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm border border-campfire-ember/30 rounded-md hover:bg-campfire-ember/10 text-campfire-text/70 transition-colors shrink-0 order-last sm:order-none"
        >
          退出
        </button>

        {/* Mode Switch (only for assigned-book type) */}
        {room.room_type === 'assigned-book' && (
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto order-last sm:order-none mt-1 sm:mt-0">
            <span className="text-xs text-campfire-text/50 hidden sm:inline">モード:</span>
            <div className="flex bg-campfire-bg/40 rounded-md overflow-hidden border border-campfire-ember/30 flex-1 sm:flex-none">
              <button
                onClick={() => handleModeSwitch('impression')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium transition-colors ${
                  room.current_mode === 'impression'
                    ? 'bg-campfire-ember text-campfire-text'
                    : 'text-campfire-text/60 hover:bg-campfire-ember/20'
                }`}
              >
                感想タイム
              </button>
              <button
                onClick={() => handleModeSwitch('chat')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium transition-colors ${
                  room.current_mode === 'chat'
                    ? 'bg-campfire-ember text-campfire-text'
                    : 'text-campfire-text/60 hover:bg-campfire-ember/20'
                }`}
              >
                雑談タイム
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mode Description */}
      {room.room_type === 'assigned-book' && (
        <div className="mt-1.5 sm:mt-2 text-xs text-campfire-text/40">
          {room.current_mode === 'impression'
            ? '本の感想や印象的な部分について話し合いましょう'
            : '本に関連する雑談や自由な会話をお楽しみください'
          }
        </div>
      )}
    </header>
  )
}
