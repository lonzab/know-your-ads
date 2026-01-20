import { NextRequest, NextResponse } from 'next/server'
import { getActiveAds } from '@/lib/ads'
import { getPersonalizedFeed } from '@/lib/personalization'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id')

    const activeAds = await getActiveAds()

    if (!sessionId) {
      // No session - return shuffled active ads
      const shuffled = [...activeAds].sort(() => Math.random() - 0.5)
      return NextResponse.json({
        ads: shuffled,
        isExplorationMode: true,
      })
    }

    // Get personalized feed
    const feed = await getPersonalizedFeed(sessionId, activeAds)

    return NextResponse.json({
      ads: feed.ads,
      isExplorationMode: feed.isExplorationMode,
    })
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 })
  }
}
