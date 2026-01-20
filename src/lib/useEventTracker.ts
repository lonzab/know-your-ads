'use client'

import { useCallback, useRef } from 'react'
import { EventName, EventPayload } from '@/types'

interface EventTracker {
  trackImpression: (adId: string) => void
  trackViewStart: (adId: string) => void
  trackWatchTime: (adId: string, watchTimeMs: number) => void
  trackComplete: (adId: string) => void
  trackSwipe: (adId: string, direction: 'right' | 'left' | 'up') => void
  trackClick: (adId: string, destinationUrl: string) => void
}

export function useEventTracker(sessionId: string | null): EventTracker {
  const pendingEvents = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const sendEvent = useCallback(
    async <T extends EventName>(eventName: T, adId: string, payload: EventPayload[T]) => {
      if (!sessionId) return

      try {
        await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            ad_id: adId,
            event_name: eventName,
            payload,
          }),
        })
      } catch (error) {
        console.error('Failed to track event:', error)
      }
    },
    [sessionId]
  )

  const trackImpression = useCallback(
    (adId: string) => {
      // Debounce impressions - only send after 500ms of visibility
      const key = `impression_${adId}`
      const existing = pendingEvents.current.get(key)
      if (existing) {
        clearTimeout(existing)
      }

      const timeout = setTimeout(() => {
        sendEvent('impression', adId, { visible_ms: 500 })
        pendingEvents.current.delete(key)
      }, 500)

      pendingEvents.current.set(key, timeout)
    },
    [sendEvent]
  )

  const trackViewStart = useCallback(
    (adId: string) => {
      sendEvent('view_start', adId, {} as Record<string, never>)
    },
    [sendEvent]
  )

  const trackWatchTime = useCallback(
    (adId: string, watchTimeMs: number) => {
      if (watchTimeMs > 0) {
        sendEvent('watch_time', adId, { watch_time_ms: watchTimeMs })
      }
    },
    [sendEvent]
  )

  const trackComplete = useCallback(
    (adId: string) => {
      sendEvent('complete', adId, { completed: true })
    },
    [sendEvent]
  )

  const trackSwipe = useCallback(
    (adId: string, direction: 'right' | 'left' | 'up') => {
      sendEvent('swipe', adId, { direction })
    },
    [sendEvent]
  )

  const trackClick = useCallback(
    (adId: string, destinationUrl: string) => {
      sendEvent('click', adId, { destination_url: destinationUrl })
    },
    [sendEvent]
  )

  return {
    trackImpression,
    trackViewStart,
    trackWatchTime,
    trackComplete,
    trackSwipe,
    trackClick,
  }
}
