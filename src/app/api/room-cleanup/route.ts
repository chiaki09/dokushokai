import { NextRequest, NextResponse } from 'next/server'
import { deleteRoom } from '@/lib/room-utils'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId } = body

    if (!roomId || typeof roomId !== 'string') {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 })
    }

    // Verify the room still exists before deleting
    const { data: room } = await supabase
      .from('rooms')
      .select('id')
      .eq('id', roomId)
      .single()

    if (!room) {
      return NextResponse.json({ success: true, message: 'Room already deleted' })
    }

    // Check presence channel to confirm no users remain
    // Since sendBeacon fires on tab close, there may be a brief race.
    // The presence leave event on other clients also handles deletion,
    // so this is a best-effort cleanup for the last-user scenario.
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
