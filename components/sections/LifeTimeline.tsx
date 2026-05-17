'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Timeline, TimelineCategoryType } from '@/lib/content-schema'

const CATEGORY_CONFIG: Record<TimelineCategoryType, { color: string; label: string }> = {
  life:      { color: '#a78bfa', label: 'Life'      },
  education: { color: '#60a5fa', label: 'Education' },
  career:    { color: '#00ff87', label: 'Career'    },
  milestone: { color: '#c9a84c', label: 'Milestone' },
  personal:  { color: '#f97316', label: 'Personal'  },
  current:   { color: '#00ff87', label: 'Present'   },
}

const CARD_W = 260
const CARD_GAP = 32
const COL_W = CARD_W + CARD_GAP

function EntryCard({
  entry, active, onSelect,
}: {
  entry: Timeline
  active: boolean
  onSelect: () => void
}) {
  const cfg = CATEGORY_CONFIG[entry.category]
  return (
    <motion.div
      layout
      onClick={onSelect}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="w-full rounded-2xl border bg-[#111] overflow-hidden transition-all duration-300 cursor-pointer"
      style={{
        borderColor: active ? `${cfg.color}50` : 'rgba(255,255,255,0.06)',
        boxShadow: active ? `0 0 24px ${cfg.color}18, 0 0 0 1px ${cfg.color}20` : 'none',
      }}
    >
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${cfg.color}80, transparent)` }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-black font-mono"
              style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}
            >
              {entry.year}
            </span>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: `${cfg.color}80` }}>
              {cfg.label}
            </span>
            {entry.pinned && <Star size={10} style={{ color: '#c9a84c' }} fill="#c9a84c" />}
          </div>
        </div>
        <h3 className="font-bold text-white text-sm leading-tight mb-2">{entry.title}</h3>
        <p className="text-[#666] text-xs leading-relaxed line-clamp-3">{entry.description}</p>
      </div>
    </motion.div>
  )
}

export default function LifeTimeline({ entries }: { entries: Timeline[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const initialActive = entries[entries.length - 1]?.id ?? ''
  const [activeId, setActiveId] = useState<string>(initialActive)
  const [scrollPct, setScrollPct] = useState(0)
  const [thumbW, setThumbW] = useState(30)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const syncScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const pct = max > 0 ? el.scrollLeft / max : 0
    const visible = max > 0 ? el.clientWidth / el.scrollWidth : 1
    setScrollPct(pct * (100 - visible * 100))
    setThumbW(Math.max(visible * 100, 8))
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft < max - 8)
  }, [])

  useEffect(() => {
    syncScroll()
    window.addEventListener('resize', syncScroll, { passive: true })
    return () => window.removeEventListener('resize', syncScroll)
  }, [syncScroll, entries])

  const scrollBy = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? COL_W * 2 : -COL_W * 2, behavior: 'smooth' })
  }

  const scrollToEntry = (id: string) => {
    const el = scrollRef.current
    if (!el) return
    const idx = entries.findIndex(e => e.id === id)
    if (idx < 0) return
    const target = idx * COL_W - el.clientWidth / 2 + CARD_W / 2
    el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }

  if (!entries.length) return null

  const ABOVE_H = 200
  const BELOW_H = 200
  const CONN_H  = 36
  const DOT_H   = 16
  const YEAR_H  = 28
  const TOTAL_H = ABOVE_H + CONN_H + DOT_H + CONN_H + YEAR_H + BELOW_H

  return (
    <section id="timeline" className="py-16 sm:py-20 lg:py-24 bg-[#0d0d0d] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <p className="text-[#00ff87] text-xs tracking-[0.3em] uppercase font-mono mb-4">05 · Life Story</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">Life Timeline</h2>
            <p className="text-[#a3a3a3] text-base sm:text-lg">
              From Pollachi to Gothenburg — every chapter that shaped the engineer.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollBy('left')}
              disabled={!canScrollLeft}
              className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 disabled:opacity-20"
              style={{
                backgroundColor: canScrollLeft ? 'rgba(0,255,135,0.08)' : 'rgba(255,255,255,0.03)',
                borderColor: canScrollLeft ? 'rgba(0,255,135,0.25)' : 'rgba(255,255,255,0.06)',
                color: canScrollLeft ? '#00ff87' : '#555',
              }}
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollBy('right')}
              disabled={!canScrollRight}
              className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 disabled:opacity-20"
              style={{
                backgroundColor: canScrollRight ? 'rgba(0,255,135,0.08)' : 'rgba(255,255,255,0.03)',
                borderColor: canScrollRight ? 'rgba(0,255,135,0.25)' : 'rgba(255,255,255,0.06)',
                color: canScrollRight ? '#00ff87' : '#555',
              }}
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
            <div className="w-px h-6 bg-white/10" />
            <span className="text-[#555] text-xs font-mono">{entries.length} entries</span>
          </div>
        </motion.div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #0d0d0d, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(-90deg, #0d0d0d, transparent)' }} />

        <div
          ref={scrollRef}
          onScroll={syncScroll}
          className="overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <style>{`.timeline-scroll::-webkit-scrollbar { display: none; }`}</style>

          <div
            className="flex timeline-scroll"
            style={{ height: TOTAL_H, paddingLeft: 40, paddingRight: 40, position: 'relative' }}
          >
            <div
              style={{
                position: 'absolute',
                top: ABOVE_H + CONN_H + DOT_H / 2,
                left: 0, right: 0, height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 5%, rgba(255,255,255,0.08) 95%, transparent)',
                zIndex: 0,
              }}
            />

            {(() => {
              const idx = entries.findIndex(e => e.id === activeId)
              if (idx < 0) return null
              const cfg = CATEGORY_CONFIG[entries[idx].category]
              return (
                <motion.div
                  layoutId="active-line"
                  style={{
                    position: 'absolute',
                    top: ABOVE_H + CONN_H + DOT_H / 2,
                    left: 40 + idx * COL_W,
                    width: CARD_W,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${cfg.color}60, transparent)`,
                    boxShadow: `0 0 12px ${cfg.color}40`,
                    zIndex: 1,
                    borderRadius: 2,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )
            })()}

            {entries.map((entry, i) => {
              const cfg = CATEGORY_CONFIG[entry.category]
              const isAbove = i % 2 === 0
              const isActive = entry.id === activeId

              return (
                <div
                  key={entry.id}
                  style={{
                    flexShrink: 0,
                    width: CARD_W,
                    marginRight: i < entries.length - 1 ? CARD_GAP : 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <div style={{ height: ABOVE_H, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    {isAbove && (
                      <EntryCard
                        entry={entry}
                        active={isActive}
                        onSelect={() => { setActiveId(entry.id); scrollToEntry(entry.id) }}
                      />
                    )}
                  </div>
                  <div style={{ width: 1, height: CONN_H, background: `linear-gradient(${isAbove ? 'to bottom' : 'to top'}, ${cfg.color}50, ${cfg.color}20)` }} />
                  <motion.div
                    animate={{
                      boxShadow: isActive
                        ? `0 0 0 4px ${cfg.color}20, 0 0 16px ${cfg.color}50`
                        : `0 0 0 2px ${cfg.color}15`,
                      scale: isActive ? 1.3 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={() => { setActiveId(entry.id); scrollToEntry(entry.id) }}
                    style={{
                      width: DOT_H, height: DOT_H, borderRadius: '50%',
                      backgroundColor: cfg.color, cursor: 'pointer',
                      flexShrink: 0, position: 'relative', zIndex: 3,
                    }}
                  >
                    {entry.category === 'current' && (
                      <span className="absolute inset-0 rounded-full animate-ping"
                        style={{ backgroundColor: cfg.color, opacity: 0.3 }} />
                    )}
                  </motion.div>
                  <div style={{ width: 1, height: CONN_H, background: `linear-gradient(${isAbove ? 'to top' : 'to bottom'}, ${cfg.color}50, ${cfg.color}20)` }} />
                  <span
                    style={{
                      height: YEAR_H,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11, fontWeight: 700,
                      color: isActive ? cfg.color : '#444',
                      letterSpacing: '0.05em',
                      transition: 'color 0.3s',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {entry.year}
                  </span>
                  <div style={{ height: BELOW_H, width: '100%', display: 'flex', alignItems: 'flex-start' }}>
                    {!isAbove && (
                      <EntryCard
                        entry={entry}
                        active={isActive}
                        onSelect={() => { setActiveId(entry.id); scrollToEntry(entry.id) }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 mt-4">
          <div className="relative h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              animate={{ left: `${scrollPct}%`, width: `${thumbW}%` }}
              transition={{ type: 'tween', duration: 0.05 }}
              className="absolute top-0 h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #00ff87, #00d4aa)',
                boxShadow: '0 0 8px rgba(0,255,135,0.6)',
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            {entries.map(entry => {
              const cfg = CATEGORY_CONFIG[entry.category]
              const isActive = entry.id === activeId
              return (
                <button
                  key={entry.id}
                  onClick={() => { setActiveId(entry.id); scrollToEntry(entry.id) }}
                  title={`${entry.year} — ${entry.title}`}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: isActive ? 8 : 5,
                      height: isActive ? 8 : 5,
                      backgroundColor: isActive ? cfg.color : 'rgba(255,255,255,0.15)',
                      boxShadow: isActive ? `0 0 8px ${cfg.color}` : 'none',
                    }}
                  />
                  <span
                    className="text-[9px] font-mono transition-all duration-200 hidden sm:block"
                    style={{ color: isActive ? cfg.color : 'transparent' }}
                  >
                    {entry.year}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <AnimatePresence mode="wait">
          {entries.filter(e => e.id === activeId).map(entry => {
            const cfg = CATEGORY_CONFIG[entry.category]
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="p-6 rounded-2xl border"
                style={{ backgroundColor: `${cfg.color}06`, borderColor: `${cfg.color}20` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-black font-mono" style={{ color: cfg.color }}>
                        {entry.year}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      {entry.pinned && <Star size={13} style={{ color: '#c9a84c' }} fill="#c9a84c" />}
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">{entry.title}</h3>
                    <p className="text-[#a3a3a3] text-sm leading-relaxed max-w-2xl">{entry.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#555] font-mono">
                    <span>{entries.findIndex(e => e.id === activeId) + 1} / {entries.length}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-5">
          {(Object.entries(CATEGORY_CONFIG) as [TimelineCategoryType, { color: string; label: string }][])
            .filter(([k]) => k !== 'current')
            .map(([, cfg]) => (
              <div key={cfg.label} className="flex items-center gap-2 text-xs text-[#555]">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                {cfg.label}
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}
