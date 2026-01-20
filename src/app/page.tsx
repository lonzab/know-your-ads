'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      {/* Animated background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-indigo-900/20 to-transparent transform transition-transform duration-1000 ${
            mounted ? 'scale-150' : 'scale-100'
          }`}
        />
        <div
          className={`absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-pink-900/20 to-transparent transform transition-transform duration-1000 delay-300 ${
            mounted ? 'scale-150' : 'scale-100'
          }`}
        />
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* Logo / Brand */}
        <div
          className={`mb-8 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Know<span className="text-indigo-400">Your</span>Ads
          </h1>
          <p className="text-white/60">Discover ads you actually want to see</p>
        </div>

        {/* Phone mockup */}
        <div
          className={`mb-8 transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="relative w-48 h-96 mx-auto">
            {/* Phone frame */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] shadow-2xl border-4 border-gray-700">
              {/* Screen */}
              <div className="absolute inset-4 bg-black rounded-[2.5rem] overflow-hidden">
                {/* Simulated content */}
                <div className="h-full bg-gradient-to-b from-indigo-600 to-pink-600 flex flex-col">
                  {/* Progress bar */}
                  <div className="p-2">
                    <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-white rounded-full transition-all duration-[3000ms] ${
                          mounted ? 'w-3/4' : 'w-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Content area */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="text-3xl mb-2">👍</div>
                      <p className="text-white/80 text-xs">Swipe right to like</p>
                    </div>
                  </div>

                  {/* Bottom overlay */}
                  <div className="p-3">
                    <div className="bg-white rounded-lg py-2 px-4 text-center">
                      <span className="text-black text-xs font-semibold">Shop Now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div
          className={`mb-8 grid grid-cols-3 gap-4 text-center transition-all duration-700 delay-400 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div>
            <div className="text-2xl mb-1">👉</div>
            <p className="text-white/60 text-xs">Swipe right to like</p>
          </div>
          <div>
            <div className="text-2xl mb-1">👈</div>
            <p className="text-white/60 text-xs">Swipe left to dislike</p>
          </div>
          <div>
            <div className="text-2xl mb-1">👆</div>
            <p className="text-white/60 text-xs">Swipe up to skip</p>
          </div>
        </div>

        {/* CTA Button */}
        <div
          className={`transition-all duration-700 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Link
            href="/feed"
            className="inline-block w-full max-w-xs py-4 px-8 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold rounded-xl text-lg hover:from-indigo-500 hover:to-pink-500 transition-all active:scale-95 shadow-lg shadow-indigo-500/30"
          >
            Start Swiping
          </Link>

          <p className="mt-4 text-white/40 text-sm">No login required</p>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`absolute bottom-6 text-center transition-all duration-700 delay-700 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-white/30 text-xs">Your preferences stay on your device</p>
      </div>
    </div>
  )
}
