'use client'
import { useRef } from 'react'

interface MarqueeProps {
  items: string[]
  speed?: number // seconds per full cycle
  reverse?: boolean
  className?: string
}

export default function Marquee({ items, speed = 30, reverse = false, className = '' }: MarqueeProps) {
  // Duplicate items for seamless loop
  const doubled = [...items, ...items]

  return (
    <div className={`overflow-hidden relative ${className}`}>
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee${reverse ? '-reverse' : ''} ${speed}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 mx-3 px-3 py-1.5 rounded-full text-xs font-medium border flex-shrink-0"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.08)',
              color: '#666',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: i % 5 === 0 ? '#00ff87' : i % 5 === 1 ? '#60a5fa' : i % 5 === 2 ? '#c9a84c' : i % 5 === 3 ? '#a78bfa' : '#f97316', opacity: 0.6 }}
            />
            {item}
          </span>
        ))}
      </div>

      {/* Fade masks */}
      <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #080808, transparent)' }} />
      <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(-90deg, #080808, transparent)' }} />

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
