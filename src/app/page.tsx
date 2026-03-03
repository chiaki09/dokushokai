'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoomList, useRoomAccess } from '@/hooks/useRoom'
import { RoomCreationModal } from '@/components/room/RoomCreationModal'
import { RoomList } from '@/components/room/RoomList'

export default function Home() {
  const [userName, setUserName] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [roomPassword, setRoomPassword] = useState('')

  const router = useRouter()
  const { rooms, loading, error: roomError, createRoom } = useRoomList()
  const { accessing, error: accessError, joinRoom } = useRoomAccess()

  const handleCreateRoom = async (
    name: string,
    roomType: 'free-participation' | 'assigned-book',
    bookTitle?: string,
    password?: string
  ) => {
    if (!userName.trim()) {
      alert('ユーザー名を入力してください')
      return
    }

    const room = await createRoom(name, roomType, bookTitle, password)
    if (room) {
      router.push(`/room/${room.id}?user=${encodeURIComponent(userName)}`)
    }
  }

  const handleJoinRoom = async () => {
    if (!selectedRoom || !userName.trim()) return

    const success = await joinRoom(selectedRoom, roomPassword || undefined)
    if (success) {
      router.push(`/room/${selectedRoom.id}?user=${encodeURIComponent(userName)}`)
    }
  }

  return (
    <main className="min-h-screen bg-lobby-bg text-lobby-text">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-lobby-text mb-2">
            読書会チャット
          </h1>
          <p className="text-lobby-muted">
            焚き火を囲みながら、本について語りましょう
          </p>
        </div>

        {/* User Name Card */}
        <div className="bg-lobby-card rounded-xl p-6 shadow-sm border border-lobby-border mb-6">
          <label htmlFor="userName" className="block text-sm font-medium text-lobby-text mb-2">
            ユーザー名
          </label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-2.5 bg-lobby-bg border border-lobby-border rounded-lg focus:outline-none focus:ring-2 focus:ring-lobby-accent/40 focus:border-lobby-accent text-lobby-text placeholder-lobby-muted/60"
            placeholder="お名前を入力..."
            maxLength={20}
          />
        </div>

        {/* Create Room Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!userName.trim()}
          className="w-full bg-lobby-accent hover:bg-lobby-accent-light disabled:bg-lobby-border disabled:text-lobby-muted/50 disabled:cursor-not-allowed px-4 py-3 rounded-xl font-medium transition-colors text-white shadow-sm mb-10"
        >
          新しいルームを作成
        </button>

        {/* Room List Section */}
        <div>
          <h2 className="text-lg font-semibold text-lobby-text mb-4">参加可能なルーム</h2>

          {roomError && (
            <div className="text-red-600 mb-4 text-sm bg-red-50 rounded-lg px-4 py-2 border border-red-200">
              {roomError}
            </div>
          )}

          <RoomList
            rooms={rooms}
            loading={loading}
            onRoomSelect={(room) => setSelectedRoom(room)}
            selectedRoom={selectedRoom}
            userName={userName}
          />

          {/* Room Access Controls */}
          {selectedRoom && (
            <div className="mt-4 p-5 bg-lobby-card rounded-xl border border-lobby-border shadow-sm">
              <h3 className="font-medium text-lobby-text mb-3">{selectedRoom.name}</h3>

              {selectedRoom.password_hash && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-lobby-text mb-1">
                    パスワード
                  </label>
                  <input
                    type="password"
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-lobby-bg border border-lobby-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lobby-accent/40 focus:border-lobby-accent text-lobby-text"
                    placeholder="ルームのパスワードを入力"
                  />
                </div>
              )}

              {accessError && (
                <div className="text-red-600 mb-3 text-sm">
                  {accessError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleJoinRoom}
                  disabled={accessing || !userName.trim() || (selectedRoom.password_hash && !roomPassword)}
                  className="flex-1 bg-lobby-accent hover:bg-lobby-accent-light disabled:bg-lobby-border disabled:text-lobby-muted/50 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-white"
                >
                  {accessing ? '参加中...' : 'ルームに参加'}
                </button>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="px-4 py-2.5 border border-lobby-border rounded-lg text-sm hover:bg-lobby-hover transition-colors text-lobby-muted"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Room Creation Modal */}
      {showCreateModal && (
        <RoomCreationModal
          onClose={() => setShowCreateModal(false)}
          onCreateRoom={handleCreateRoom}
        />
      )}
    </main>
  )
}
