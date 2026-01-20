import { EventName, TrackEventRequest } from '@/types'
import { getAdById } from './ads'
import { updateSessionInterests, getOrCreateSession } from './sessions'
import { eventsStore } from './mockData'

// Rate limiting store (in-memory for MVP, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 events per minute per session

export function checkRateLimit(sessionId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const key = sessionId
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true }
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count++
  return { allowed: true }
}

// Impression deduplication (30 minute window)
const impressionCache = new Map<string, number>()
const IMPRESSION_DEDUPE_WINDOW_MS = 30 * 60 * 1000

export function shouldTrackImpression(sessionId: string, adId: string): boolean {
  const key = `${sessionId}:${adId}`
  const now = Date.now()
  const lastTracked = impressionCache.get(key)

  if (lastTracked && now - lastTracked < IMPRESSION_DEDUPE_WINDOW_MS) {
    return false
  }

  impressionCache.set(key, now)
  return true
}

// Personalization weights
const SCORE_WEIGHTS = {
  swipe_right: 5,
  swipe_left: -5,
  swipe_up: 0,
  watch_75_percent: 3,
  watch_under_25_percent: -1,
  click: 10,
} as const

export async function trackEvent(
  request: TrackEventRequest,
  userAgent?: string,
  ip?: string
): Promise<{ success: boolean; error?: string }> {
  const { session_id, ad_id, event_name, payload } = request

  // Ensure session exists
  await getOrCreateSession(session_id, userAgent, ip)

  // Get ad for category tags
  const ad = await getAdById(ad_id)
  if (!ad) {
    return { success: false, error: 'Ad not found' }
  }

  // Handle impression deduplication
  if (event_name === 'impression') {
    if (!shouldTrackImpression(session_id, ad_id)) {
      return { success: true } // Silently skip duplicate
    }
  }

  // Store event in memory
  eventsStore.push({
    id: crypto.randomUUID(),
    sessionId: session_id,
    adId: ad_id,
    eventName: event_name,
    payload: payload as object,
    createdAt: new Date(),
  })

  // Update personalization scores
  await updatePersonalizationScores(session_id, ad, event_name, payload)

  return { success: true }
}

async function updatePersonalizationScores(
  sessionId: string,
  ad: { categoryTags: string[]; creativeDurationSeconds: number | null },
  eventName: EventName,
  payload: unknown
): Promise<void> {
  const { categoryTags } = ad

  switch (eventName) {
    case 'swipe': {
      const swipePayload = payload as { direction: 'right' | 'left' | 'up' }
      const direction = swipePayload.direction
      if (direction === 'right') {
        await updateSessionInterests(sessionId, categoryTags, SCORE_WEIGHTS.swipe_right)
      } else if (direction === 'left') {
        await updateSessionInterests(sessionId, categoryTags, SCORE_WEIGHTS.swipe_left)
      }
      // up = 0, no update
      break
    }

    case 'watch_time': {
      const watchPayload = payload as { watch_time_ms: number }
      const durationMs = (ad.creativeDurationSeconds || 15) * 1000
      const watchPercent = (watchPayload.watch_time_ms / durationMs) * 100

      if (watchPercent >= 75) {
        await updateSessionInterests(sessionId, categoryTags, SCORE_WEIGHTS.watch_75_percent)
      } else if (watchPercent < 25) {
        await updateSessionInterests(sessionId, categoryTags, SCORE_WEIGHTS.watch_under_25_percent)
      }
      break
    }

    case 'click': {
      await updateSessionInterests(sessionId, categoryTags, SCORE_WEIGHTS.click)
      break
    }
  }
}

export async function getEventStats(adId: string): Promise<{
  impressions: number
  viewStarts: number
  completions: number
  clicks: number
  avgWatchTimeMs: number
  swipes: { right: number; left: number; up: number }
}> {
  const events = eventsStore.filter(e => e.adId === adId)

  const stats = {
    impressions: 0,
    viewStarts: 0,
    completions: 0,
    clicks: 0,
    avgWatchTimeMs: 0,
    swipes: { right: 0, left: 0, up: 0 },
  }

  let totalWatchTimeMs = 0
  let watchTimeCount = 0

  for (const event of events) {
    switch (event.eventName) {
      case 'impression':
        stats.impressions++
        break
      case 'view_start':
        stats.viewStarts++
        break
      case 'complete':
        stats.completions++
        break
      case 'click':
        stats.clicks++
        break
      case 'watch_time': {
        const payload = event.payload as { watch_time_ms?: number }
        if (payload.watch_time_ms) {
          totalWatchTimeMs += payload.watch_time_ms
          watchTimeCount++
        }
        break
      }
      case 'swipe': {
        const payload = event.payload as { direction?: 'right' | 'left' | 'up' }
        if (payload.direction) {
          stats.swipes[payload.direction]++
        }
        break
      }
    }
  }

  stats.avgWatchTimeMs = watchTimeCount > 0 ? totalWatchTimeMs / watchTimeCount : 0

  return stats
}
