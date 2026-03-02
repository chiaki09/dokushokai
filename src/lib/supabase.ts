import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (typeof window !== 'undefined') {
  console.log('Supabase URL configured:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING')
  console.log('Supabase Key configured:', supabaseAnonKey ? 'SET (' + supabaseAnonKey.length + ' chars)' : 'MISSING')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

// Room types
export type RoomType = 'free-participation' | 'assigned-book'

// Room interface
export interface Room {
  id: string
  name: string
  room_type: RoomType
  book_title?: string | null
  password_hash?: string | null
  created_at: string
  expires_at: string
  current_mode: 'impression' | 'chat'
}

// User presence interface
export interface UserPresence {
  user_id: string
  user_name: string
  color: string
  position: number
  last_seen: string
}

// Chat message interface
export interface ChatMessage {
  id: string
  user_id: string
  user_name: string
  content: string
  timestamp: string
  color: string
}