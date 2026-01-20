'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Ad } from '@/types'
import { useSession } from '@/lib/useSession'
import { useEventTracker } from '@/lib/useEventTracker'
import { StoryCard } from '@/components/StoryCard'

export default function FeedPage() {
  const sessionId = useSession()
  const tracker = useEventTracker(sessionId)
  const [ads, setAds] = useState<Ad[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExplorationMode, setIsExplorationMode] = useState(true)
  const watchTimeRef = useRef<Map<string, number>>(new Map())

  // Fetch personalized feed
  const fetchFeed = useCallback(async () => {
    if (!sessionId) return

    try {
      const res = await fetch(`/api/feed?session_id=${sessionId}`)
      if (!res.ok) throw new Error('Failed to fetch feed')

      const data = await res.json()
      setAds(data.ads)
      setIsExplorationMode(data.isExplorationMode)
      setError(null)
    } catch (err) {
      console.error('Error fetching feed:', err)
      setError('Failed to load ads')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (sessionId) {
      fetchFeed()
    }
  }, [sessionId, fetchFeed])

  const currentAd = ads[currentIndex]

  const goToNext = useCallback(() => {
    // Send accumulated watch time for current ad
    if (currentAd && watchTimeRef.current.has(currentAd.id)) {
      const watchTime = watchTimeRef.current.get(currentAd.id) || 0
      if (watchTime > 0) {
        tracker.trackWatchTime(currentAd.id, watchTime)
        watchTimeRef.current.delete(currentAd.id)
      }
    }

    if (currentIndex < ads.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      // Refresh feed when reaching the end
      fetchFeed()
      setCurrentIndex(0)
    }
  }, [currentIndex, ads.length, currentAd, tracker, fetchFeed])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  const handleSwipe = useCallback(
    (direction: 'right' | 'left' | 'up') => {
      if (!currentAd) return

      tracker.trackSwipe(currentAd.id, direction)

      // Visual feedback could be added here
      goToNext()

      // Refresh feed after every few swipes for personalization updates
      if (currentIndex > 0 && currentIndex % 5 === 0) {
        // Background refresh
        fetchFeed()
      }
    },
    [currentAd, tracker, goToNext, currentIndex, fetchFeed]
  )

  const handleImpression = useCallback(() => {
    if (currentAd) {
      tracker.trackImpression(currentAd.id)
    }
  }, [currentAd, tracker])

  const handleViewStart = useCallback(() => {
    if (currentAd) {
      tracker.trackViewStart(currentAd.id)
    }
  }, [currentAd, tracker])

  const handleWatchTime = useCallback((ms: number) => {
    if (currentAd) {
      const existing = watchTimeRef.current.get(currentAd.id) || 0
      watchTimeRef.current.set(currentAd.id, existing + ms)
    }
  }, [currentAd])

  const handleComplete = useCallback(() => {
    if (currentAd) {
      tracker.trackComplete(currentAd.id)
    }
  }, [currentAd, tracker])

  const handleClick = useCallback(() => {
    if (currentAd) {
      tracker.trackClick(currentAd.id, currentAd.destinationUrl)
    }
  }, [currentAd, tracker])

  if (isLoading || !sessionId) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Loading ads...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={fetchFeed}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (ads.length === 0) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white mb-2">No ads available</p>
          <p className="text-white/60 text-sm">Check back later!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      {/* Mode indicator */}
      <div className="absolute top-4 right-4 z-50 safe-top">
        <div
          className={`px-2 py-1 rounded-full text-xs ${
            isExplorationMode ? 'bg-blue-500/80' : 'bg-purple-500/80'
          } text-white`}
        >
          {isExplorationMode ? 'Exploring' : 'For You'}
        </div>
      </div>

      {/* Ad counter */}
      <div className="absolute top-4 left-4 z-50 safe-top">
        <div className="text-white/60 text-xs">
          {currentIndex + 1} / {ads.length}
        </div>
      </div>

      {/* Swipe hints (shown briefly) */}
      <SwipeHints />

      {/* Main story card */}
      {currentAd && (
        <StoryCard
          key={currentAd.id}
          ad={currentAd}
          isActive={true}
          onSwipe={handleSwipe}
          onNext={goToNext}
          onPrev={goToPrev}
          onImpression={handleImpression}
          onViewStart={handleViewStart}
          onWatchTime={handleWatchTime}
          onComplete={handleComplete}
          onClick={handleClick}
        />
      )}

      {/* Preload next ad */}
      {ads[currentIndex + 1] && (
        <link rel="preload" href={ads[currentIndex + 1].creativeVideoUrl} as="video" />
      )}
    </div>
  )
}

function SwipeHints() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const shown = localStorage.getItem('kya_hints_shown')
    if (shown) {
      setShow(false)
      return
    }

    const timer = setTimeout(() => {
      setShow(false)
      localStorage.setItem('kya_hints_shown', 'true')
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
      <div className="bg-black/70 rounded-2xl p-6 text-center animate-pulse">
        <div className="space-y-3 text-white text-sm">
          <p>👉 Swipe right = Like</p>
          <p>👈 Swipe left = Dislike</p>
          <p>👆 Swipe up = Skip</p>
          <p className="text-white/60 text-xs mt-4">Hold to pause</p>
        </div>
      </div>
    </div>
  )
}
