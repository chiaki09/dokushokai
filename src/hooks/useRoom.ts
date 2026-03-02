import { useState, useEffect } from 'react'
import { Room, supabase } from '@/lib/supabase'
import {
  getRoom,
  getActiveRooms,
  createRoom as createRoomUtil,
  updateRoomMode,
  deleteRoom as deleteRoomUtil,
  verifyRoomPassword,
  roomRequiresPassword,
} from '@/lib/room-utils'

export function useRoom(roomId?: string) {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load specific room
  useEffect(() => {
    if (!roomId) {
      setRoom(null)
      setLoading(false)
      return
    }

    async function fetchRoom() {
      if (!roomId) return

      setLoading(true)
      setError(null)

      const { data, error } = await getRoom(roomId)

      if (error) {
        setError('ルームが見つかりません')
        setRoom(null)
      } else {
        setRoom(data)
      }

      setLoading(false)
    }

    fetchRoom()
  }, [roomId])

  // Subscribe to room changes
  useEffect(() => {
    if (!roomId) return

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setRoom(payload.new as Room)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        () => {
          setRoom(null)
          setError('ルームが削除されました')
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const switchMode = async (mode: 'impression' | 'chat') => {
    if (!roomId) return false

    const { error } = await updateRoomMode(roomId, mode)
    if (error) {
      setError('モードの変更に失敗しました')
      return false
    }
    return true
  }

  return {
    room,
    loading,
    error,
    switchMode,
  }
}

export function useRoomList() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load active rooms
  const fetchRooms = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await getActiveRooms()

    if (error) {
      setError('ルーム一覧の取得に失敗しました')
      setRooms([])
    } else {
      setRooms(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  // Subscribe to room list changes
  useEffect(() => {
    const channel = supabase
      .channel('rooms')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rooms',
        },
        (payload) => {
          const newRoom = payload.new as Room
          setRooms(prev => [newRoom, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
        },
        (payload) => {
          const updatedRoom = payload.new as Room
          setRooms(prev =>
            prev.map(room => room.id === updatedRoom.id ? updatedRoom : room)
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'rooms',
        },
        (payload) => {
          const deletedRoom = payload.old as Room
          setRooms(prev => prev.filter(room => room.id !== deletedRoom.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const createRoom = async (
    name: string,
    roomType: 'free-participation' | 'assigned-book',
    bookTitle?: string,
    password?: string
  ) => {
    try {
      const { data, error } = await createRoomUtil(name, roomType, bookTitle, password)

      if (error) {
        console.error('Room creation error:', error)
        setError(`ルームの作成に失敗しました: ${error.message || JSON.stringify(error)}`)
        return null
      }

      return data
    } catch (err) {
      console.error('Room creation exception:', err)
      setError(`ルームの作成に失敗しました: ${err instanceof Error ? err.message : String(err)}`)
      return null
    }
  }

  const deleteRoom = async (roomId: string) => {
    const { error } = await deleteRoomUtil(roomId)

    if (error) {
      setError('ルームの削除に失敗しました')
      return false
    }

    return true
  }

  return {
    rooms,
    loading,
    error,
    createRoom,
    deleteRoom,
    refetch: fetchRooms,
  }
}

export function useRoomAccess() {
  const [accessing, setAccessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const joinRoom = async (room: Room, password?: string) => {
    setAccessing(true)
    setError(null)

    try {
      // Check if room requires password
      if (roomRequiresPassword(room)) {
        if (!password) {
          setError('パスワードが必要です')
          setAccessing(false)
          return false
        }

        const isPasswordValid = await verifyRoomPassword(room, password)
        if (!isPasswordValid) {
          setError('パスワードが正しくありません')
          setAccessing(false)
          return false
        }
      }

      // Room access successful
      setAccessing(false)
      return true
    } catch (err) {
      setError('ルームへの参加に失敗しました')
      setAccessing(false)
      return false
    }
  }

  return {
    accessing,
    error,
    joinRoom,
  }
}