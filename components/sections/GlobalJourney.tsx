'use client'
import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Globe2, List, Filter, MapPin, Calendar, Plane, ImageIcon, ArrowRight } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import JourneyDetailModal from './JourneyDetailModal'
import type { JourneyEntry, GlobeSettings } from '@/lib/content-schema'

const GlobeCanvas = dynamic(() => import('./GlobeCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: 540, borderRadius: 18,
      background: '#000', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#444',
      fontSize: 13,
    }}>
      Loading globe…
    </div>
  ),
})

type ViewMode = 'globe' | 'timeline'

function useIsMobile(breakpoint = 720) {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < breakpoint)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])
  return mobile
}

export default function GlobalJourney({ journey, globeSettings }: { journey: JourneyEntry[]; globeSettings?: GlobeSettings }) {
  const [selected, setSelected] = useState<JourneyEntry | null>(null)
  const isMobile = useIsMobile()
  const [view, setView] = useState<ViewMode>('globe')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [countryFilter, setCountryFilter] = useState<string>('all')

  useEffect(() => {
    if (isMobile && view === 'globe') setView('timeline')
  }, [isMobile])

  const years = useMemo(() => {
    const set = new Set<string>()
    journey.forEach(j => { if (j.startDate) set.add(j.startDate.slice(0, 4)) })
    return Array.from(set).sort()
  }, [journey])

  const countries = useMemo(() => {
    const set = new Set<string>()
    journey.forEach(j => { if (j.country) set.add(j.country) })
    return Array.from(set).sort()
  }, [journey])

  const filtered = useMemo(() => {
    return journey.filter(j => {
      if (yearFilter !== 'all' && !j.startDate.startsWith(yearFilter)) return false
      if (countryFilter !== 'all' && j.country !== countryFilter) return false
      return true
    })
  }, [journey, yearFilter, countryFilter])

  const stats = useMemo(() => {
    const set = new Set(journey.map(j => j.country))
    const photos = journey.reduce((a, j) => a + j.images.length, 0)
    return { trips: journey.length, countries: set.size, photos }
  }, [journey])

  if (!journey.length) return null

  return (
    <section id="journey" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="mb-8 sm:mb-10 lg:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 sm:gap-6">
            <div>
              <p className="text-[#00ff87] text-xs tracking-[0.3em] uppercase font-mono mb-3 sm:mb-4">08 · Journey</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">Global Journey</h2>
              <p className="text-[#a3a3a3] text-base sm:text-lg max-w-xl">
                Every place left a mark. Spin the globe, click a pin, see the trip.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <StatTile icon={<Plane size={13} />} value={stats.trips} label="Trips" />
              <StatTile icon={<MapPin size={13} />} value={stats.countries} label="Countries" />
              <StatTile icon={<ImageIcon size={13} />} value={stats.photos} label="Photos" />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="flex flex-wrap items-center gap-3 mb-4 sm:mb-5">
            <div
              className="inline-flex rounded-[10px] p-[3px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <ToggleBtn active={view === 'globe'} onClick={() => setView('globe')} disabled={isMobile}>
                <Globe2 size={13} /> Globe
              </ToggleBtn>
              <ToggleBtn active={view === 'timeline'} onClick={() => setView('timeline')}>
                <List size={13} /> Timeline
              </ToggleBtn>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs text-[#888] w-full sm:w-auto sm:flex-1">
              <Filter size={12} className="text-[#666]" />
              <FilterSelect value={yearFilter} onChange={setYearFilter} options={[['all', 'All years'], ...years.map(y => [y, y] as [string, string])]} />
              <FilterSelect value={countryFilter} onChange={setCountryFilter} options={[['all', 'All countries'], ...countries.map(c => [c, c] as [string, string])]} />
              {(yearFilter !== 'all' || countryFilter !== 'all') && (
                <button
                  onClick={() => { setYearFilter('all'); setCountryFilter('all') }}
                  className="text-[#00ff87] text-xs px-2 py-1 bg-transparent border-none cursor-pointer"
                >
                  Reset
                </button>
              )}
              <span className="text-[#555] text-[11px] sm:ml-auto whitespace-nowrap">
                {filtered.length}/{journey.length}
              </span>
            </div>
          </div>
        </ScrollReveal>

        <div style={{ position: 'relative' }}>
          {view === 'globe' && !isMobile ? (
            <GlobeCanvas
              entries={filtered}
              selectedId={selected?.id}
              onSelect={entry => setSelected(entry)}
              height={560}
              globeSettings={globeSettings}
            />
          ) : (
            <TimelineList entries={filtered} onSelect={entry => setSelected(entry)} />
          )}
        </div>
      </div>

      <JourneyDetailModal entry={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div
      className="flex items-center gap-2 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-[10px]"
      style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.18)' }}
    >
      <span style={{ color: '#00ff87' }}>{icon}</span>
      <div>
        <div className="text-white font-bold text-sm sm:text-base leading-none">{value}</div>
        <div className="text-[#888] text-[9px] sm:text-[10px] uppercase tracking-[0.1em] mt-0.5">{label}</div>
      </div>
    </div>
  )
}

function ToggleBtn({ active, onClick, disabled, children }: {
  active: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 8,
        background: active ? 'rgba(0,255,135,0.15)' : 'transparent',
        border: 'none',
        color: active ? '#00ff87' : '#888',
        fontSize: 12, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function FilterSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: [string, string][]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#cfcfcf',
        borderRadius: 8,
        padding: '6px 10px',
        fontSize: 12,
        outline: 'none',
        fontFamily: 'inherit',
      }}
    >
      {options.map(([v, l]) => (
        <option key={v} value={v} style={{ background: '#111' }}>{l}</option>
      ))}
    </select>
  )
}

