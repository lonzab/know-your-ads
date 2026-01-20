import { Ad } from '@/types'
import { getSessionInterests } from './sessions'
import { prisma } from './prisma'

const EXPLORATION_THRESHOLD = 5 // Number of swipes before personalization kicks in

interface PersonalizedFeed {
  ads: Ad[]
  isExplorationMode: boolean
}

export async function getPersonalizedFeed(
  sessionId: string,
  activeAds: Ad[]
): Promise<PersonalizedFeed> {
  // Get swipe count for this session
  const swipeCount = await prisma.event.count({
    where: {
      sessionId,
      eventName: 'swipe',
    },
  })

  // Get recently shown ads to apply frequency penalty
  const recentImpressions = await prisma.event.findMany({
    where: {
      sessionId,
      eventName: 'impression',
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      },
    },
    select: { adId: true },
    orderBy: { createdAt: 'desc' },
  })

  const recentAdIds = new Set(recentImpressions.map((e) => e.adId))

  // Exploration mode: return shuffled ads
  if (swipeCount < EXPLORATION_THRESHOLD) {
    const shuffled = shuffleArray([...activeAds])
    // Move recently seen ads to the end
    const prioritized = [
      ...shuffled.filter((ad) => !recentAdIds.has(ad.id)),
      ...shuffled.filter((ad) => recentAdIds.has(ad.id)),
    ]
    return { ads: prioritized, isExplorationMode: true }
  }

  // Personalization mode: score and rank ads
  const categoryScores = await getSessionInterests(sessionId)

  const scoredAds = activeAds.map((ad) => {
    // Calculate ad score based on category tags
    let score = 0
    for (const tag of ad.categoryTags) {
      score += categoryScores.get(tag) || 0
    }

    // Apply frequency penalty for recently shown ads
    if (recentAdIds.has(ad.id)) {
      score -= 50 // Strong penalty for recent ads
    }

    // Add small random factor to prevent exact same order
    score += Math.random() * 5

    return { ad, score }
  })

  // Sort by score descending
  scoredAds.sort((a, b) => b.score - a.score)

  return {
    ads: scoredAds.map((s) => s.ad),
    isExplorationMode: false,
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
