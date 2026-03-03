'use client'

import { useEffect, useRef, useState } from 'react'
import { UserPresence } from '@/lib/supabase'
import { calculateCampfirePositions, getSpeechBubblePosition } from '@/lib/campfire'
import { CampfireFlame } from './CampfireFlame'
import { UserAvatar } from './UserAvatar'
import { SpeechBubble } from './SpeechBubble'

interface CampfireSceneProps {
  users: UserPresence[]
  speechBubbles: Map<string, { content: string; timestamp: number }>
  currentUserId?: string
}

export function CampfireScene({ users, speechBubbles, currentUserId }: CampfireSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        setContainerSize({ width: clientWidth, height: clientHeight })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const userPositions = calculateCampfirePositions(
    users.length,
    containerSize.width,
    containerSize.height
  )

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-campfire-bg overflow-hidden"
    >
      {/* Stars/Background */}
      <div className="absolute inset-0">
        <div className="absolute top-8 left-16 w-1 h-1 bg-campfire-text/40 rounded-full animate-pulse"></div>
        <div className="absolute top-16 right-24 w-1 h-1 bg-campfire-text/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-12 left-1/3 w-1 h-1 bg-campfire-text/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-20 right-1/3 w-1 h-1 bg-campfire-text/40 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-24 left-2/3 w-1 h-1 bg-campfire-text/40 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-6 right-16 w-1 h-1 bg-campfire-text/40 rounded-full animate-pulse" style={{ animationDelay: '2.5s' }}></div>
      </div>

      {/* Campfire ambient light - radial glow from fire center */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '50%',
          top: containerSize.height * 0.5,
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(192,57,43,0.18) 0%, rgba(230,126,34,0.1) 25%, rgba(230,126,34,0.04) 50%, transparent 70%)',
        }}
      />

      {/* Campfire flame in the center */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{ top: containerSize.height * 0.5 }}
      >
        <CampfireFlame />
      </div>

      {/* Users positioned around the fire */}
      {users.map((user, index) => {
        const position = userPositions[index]
        if (!position) return null

        const speechBubble = speechBubbles.get(user.user_id)
        const bubblePosition = speechBubble ? getSpeechBubblePosition(position) : null

        return (
          <div key={user.user_id}>
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
              style={{
                left: position.x,
                top: position.y,
              }}
            >
              <UserAvatar
                user={user}
                isCurrentUser={user.user_id === currentUserId}
                position={index + 1}
              />
            </div>

            {speechBubble && bubblePosition && (
              <div
                className="absolute z-10 transition-all duration-300 ease-out"
                style={{
                  left: bubblePosition.x,
                  top: bubblePosition.y,
                }}
              >
                <SpeechBubble
                  content={speechBubble.content}
                  direction={bubblePosition.direction}
                  userName={user.user_name}
                  userColor={user.color}
                />
              </div>
            )}
          </div>
        )
      })}

      {/* Welcome message when room is empty */}
      {users.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-campfire-text/70">
            <div className="text-lg mb-1">焚き火を囲んで語りましょう</div>
            <div className="text-sm">他の参加者が来るのを待っています...</div>
          </div>
        </div>
      )}

      {/* User count indicator */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-campfire-warm/60 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-campfire-text text-xs sm:text-sm border border-campfire-ember/30">
        {users.length}/12
      </div>
    </div>
  )
}
