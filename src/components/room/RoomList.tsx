'use client'

import { Room } from '@/lib/supabase'

interface RoomListProps {
  rooms: Room[]
  loading: boolean
  onRoomSelect: (room: Room) => void
  selectedRoom: Room | null
  userName: string
}

export function RoomList({ rooms, loading, onRoomSelect, selectedRoom, userName }: RoomListProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lobby-accent mx-auto"></div>
        <div className="mt-3 text-lobby-muted text-sm">ルーム一覧を読み込み中...</div>
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-10 text-lobby-muted">
        <p>現在アクティブなルームはありません</p>
        <p className="text-sm mt-1">上のボタンから新しいルームを作成してください</p>
      </div>
    )
  }

  const formatTimeRemaining = (expiresAt: string): string => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return '期限切れ'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}時間${minutes}分`
    }
    return `${minutes}分`
  }

  return (
    <div className="space-y-3">
      {rooms.map((room) => {
        const isSelected = selectedRoom?.id === room.id
        const hasPassword = room.password_hash !== null
        const isExpiringSoon = new Date(room.expires_at).getTime() - Date.now() < 30 * 60 * 1000

        return (
          <div
            key={room.id}
            className={`p-4 border rounded-xl cursor-pointer transition-all ${
              isSelected
                ? 'border-lobby-accent bg-lobby-accent/5 shadow-sm'
                : 'border-lobby-border bg-lobby-card hover:border-lobby-accent-light/50 hover:shadow-sm'
            }`}
            onClick={() => userName.trim() && onRoomSelect(room)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-lobby-text">{room.name}</h3>
                  {hasPassword && (
                    <span className="text-xs bg-lobby-accent/10 px-2 py-0.5 rounded-full text-lobby-accent font-medium">
                      パスワード
                    </span>
                  )}
                </div>

                <div className="text-sm text-lobby-muted mt-1">
                  {room.room_type === 'free-participation' ? '自由参加型' : '課題本型'}
                  {room.book_title && (
                    <span className="ml-2 text-lobby-accent">{room.book_title}</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-lobby-muted/70 mt-2">
                  <span>
                    残り時間: <span className={isExpiringSoon ? 'text-orange-500' : ''}>{formatTimeRemaining(room.expires_at)}</span>
                  </span>
                  <span>
                    モード: {room.current_mode === 'impression' ? '感想タイム' : '雑談タイム'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-lobby-muted/60 text-right">
                作成: {new Date(room.created_at).toLocaleString('ja-JP', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>

            {!userName.trim() && (
              <div className="mt-2 text-xs text-lobby-muted/50">
                ユーザー名を入力してからルームを選択してください
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
