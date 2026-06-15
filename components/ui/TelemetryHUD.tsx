'use client'
import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'

// Sections in document order. Labels read like an instrument-cluster channel,
// and the index doubles as a "N/total" position readout.
const SECTIONS: { id: string; label: string }[] = [
  { id: 'hero',       label: 'Intro' },
  { id: 'career',     label: 'Experience' },
  { id: 'impact',     label: 'Impact' },
  { id: 'skills',     label: 'Skills' },
  { id: 'projects',   label: 'Projects' },
  { id: 'timeline',   label: 'Timeline' },
  { id: 'trackers',   label: 'Trackers' },
  { id: 'impossible', label: 'Goals' },
  { id: 'journey',    label: 'Journey' },
  { id: 'education',  label: 'Credentials' },
  { id: 'personal',   label: 'Personal' },
  { id: 'contact',    label: 'Contact' },
]

const SEGMENTS = 14

// Green (#00ff87) → gold (#c9a84c) across the LED bar.
function segColor(t: number) {
  const r = Math.round(0 + t * 201)
  const g = Math.round(255 - t * 87)
  const b = Math.round(135 - t * 59)
  return `rgb(${r}, ${g}, ${b})`
}

export default function TelemetryHUD() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(
    scrollYProgress,
    reduce ? { duration: 0 } : { stiffness: 120, damping: 30, mass: 0.4 }
  )
  const [pct, setPct] = useState(0)
  const [active, setActive] = useState(0)

  useEffect(() => {
    return scrollYProgress.on('change', (v) => setPct(Math.round(v * 100)))
  }, [scrollYProgress])

  // Light up the channel for whichever section crosses the viewport middle.
  useEffect(() => {
    const els = SECTIONS
      .map((s, i) => ({ el: document.getElementById(s.id), i }))
      .filter((x): x is { el: HTMLElement; i: number } => !!x.el)
    if (!els.length) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const found = els.find((x) => x.el === entry.target)
            if (found) setActive(found.i)
          }
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    els.forEach((x) => io.observe(x.el))
    return () => io.disconnect()
  }, [])

  const lit = Math.round((pct / 100) * SEGMENTS)
  const current = SECTIONS[active]

  return (
    <>
      {/* Top hairline — scroll progress across the whole page */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-[60] h-0.5 origin-left"
        style={{
          scaleX,
          background: 'linear-gradient(90deg, #00ff87 0%, #00d4aa 55%, #c9a84c 100%)',
          boxShadow: '0 0 12px rgba(0,255,135,0.5)',
        }}
      />

      {/* Instrument cluster — desktop only, never intercepts clicks */}
      <div
        aria-hidden
        className="hidden lg:flex fixed bottom-6 left-6 z-[55] flex-col gap-2.5 px-4 py-3.5 rounded-2xl select-none pointer-events-none"
        style={{
          background: 'rgba(10,10,10,0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
          minWidth: '212px',
        }}
      >
        {/* Eyebrow + position readout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff87] opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00ff87]" />
            </span>
            <span className="font-mono text-[9px] tracking-[0.25em] text-[#00ff87]/80 uppercase">Telemetry</span>
          </div>
          <span className="font-mono text-[9px] tracking-wider text-[#555] tabular-nums">
            {String(active + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}
          </span>
        </div>

        {/* Active channel */}
        <div className="font-mono text-sm font-semibold tracking-wide text-white uppercase leading-none">
          {current.label}
        </div>

        {/* LED segment bar */}
        <div className="flex items-center gap-[3px]">
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const on = i < lit
            const color = segColor(i / (SEGMENTS - 1))
            return (
              <div
                key={i}
                className="h-3 flex-1 rounded-[2px] transition-all duration-300"
                style={{
                  backgroundColor: on ? color : 'rgba(255,255,255,0.07)',
                  boxShadow: on ? `0 0 6px ${color}88` : 'none',
                }}
              />
            )
          })}
        </div>

        {/* Percent readout */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] tracking-[0.2em] text-[#555] uppercase">Scroll</span>
          <span className="font-mono text-[11px] font-medium text-[#a3a3a3] tabular-nums">{pct}%</span>
        </div>
      </div>
    </>
  )
}
