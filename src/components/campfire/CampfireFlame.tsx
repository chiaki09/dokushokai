'use client'

import { useEffect, useRef } from 'react'

export function CampfireFlame() {
  const flameRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!flameRef.current) return

    const turbulence = flameRef.current.querySelector('#turbulence') as SVGFETurbulenceElement
    if (!turbulence) return

    let seed = 0
    let raf: number
    const animate = () => {
      seed += 0.008
      turbulence.setAttribute('seed', seed.toString())
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="relative" style={{ width: 160, height: 200 }}>
      {/* Wood logs */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1">
        <div className="flex items-end gap-0.5">
          <div className="w-20 h-4 rounded-sm transform -rotate-12" style={{ background: '#3a2a1a' }} />
          <div className="w-24 h-4 rounded-sm transform rotate-8" style={{ background: '#2e2015' }} />
          <div className="w-18 h-4 rounded-sm transform -rotate-6" style={{ background: '#352518' }} />
        </div>
      </div>

      {/* Ember bed beneath the fire */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-28 h-3">
        <div className="w-2 h-2 rounded-full absolute left-1 bottom-0 animate-pulse" style={{ background: '#c0392b', animationDuration: '1.2s' }} />
        <div className="w-1.5 h-1.5 rounded-full absolute left-5 bottom-0.5 animate-pulse" style={{ background: '#e74c3c', animationDelay: '0.3s', animationDuration: '1.5s' }} />
        <div className="w-1 h-1 rounded-full absolute left-10 bottom-0 animate-pulse" style={{ background: '#d35400', animationDelay: '0.7s', animationDuration: '1.8s' }} />
        <div className="w-2 h-1.5 rounded-full absolute right-3 bottom-0.5 animate-pulse" style={{ background: '#c0392b', animationDelay: '1s', animationDuration: '1.4s' }} />
        <div className="w-1.5 h-1.5 rounded-full absolute right-7 bottom-0 animate-pulse" style={{ background: '#e67e22', animationDelay: '0.5s', animationDuration: '2s' }} />
        <div className="w-1 h-1 rounded-full absolute left-16 bottom-0 animate-pulse" style={{ background: '#e74c3c', animationDelay: '1.2s', animationDuration: '1.6s' }} />
      </div>

      {/* Main flame SVG */}
      <svg
        ref={flameRef}
        width="160"
        height="200"
        viewBox="0 0 160 200"
        className="relative z-10"
      >
        <defs>
          {/* Turbulence for organic flame movement */}
          <filter id="flame-turbulence" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              id="turbulence"
              baseFrequency="0.8 0.35"
              numOctaves="3"
              seed="5"
              stitchTiles="stitch"
            />
            <feDisplacementMap in="SourceGraphic" scale="12" />
          </filter>

          {/* Softer turbulence for inner flame */}
          <filter id="flame-turbulence-soft" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              baseFrequency="0.6 0.3"
              numOctaves="2"
              seed="8"
              stitchTiles="stitch"
            />
            <feDisplacementMap in="SourceGraphic" scale="8" />
          </filter>

          {/* Glow filter */}
          <filter id="flame-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Outer flame: deep red to orange */}
          <linearGradient id="outerFlame" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#8b1a1a" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#c0392b" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#e74c3c" stopOpacity="0.75" />
            <stop offset="80%" stopColor="#e67e22" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f39c12" stopOpacity="0.2" />
          </linearGradient>

          {/* Middle flame: bright orange to yellow */}
          <linearGradient id="middleFlame" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#d35400" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#e67e22" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#f39c12" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f5c842" stopOpacity="0.3" />
          </linearGradient>

          {/* Inner flame: hot yellow-white core */}
          <linearGradient id="innerFlame" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#e67e22" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#f5c842" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffeaa7" stopOpacity="0.4" />
          </linearGradient>

          {/* Base ember glow */}
          <linearGradient id="baseEmber" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#6b1a1a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c0392b" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Ember base - glowing hot coals */}
        <ellipse
          cx="80" cy="178" rx="35" ry="8"
          fill="url(#baseEmber)"
          filter="url(#flame-glow)"
          className="animate-pulse"
          style={{ animationDuration: '2s' }}
        />

        {/* Outer flame body - widest, deep red */}
        <path
          d="M40 175 Q42 165 48 150 Q52 130 56 110 Q60 85 65 65 Q70 50 80 30 Q90 50 95 65 Q100 85 104 110 Q108 130 112 150 Q118 165 120 175 Q110 178 100 175 Q90 172 80 170 Q70 172 60 175 Q50 178 40 175Z"
          fill="url(#outerFlame)"
          filter="url(#flame-turbulence)"
          className="animate-flame"
        />

        {/* Secondary outer flame - offset for volume */}
        <path
          d="M50 173 Q52 160 55 145 Q58 125 62 105 Q66 85 72 65 Q76 50 80 38 Q84 50 88 65 Q94 85 98 105 Q102 125 105 145 Q108 160 110 173 Q100 176 90 173 Q85 171 80 170 Q75 171 70 173 Q60 176 50 173Z"
          fill="url(#outerFlame)"
          filter="url(#flame-turbulence)"
          className="animate-flame"
          style={{ animationDelay: '0.3s' }}
          opacity="0.7"
        />

        {/* Middle flame body - bright orange */}
        <path
          d="M52 172 Q55 160 58 145 Q62 120 66 100 Q70 80 74 62 Q77 48 80 38 Q83 48 86 62 Q90 80 94 100 Q98 120 102 145 Q105 160 108 172 Q100 174 90 172 Q85 170 80 169 Q75 170 70 172 Q60 174 52 172Z"
          fill="url(#middleFlame)"
          filter="url(#flame-turbulence)"
          className="animate-flame"
          style={{ animationDelay: '0.15s' }}
        />

        {/* Inner flame core - hot yellow */}
        <path
          d="M62 170 Q64 158 67 140 Q70 118 73 98 Q76 78 78 62 Q79 52 80 44 Q81 52 82 62 Q84 78 87 98 Q90 118 93 140 Q96 158 98 170 Q92 172 86 170 Q83 168 80 167 Q77 168 74 170 Q68 172 62 170Z"
          fill="url(#innerFlame)"
          filter="url(#flame-turbulence-soft)"
          className="animate-flame"
          style={{ animationDelay: '0.1s' }}
        />

        {/* Bright core tip */}
        <ellipse
          cx="80" cy="55" rx="6" ry="18"
          fill="url(#innerFlame)"
          filter="url(#flame-turbulence-soft)"
          className="animate-pulse"
          style={{ animationDuration: '1.5s' }}
        />

        {/* Sparks / floating embers */}
        <circle cx="68" cy="42" r="1.5" fill="#f39c12" opacity="0.7" className="animate-pulse" style={{ animationDelay: '0.2s', animationDuration: '1.8s' }} />
        <circle cx="92" cy="48" r="1" fill="#e74c3c" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0.8s', animationDuration: '2.2s' }} />
        <circle cx="75" cy="35" r="1" fill="#f5c842" opacity="0.5" className="animate-pulse" style={{ animationDelay: '1.4s', animationDuration: '1.5s' }} />
        <circle cx="88" cy="38" r="1.2" fill="#e67e22" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
      </svg>

      {/* Ambient glow is rendered in CampfireScene for correct layering */}
    </div>
  )
}
