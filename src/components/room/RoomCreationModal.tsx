'use client'

import { useState } from 'react'

interface RoomCreationModalProps {
  onClose: () => void
  onCreateRoom: (
    name: string,
    roomType: 'free-participation' | 'assigned-book',
    bookTitle?: string,
    password?: string
  ) => Promise<void>
}

export function RoomCreationModal({ onClose, onCreateRoom }: RoomCreationModalProps) {
  const [roomName, setRoomName] = useState('')
  const [roomType, setRoomType] = useState<'free-participation' | 'assigned-book'>('free-participation')
  const [bookTitle, setBookTitle] = useState('')
  const [password, setPassword] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roomName.trim()) return

    setIsCreating(true)

    try {
      await onCreateRoom(
        roomName.trim(),
        roomType,
        roomType === 'assigned-book' ? bookTitle.trim() || undefined : undefined,
        password.trim() || undefined
      )
      onClose()
    } catch (error) {
      console.error('Failed to create room:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 bg-lobby-bg border border-lobby-border rounded-lg focus:outline-none focus:ring-2 focus:ring-lobby-accent/40 focus:border-lobby-accent text-lobby-text placeholder-lobby-muted/60"

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-lobby-card rounded-2xl p-6 w-full max-w-md border border-lobby-border shadow-lg">
        <h2 className="text-xl font-bold mb-6 text-lobby-text">新しいルームを作成</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Room Name */}
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-lobby-text mb-1.5">
              ルーム名 *
            </label>
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className={inputClass}
              placeholder="例: 今日の読書会"
              maxLength={50}
              required
            />
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium text-lobby-text mb-2">
              ルームタイプ
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 rounded-lg border border-lobby-border cursor-pointer hover:bg-lobby-hover transition-colors has-[:checked]:border-lobby-accent has-[:checked]:bg-lobby-accent/5">
                <input
                  type="radio"
                  name="roomType"
                  value="free-participation"
                  checked={roomType === 'free-participation'}
                  onChange={(e) => setRoomType(e.target.value as 'free-participation' | 'assigned-book')}
                  className="mr-3 accent-lobby-accent"
                />
                <div>
                  <span className="text-sm font-medium text-lobby-text">自由参加型</span>
                  <span className="text-xs text-lobby-muted ml-2">カジュアルな雰囲気</span>
                </div>
              </label>
              <label className="flex items-center p-3 rounded-lg border border-lobby-border cursor-pointer hover:bg-lobby-hover transition-colors has-[:checked]:border-lobby-accent has-[:checked]:bg-lobby-accent/5">
                <input
                  type="radio"
                  name="roomType"
                  value="assigned-book"
                  checked={roomType === 'assigned-book'}
                  onChange={(e) => setRoomType(e.target.value as 'free-participation' | 'assigned-book')}
                  className="mr-3 accent-lobby-accent"
                />
                <div>
                  <span className="text-sm font-medium text-lobby-text">課題本型</span>
                  <span className="text-xs text-lobby-muted ml-2">議論向け</span>
                </div>
              </label>
            </div>
          </div>

          {/* Book Title (for assigned-book type) */}
          {roomType === 'assigned-book' && (
            <div>
              <label htmlFor="bookTitle" className="block text-sm font-medium text-lobby-text mb-1.5">
                本のタイトル
              </label>
              <input
                id="bookTitle"
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className={inputClass}
                placeholder="例: 吾輩は猫である"
                maxLength={100}
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-lobby-text mb-1.5">
              パスワード（任意）
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="空欄の場合はパスワードなし"
              maxLength={50}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-lobby-border rounded-lg hover:bg-lobby-hover transition-colors text-lobby-muted font-medium"
              disabled={isCreating}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!roomName.trim() || isCreating}
              className="flex-1 bg-lobby-accent hover:bg-lobby-accent-light disabled:bg-lobby-border disabled:text-lobby-muted/50 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg font-medium transition-colors text-white"
            >
              {isCreating ? '作成中...' : 'ルーム作成'}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-5 text-xs text-lobby-muted/70 text-center">
          ルームは1.5時間後に自動削除されます。参加者がいなくなると即座に削除されます。
        </div>
      </div>
    </div>
  )
}
