import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredRooms } from '@/lib/room-utils'
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit'

const RATE_LIMIT = { maxRequests: 5, windowMs: 60 * 1000 } // 5 requests per minute

function verifyCronSecret(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // If not configured, allow (dev mode)
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

// POST for manual cleanup calls
export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runCleanup(request)
}

// GET for cron job invocations (e.g. Vercel Cron)
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runCleanup(request)
}

async function runCleanup(request: NextRequest) {
  const rateLimitKey = `cleanup:${getRateLimitKey(request)}`
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { error } = await cleanupExpiredRooms()

    if (error) {
      console.error('Cleanup failed:', error)
      return NextResponse.json({
        success: false,
        message: 'Cleanup failed',
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
    }, { status: 500 })
  }
}
