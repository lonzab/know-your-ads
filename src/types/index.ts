export type AdStatus = 'draft' | 'pending' | 'active' | 'rejected'

export interface Ad {
  id: string
  title: string
  advertiserName: string
  destinationUrl: string
  categoryTags: string[]
  status: AdStatus
  creativeVideoUrl: string
  creativePosterUrl: string | null
  creativeDurationSeconds: number | null
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  createdAt: Date
  userAgent: string | null
  ipHash: string | null
}

export type EventName =
  | 'impression'
  | 'view_start'
  | 'watch_time'
  | 'complete'
  | 'swipe'
  | 'click'

export type SwipeDirection = 'right' | 'left' | 'up'

export interface EventPayload {
  impression: { visible_ms: number }
  view_start: Record<string, never>
  watch_time: { watch_time_ms: number }
  complete: { completed: boolean }
  swipe: { direction: SwipeDirection }
  click: { destination_url: string }
}

export interface TrackEventRequest {
  session_id: string
  ad_id: string
  event_name: EventName
  payload: EventPayload[EventName]
}

export interface SessionInterest {
  id: string
  sessionId: string
  categoryTag: string
  score: number
  updatedAt: Date
}

export interface CategoryScore {
  categoryTag: string
  score: number
}
