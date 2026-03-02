import { useState, useEffect, useRef } from 'react'
import { supabase, ChatMessage } from '@/lib/supabase'

export function useChat(
  roomId: string,
  userId: string,
  userName: string,
  userColor: string,
  onSpeechBubble?: (userId: string, content: string) => void
) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<any>(null)
  const onSpeechBubbleRef = useRef(onSpeechBubble)
  onSpeechBubbleRef.current = onSpeechBubble

  useEffect(() => {
    if (!roomId || !userId || !userName) return

    const channel = supabase.channel(`room:${roomId}:chat`, {
      config: { broadcast: { self: true } },
    })
    channelRef.current = channel

    // Listen for chat messages
    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        const message: ChatMessage = {
          id: generateMessageId(),
          user_id: payload.user_id,
          user_name: payload.user_name,
          content: payload.content,
          timestamp: payload.timestamp,
          color: payload.color,
        }

        setMessages(prev => [...prev, message])
      })
      .on('broadcast', { event: 'speech-bubble' }, ({ payload }) => {
        onSpeechBubbleRef.current?.(payload.user_id, payload.content)
      })

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true)
        console.log('Connected to chat channel')
      } else if (status === 'CHANNEL_ERROR') {
        setIsConnected(false)
        console.error('Chat channel connection error')
      }
    })

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
      setIsConnected(false)
      setMessages([])
    }
  }, [roomId, userId, userName])

  const sendMessage = async (content: string) => {
    if (!channelRef.current || !isConnected || !content.trim()) {
      return false
    }

    try {
      const payload = {
        user_id: userId,
        user_name: userName,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        color: userColor,
      }

      // Broadcast the message
      await channelRef.current.send({
        type: 'broadcast',
        event: 'message',
        payload,
      })

      // Also send speech bubble event for UI
      await channelRef.current.send({
        type: 'broadcast',
        event: 'speech-bubble',
        payload: {
          user_id: userId,
          content: content.trim(),
          timestamp: new Date().toISOString(),
        },
      })

      return true
    } catch (error) {
      console.error('Failed to send message:', error)
      return false
    }
  }

  return {
    messages,
    isConnected,
    sendMessage,
  }
}

// Hook for managing speech bubbles
export function useSpeechBubbles() {
  const [speechBubbles, setSpeechBubbles] = useState<Map<string, { content: string; timestamp: number }>>(new Map())

  const showSpeechBubble = (userId: string, content: string) => {
    setSpeechBubbles(prev => {
      const newMap = new Map(prev)
      newMap.set(userId, {
        content,
        timestamp: Date.now(),
      })
      return newMap
    })

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setSpeechBubbles(prev => {
        const newMap = new Map(prev)
        newMap.delete(userId)
        return newMap
      })
    }, 3000)
  }

  useEffect(() => {
    // Clean up old speech bubbles every second
    const cleanup = setInterval(() => {
      const now = Date.now()
      setSpeechBubbles(prev => {
        const newMap = new Map()
        prev.forEach((bubble, userId) => {
          if (now - bubble.timestamp < 3000) {
            newMap.set(userId, bubble)
          }
        })
        return newMap
      })
    }, 1000)

    return () => clearInterval(cleanup)
  }, [])

  return {
    speechBubbles,
    showSpeechBubble,
  }
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}