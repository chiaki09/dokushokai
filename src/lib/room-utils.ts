import { supabase, Room, RoomType } from './supabase'

/**
 * Hash a password for storage (browser-compatible)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password)
  return hashedPassword === hash
}

/**
 * Create a new room
 */
export async function createRoom(
  name: string,
  roomType: RoomType,
  bookTitle?: string,
  password?: string
): Promise<{ data: Room | null; error: any }> {
  const expiresAt = new Date(Date.now() + 1.5 * 60 * 60 * 1000) // 1.5 hours from now

  const roomData = {
    name,
    room_type: roomType,
    book_title: bookTitle || null,
    password_hash: password ? await hashPassword(password) : null,
    expires_at: expiresAt.toISOString(),
    current_mode: roomType === 'assigned-book' ? 'impression' as const : 'chat' as const,
  }

  console.log('Creating room with data:', JSON.stringify(roomData))

  const { data, error } = await supabase
    .from('rooms')
    .insert(roomData)
    .select()
    .single()

  if (error) {
    console.error('Supabase insert error:', JSON.stringify(error))
  }

  return { data, error }
}

/**
 * Get all active rooms
 */
export async function getActiveRooms(): Promise<{ data: Room[] | null; error: any }> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * Get a specific room by ID
 */
export async function getRoom(roomId: string): Promise<{ data: Room | null; error: any }> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .gte('expires_at', new Date().toISOString())
    .single()

  return { data, error }
}

/**
 * Update room mode (impression/chat)
 */
export async function updateRoomMode(
  roomId: string,
  mode: 'impression' | 'chat'
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('rooms')
    .update({ current_mode: mode })
    .eq('id', roomId)

  return { error }
}

/**
 * Delete a room
 */
export async function deleteRoom(roomId: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', roomId)

  return { error }
}

/**
 * Clean up expired rooms
 */
export async function cleanupExpiredRooms(): Promise<{ error: any }> {
  const { error } = await supabase
    .from('rooms')
    .delete()
    .lt('expires_at', new Date().toISOString())

  return { error }
}

/**
 * Check if a room requires a password
 */
export function roomRequiresPassword(room: Room): boolean {
  return room.password_hash !== null
}

/**
 * Verify room password
 */
export async function verifyRoomPassword(room: Room, password: string): Promise<boolean> {
  if (!room.password_hash) return true
  return await verifyPassword(password, room.password_hash)
}