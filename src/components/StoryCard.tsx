'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Ad } from '@/types'

interface StoryCardProps {
  ad: Ad
  isActive: boolean
  onSwipe: (direction: 'right' | 'left' | 'up') => void
  onNext: () => void
  onPrev: () => void
  onImpression: () => void
  onViewStart: () => void
  onWatchTime: (ms: number) => void
  onComplete: () => void
  onClick: () => void
}

export function StoryCard({
  ad,
  isActive,
  onSwipe,
  onNext,
  onPrev,
  onImpression,
  onViewStart,
  onWatchTime,
  onComplete,
  onClick,
}: StoryCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [watchTimeAccumulator, setWatchTimeAccumulator] = useState(0)
  const lastTimeRef = useRef<number>(0)
  const hasStartedRef = useRef(false)
  const hasCompletedRef = useRef(false)

  // Touch handling state
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const isLongPressRef = useRef(false)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Handle video playback based on active state
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isActive) {
      video.currentTime = 0
      video.play().catch(() => {
        // Autoplay might be blocked
      })
      onImpression()
      hasStartedRef.current = false
      hasCompletedRef.current = false
      setWatchTimeAccumulator(0)
      lastTimeRef.current = Date.now()
    } else {
      video.pause()
      // Send accumulated watch time when leaving
      if (watchTimeAccumulator > 0) {
        onWatchTime(watchTimeAccumulator)
      }
    }
  }, [isActive, onImpression, onWatchTime, watchTimeAccumulator])

  // Track progress and watch time
  useEffect(() => {
    const video = videoRef.current
    if (!video || !isActive) return

    const handleTimeUpdate = () => {
      const duration = video.duration || ad.creativeDurationSeconds || 15
      const currentProgress = (video.currentTime / duration) * 100
      setProgress(currentProgress)

      // Track view start
      if (!hasStartedRef.current && video.currentTime > 0) {
        hasStartedRef.current = true
        onViewStart()
      }

      // Accumulate watch time
      const now = Date.now()
      if (!video.paused && lastTimeRef.current > 0) {
        const delta = now - lastTimeRef.current
        setWatchTimeAccumulator((prev) => prev + delta)
      }
      lastTimeRef.current = now
    }

    const handleEnded = () => {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true
        onComplete()
      }
      // Auto-advance to next
      onNext()
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [isActive, ad.creativeDurationSeconds, onViewStart, onComplete, onNext])

  // Handle visibility change (pause tracking when tab hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && watchTimeAccumulator > 0) {
        onWatchTime(watchTimeAccumulator)
        setWatchTimeAccumulator(0)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [watchTimeAccumulator, onWatchTime])

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
    isLongPressRef.current = false

    // Start long press timer for pause
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      setIsPaused(true)
      videoRef.current?.pause()
    }, 200)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Cancel long press if finger moves too much
    if (longPressTimerRef.current && touchStartRef.current) {
      const touch = e.touches[0]
      const dx = Math.abs(touch.clientX - touchStartRef.current.x)
      const dy = Math.abs(touch.clientY - touchStartRef.current.y)
      if (dx > 10 || dy > 10) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      // Resume video if was paused by long press
      if (isLongPressRef.current) {
        setIsPaused(false)
        videoRef.current?.play()
        isLongPressRef.current = false
        return
      }

      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const dx = touch.clientX - touchStartRef.current.x
      const dy = touch.clientY - touchStartRef.current.y
      const dt = Date.now() - touchStartRef.current.time

      const minSwipeDistance = 50
      const maxSwipeTime = 500

      // Check for swipe gestures
      if (dt < maxSwipeTime) {
        // Horizontal swipe (like/dislike)
        if (Math.abs(dx) > minSwipeDistance && Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) {
            onSwipe('right')
          } else {
            onSwipe('left')
          }
          touchStartRef.current = null
          return
        }

        // Vertical swipe up (skip)
        if (dy < -minSwipeDistance && Math.abs(dy) > Math.abs(dx)) {
          onSwipe('up')
          touchStartRef.current = null
          return
        }
      }

      // Tap navigation
      const screenWidth = window.innerWidth
      const tapX = touch.clientX

      if (tapX > screenWidth * 0.7) {
        // Tap right side - next
        onNext()
      } else if (tapX < screenWidth * 0.3) {
        // Tap left side - previous
        onPrev()
      }

      touchStartRef.current = null
    },
    [onSwipe, onNext, onPrev]
  )

  // Mouse handlers for desktop testing
  const handleMouseDown = useCallback(() => {
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      setIsPaused(true)
      videoRef.current?.pause()
    }, 200)
  }, [])

  const handleMouseUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    if (isLongPressRef.current) {
      setIsPaused(false)
      videoRef.current?.play()
      isLongPressRef.current = false
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="feed-item relative bg-black select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={ad.creativeVideoUrl}
        poster={ad.creativePosterUrl || undefined}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        loop={false}
        preload="auto"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 safe-top">
        <div className="flex gap-1 px-2 pt-2">
          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
            </svg>
          </div>
        </div>
      )}

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 safe-bottom">
        <div className="mb-3">
          <h2 className="text-white text-lg font-semibold drop-shadow-lg">{ad.title}</h2>
          <p className="text-white/80 text-sm drop-shadow-lg">{ad.advertiserName}</p>
        </div>

        {/* CTA Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClick()
            window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer')
          }}
          className="w-full py-3 bg-white text-black font-semibold rounded-lg active:bg-gray-200 transition"
        >
          Shop Now
        </button>
      </div>

      {/* Swipe indicators (subtle hints) */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
        <div className="text-white text-2xl">👎</div>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
        <div className="text-white text-2xl">👍</div>
      </div>
    </div>
  )
}
