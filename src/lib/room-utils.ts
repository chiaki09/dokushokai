import { supabase, Room, RoomType } from './supabase'

const PBKDF2_ITERATIONS = 100_000
const SALT_LENGTH = 16 // bytes
const HASH_LENGTH = 32 // bytes

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

/**
 * Hash a password using PBKDF2 with a random salt (browser-compatible).
 * Returns "salt:hash" in hex format.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    HASH_LENGTH * 8
  )

  return `${bytesToHex(salt)}:${bytesToHex(new Uint8Array(derivedBits))}`
}

/**
 * Verify a password against a stored hash.
 * Supports both new "salt:hash" format (PBKDF2) and legacy hex-only format (SHA-256).
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const encoder = new TextEncoder()

  if (storedHash.includes(':')) {
    // New PBKDF2 format: "salt:hash"
    const [saltHex, hashHex] = storedHash.split(':')
    const salt = hexToBytes(saltHex)

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    )

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      HASH_LENGTH * 8
    )

    return bytesToHex(new Uint8Array(derivedBits)) === hashHex
  }

  // Legacy SHA-256 format (no colon): fallback for existing rooms
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const legacyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return legacyHash === storedHash
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

  if (process.env.NODE_ENV === 'development') {
    console.log('Creating room with data:', JSON.stringify(roomData))
  }

  const { data, error } = await supabase
    .from('rooms')
    .insert(roomData)
    .select()
    .single()

  if (error) {
    console.error('Room creation failed:', error.message)
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