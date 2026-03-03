import { useState, useEffect, useRef } from 'react'
import { supabase, UserPresence } from '@/lib/supabase'
import { assignUserColor } from '@/lib/colors'
import { deleteRoom } from '@/lib/room-utils'

export function usePresence(roomId: string, userName: string, userId: string) {
  const [users, setUsers] = useState<UserPresence[]>([])
  const [isOnline, setIsOnline] = useState(false)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<any>(null)
  const lastSeenTimerRef = useRef<NodeJS.Timeout>()
  const isOnlineRef = useRef(false)

  useEffect(() => {
    if (!roomId || !userName.trim() || !userId) return

    const channel = supabase.channel(`room:${roomId}:presence`)
    channelRef.current = channel

    const userPresence: Omit<UserPresence, 'last_seen'> = {
      user_id: userId,
      user_name: userName,
      color: assignUserColor(userId),
      position: Math.floor(Math.random() * 1000),
    }

    // Configure presence tracking
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState()
        const userList: UserPresence[] = []

        Object.keys(presenceState).forEach((presenceId) => {
          const presences = presenceState[presenceId] as any[]
          presences.forEach((presence) => {
            userList.push({
              user_id: presence.user_id,
              user_name: presence.user_name,
              color: presence.color,
              position: presence.position,
              last_seen: presence.last_seen,
            })
          })
        })

        userList.sort((a, b) => a.position - b.position)
        setUsers(userList)
        setLoading(false)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences)
        // After leave, check if room is now empty via current presence state
        const presenceState = channel.presenceState()
        const remaining = Object.keys(presenceState).reduce((count, key) => {
          return count + (presenceState[key] as any[]).length
        }, 0)
        if (remaining === 0) {
          deleteRoom(roomId).catch(console.error)
        }
      })

    // Subscribe first, then track (guarantees order)
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Successfully joined room presence')
        channel
          .track({
            ...userPresence,
            last_seen: new Date().toISOString(),
          })
          .then(() => {
            setIsOnline(true)
            isOnlineRef.current = true
          })
      }
    })

    // Update last_seen every 30 seconds
    const updatePresence = () => {
      if (channel && isOnlineRef.current) {
        channel.track({
          ...userPresence,
          last_seen: new Date().toISOString(),
        })
      }
    }

    lastSeenTimerRef.current = setInterval(updatePresence, 30000)

    return () => {
      if (lastSeenTimerRef.current) {
        clearInterval(lastSeenTimerRef.current)
      }

      // Before untracking, check if we're the last user.
      // Handles SPA navigation (router.push) which does NOT fire beforeunload.
      // Tab close is handled by sendBeacon in useRoomAutoDelete.
      if (channel && isOnlineRef.current) {
        const presenceState = channel.presenceState()
        const remaining = Object.values(presenceState).reduce(
          (count, presences) => count + (presences as any[]).length, 0
        )
        if (remaining <= 1) {
          deleteRoom(roomId).catch(() => {})
        }
      }

      if (channel) {
        channel.untrack()
        supabase.removeChannel(channel)
      }

      isOnlineRef.current = false
      setIsOnline(false)
      setUsers([])
    }
  }, [roomId, userName, userId])

  const currentUser = users.find(user => user.user_id === userId)
  const isAlone = users.length <= 1 && isOnline

  return {
    users,
    currentUser,
    isOnline,
    loading,
    isAlone,
    userId,
    userCount: users.length,
  }
}

// Hook for tracking room auto-deletion when all users leave
export function useRoomAutoDelete(roomId: string, _isAlone: boolean, onRoomDeleted?: () => void) {
  useEffect(() => {
    if (!roomId) return

    // Always send beacon on tab close - the API will check if anyone remains
    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        `/api/room-cleanup`,
        JSON.stringify({ roomId })
      )
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [roomId])

  // Also notify user if room was deleted by someone else
  useEffect(() => {
    if (!roomId) return

    const channel = supabase
      .channel(`room-delete-watch:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        () => {
          onRoomDeleted?.()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, onRoomDeleted])
}