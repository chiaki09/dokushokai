import { NextRequest, NextResponse } from 'next/server'
import { deleteRoom } from '@/lib/room-utils'
import { supabase } from '@/lib/supabase'
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const RATE_LIMIT = { maxRequests: 10, windowMs: 60 * 1000 } // 10 requests per minute

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function verifyOrigin(request: NextRequest): boolean {
  // In production, verify the request originates from our own domain
  const allowedOrigins = process.env.NEXT_PUBLIC_APP_URL
    ? [process.env.NEXT_PUBLIC_APP_URL]
    : []

  // In development or if no app URL is configured, allow all
  if (allowedOrigins.length === 0) return true

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // sendBeacon may include Origin or Referer
  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) return true
  if (referer && allowedOrigins.some(allowed => referer.startsWith(allowed))) return true

  // sendBeacon from same origin may not include Origin header in some browsers
  // Fall through to allow if neither header is present (same-origin beacon)
  if (!origin && !referer) return true

  return false
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitKey = `room-cleanup:${getRateLimitKey(request)}`
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Origin verification
  if (!verifyOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { roomId } = body

    if (!roomId || typeof roomId !== 'string') {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 })
    }

    // UUID format validation
    if (!UUID_REGEX.test(roomId)) {
      return NextResponse.json({ error: 'Invalid roomId format' }, { status: 400 })
    }

    // Wait briefly for Presence state to settle after the user disconnects.
    await delay(2000)

    // Verify the room still exists before deleting
    const { data: room } = await supabase
      .from('rooms')
      .select('id')
      .eq('id', roomId)
      .single()

    if (!room) {
      return NextResponse.json({ success: true, message: 'Room already deleted' })
    }

    const { error } = await deleteRoom(roomId)

    if (error) {
      console.error('Room cleanup failed:', error)
      return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Room cleanup error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