function TimelineList({ entries, onSelect }: {
  entries: JourneyEntry[]; onSelect: (e: JourneyEntry) => void
}) {
  if (!entries.length) {
    return (
      <div style={{
        padding: 48, textAlign: 'center', color: '#555',
        border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 14,
      }}>
        No trips match these filters.
      </div>
    )
  }
  const sorted = [...entries].sort((a, b) => b.startDate.localeCompare(a.startDate))
  return (
    <div
      className="grid gap-3 sm:gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}
    >
      {sorted.map((e, i) => (
        <motion.button
          key={e.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.04 }}
          whileHover={{ y: -4 }}
          onClick={() => onSelect(e)}
          style={{
            textAlign: 'left',
            padding: 0,
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.06)',
            background: '#111',
            cursor: 'pointer',
            overflow: 'hidden',
            color: 'inherit',
            fontFamily: 'inherit',
          }}
        >
          <div style={{
            height: 140,
            background: e.images[0]?.url
              ? `url(${e.images[0].url}) center/cover`
              : 'linear-gradient(135deg, #1a1a1f, #0d0d0d)',
            position: 'relative',
          }}>
            {!e.images[0] && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#333',
              }}>
                <MapPin size={32} />
              </div>
            )}
            <div style={{
              position: 'absolute', top: 10, left: 10,
              padding: '4px 8px', borderRadius: 6,
              background: 'rgba(0,0,0,0.65)',
              color: '#00ff87', fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700, letterSpacing: '0.08em',
            }}>
              {e.startDate.slice(0, 4)}
            </div>
            {e.images.length > 0 && (
              <div style={{
                position: 'absolute', bottom: 10, right: 10,
                padding: '3px 7px', borderRadius: 5,
                background: 'rgba(0,0,0,0.7)',
                color: '#fff', fontSize: 10,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <ImageIcon size={10} /> {e.images.length}
              </div>
            )}
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginBottom: 2 }}>
              {e.place}
            </div>
            <div style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={11} /> {e.country}
              <span style={{ color: '#333' }}>·</span>
              <Calendar size={11} /> {formatYearMonth(e.startDate)}
            </div>
            {e.fromPlace && (
              <div style={{
                marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11, color: '#777',
              }}>
                <span>{e.fromPlace}</span>
                <ArrowRight size={10} style={{ color: '#00ff87' }} />
                <span style={{ color: '#bbb' }}>{e.place}</span>
              </div>
            )}
            {e.description && (
              <div style={{
                marginTop: 10, color: '#9a9a9a', fontSize: 13,
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as any,
                overflow: 'hidden',
              }}>
                {e.description}
              </div>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  )
}

function formatYearMonth(d: string): string {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
  } catch { return d }
}
