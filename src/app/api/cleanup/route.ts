import { NextResponse } from 'next/server'
import { cleanupExpiredRooms } from '@/lib/room-utils'

export async function POST() {
  try {
    const { error } = await cleanupExpiredRooms()

    if (error) {
      console.error('Cleanup failed:', error)
      return NextResponse.json({
        success: false,
        message: 'Cleanup failed',
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Expired rooms cleaned up successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({
      success: false,
      message: 'Cleanup error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}