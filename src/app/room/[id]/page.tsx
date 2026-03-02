'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useRoom } from '@/hooks/useRoom'
import { usePresence, useRoomAutoDelete } from '@/hooks/usePresence'
import { useChat, useSpeechBubbles } from '@/hooks/useChat'
import { CampfireScene } from '@/components/campfire/CampfireScene'
import { ChatSystem } from '@/components/chat/ChatSystem'
import { RoomHeader } from '@/components/room/RoomHeader'
import { generateUserId, assignUserColor } from '@/lib/colors'

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const roomId = params.id as string
  const userName = searchParams.get('user') || ''

  // Generate stable userId once at page level
  const userIdRef = useRef(generateUserId())
  const userId = userIdRef.current
  const userColor = assignUserColor(userId)

  const [message, setMessage] = useState('')

  // Redirect if no user name
  useEffect(() => {
    if (!userName) {
      router.push('/')
      return
    }
  }, [userName, router])

  // Room data
  const { room, loading: roomLoading, error: roomError, switchMode } = useRoom(roomId)

  // User presence - pass userId directly
  const { users, currentUser, isOnline, loading: presenceLoading, isAlone, userCount } = usePresence(roomId, userName, userId)

  // Auto-delete when alone + watch for room deletion
  useRoomAutoDelete(roomId, isAlone, () => {
    router.push('/')
  })

  // Speech bubbles
  const { speechBubbles, showSpeechBubble } = useSpeechBubbles()

  // Chat - use stable userId/color directly, not dependent on currentUser
  const { messages, isConnected, sendMessage } = useChat(
    roomId,
    userId,
    userName,
    userColor,
    showSpeechBubble
  )

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!message.trim() || !isConnected) return

    const success = await sendMessage(message)
    if (success) {
      setMessage('')
    }
  }

  if (!userName) {
    return null // Will redirect
  }

  if (roomLoading || presenceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-campfire-bg text-campfire-text">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-campfire-orange mx-auto mb-4"></div>
          <div className="text-campfire-text/60">ルームに接続中...</div>
        </div>
      </div>
    )
  }

  if (roomError || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-campfire-bg text-campfire-text">
        <div className="text-center">
          <div className="text-campfire-orange mb-4">ルームが見つかりません</div>
          <button
            onClick={() => router.push('/')}
            className="bg-campfire-ember hover:bg-campfire-ember/80 px-4 py-2 rounded-md text-campfire-text"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  if (userCount > 12) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-campfire-bg text-campfire-text">
        <div className="text-center">
          <div className="text-campfire-orange mb-4">ルームが満員です（最大12名）</div>
          <button
            onClick={() => router.push('/')}
            className="bg-campfire-ember hover:bg-campfire-ember/80 px-4 py-2 rounded-md text-campfire-text"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-campfire-bg text-campfire-text">
      {/* Header */}
      <RoomHeader
        room={room}
        userCount={userCount}
        onSwitchMode={switchMode}
        onLeaveRoom={() => router.push('/')}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Campfire Scene - 55% */}
        <div className="flex-[55] relative min-h-0">
          <CampfireScene
            users={users}
            speechBubbles={speechBubbles}
            currentUserId={userId}
          />
        </div>

        {/* Chat System - 45% */}
        <div className="flex-[45] border-t border-campfire-ember/20 min-h-0 flex flex-col overflow-hidden">
          <ChatSystem
            messages={messages}
            message={message}
            onMessageChange={setMessage}
            onSendMessage={handleSendMessage}
            isConnected={isConnected}
            currentUser={currentUser}
          />
        </div>
      </div>

      {/* Connection Status */}
      {!isOnline && (
        <div className="fixed top-4 right-4 bg-campfire-ember text-campfire-text px-3 py-1 rounded text-sm">
          接続中...
        </div>
      )}
    </div>
  )
}