import { NextRequest, NextResponse } from 'next/server'
import { trackEvent, checkRateLimit } from '@/lib/events'
import { TrackEventRequest, EventName } from '@/types'

const VALID_EVENT_NAMES: EventName[] = [
  'impression',
  'view_start',
  'watch_time',
  'complete',
  'swipe',
  'click',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TrackEventRequest

    // Validate required fields
    if (!body.session_id || !body.ad_id || !body.event_name) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id, ad_id, event_name' },
        { status: 400 }
      )
    }

    // Validate event name
    if (!VALID_EVENT_NAMES.includes(body.event_name)) {
      return NextResponse.json(
        { error: `Invalid event_name. Must be one of: ${VALID_EVENT_NAMES.join(', ')}` },
        { status: 400 }
      )
    }

    // Check rate limit
    const rateLimit = checkRateLimit(body.session_id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimit.retryAfter },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    // Get user agent and IP for session tracking
    const userAgent = request.headers.get('user-agent') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined

    const result = await trackEvent(body, userAgent, ip)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking event:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}
