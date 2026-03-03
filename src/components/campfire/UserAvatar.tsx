'use client'

import { UserPresence } from '@/lib/supabase'

interface UserAvatarProps {
  user: UserPresence
  isCurrentUser: boolean
  position: number
}

export function UserAvatar({ user, isCurrentUser, position }: UserAvatarProps) {
  // Use first character of username as initial
  const initial = user.user_name.charAt(0).toUpperCase() || '?'

  return (
    <div className="flex flex-col items-center group">
      {/* Avatar circle with initial */}
      <div
        className={`
          relative w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold
          border-2 transition-all duration-300 hover:scale-110
          ${isCurrentUser
            ? 'bg-campfire-warm'
            : 'bg-campfire-bg/80'
          }
        `}
        style={{
          borderColor: isCurrentUser ? '#d4a574' : user.color,
          color: user.color,
        }}
      >
        {initial}

        {/* Current user indicator */}
        {isCurrentUser && (
          <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-campfire-yellow rounded-full border-2 border-campfire-bg flex items-center justify-center">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-campfire-bg rounded-full"></div>
          </div>
        )}
      </div>

      {/* User name */}
      <div
        className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-center max-w-16 sm:max-w-20 truncate px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-campfire-bg/60 border"
        style={{
          color: user.color,
          borderColor: user.color + '40'
        }}
      >
        {user.user_name}
      </div>

      {/* Hover effect - show user info */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-full mt-2 bg-campfire-warm text-campfire-text text-xs rounded px-2 py-1 whitespace-nowrap z-20 border border-campfire-ember/30">
        {isCurrentUser ? 'あなた' : user.user_name}
        <div className="text-campfire-text/60">
          参加時刻: {new Date(user.last_seen).toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  )
}
