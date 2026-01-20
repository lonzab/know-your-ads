import { prisma } from './prisma'
import { Session } from '@/types'
import crypto from 'crypto'

export async function getOrCreateSession(
  sessionId: string,
  userAgent?: string,
  ip?: string
): Promise<Session> {
  const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16) : null

  const session = await prisma.session.upsert({
    where: { id: sessionId },
    update: {},
    create: {
      id: sessionId,
      userAgent: userAgent || null,
      ipHash,
    },
  })
  return session as Session
}

export async function getSessionInterests(sessionId: string): Promise<Map<string, number>> {
  const interests = await prisma.sessionInterest.findMany({
    where: { sessionId },
  })

  const map = new Map<string, number>()
  for (const interest of interests) {
    map.set(interest.categoryTag, interest.score)
  }
  return map
}

export async function updateSessionInterest(
  sessionId: string,
  categoryTag: string,
  scoreDelta: number
): Promise<void> {
  await prisma.sessionInterest.upsert({
    where: {
      sessionId_categoryTag: {
        sessionId,
        categoryTag,
      },
    },
    update: {
      score: {
        increment: scoreDelta,
      },
    },
    create: {
      sessionId,
      categoryTag,
      score: scoreDelta,
    },
  })
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
