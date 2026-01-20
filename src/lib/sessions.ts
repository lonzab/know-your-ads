import { Session } from '@/types'
import { sessionsStore, sessionInterestsStore } from './mockData'
import crypto from 'crypto'

export async function getOrCreateSession(
  sessionId: string,
  userAgent?: string,
  ip?: string
): Promise<Session> {
  const existing = sessionsStore.get(sessionId)
  if (existing) {
    return existing as Session
  }

  const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16) : null

  const session = {
    id: sessionId,
    createdAt: new Date(),
    userAgent: userAgent || null,
    ipHash,
  }

  sessionsStore.set(sessionId, session)
  return session as Session
}

export async function getSessionInterests(sessionId: string): Promise<Map<string, number>> {
  return sessionInterestsStore.get(sessionId) || new Map<string, number>()
}

export async function updateSessionInterest(
  sessionId: string,
  categoryTag: string,
  scoreDelta: number
): Promise<void> {
  let interests = sessionInterestsStore.get(sessionId)
  if (!interests) {
    interests = new Map<string, number>()
    sessionInterestsStore.set(sessionId, interests)
  }

  const currentScore = interests.get(categoryTag) || 0
  interests.set(categoryTag, currentScore + scoreDelta)
}

export async function updateSessionInterests(
  sessionId: string,
  categoryTags: string[],
  scoreDelta: number
): Promise<void> {
  for (const tag of categoryTags) {
    await updateSessionInterest(sessionId, tag, scoreDelta)
  }
}
