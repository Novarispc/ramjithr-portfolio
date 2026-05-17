'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, ImageOff, ArrowRight } from 'lucide-react'
import type { JourneyEntry } from '@/lib/content-schema'

interface Props {
  entry: JourneyEntry | null
  onClose: () => void
}

function formatRange(start: string, end?: string): string {
  if (!start) return ''
  const fmt = (d: string) => {
    const parts = d.split('-')
    if (parts.length < 2) return d
    try {
      const dt = new Date(d)
      return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    } catch { return d }
  }
  const a = fmt(start)
  if (!end) return a
  return `${a} → ${fmt(end)}`
}

export default function JourneyDetailModal({ entry, onClose }: Props) {
  const [idx, setIdx] = useState(0)

  useEffect(() => { setIdx(0) }, [entry?.id])

  useEffect(() => {
    if (!entry) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [entry])

  function next() {
    if (!entry) return
    setIdx(i => (entry.images.length ? (i + 1) % entry.images.length : 0))
  }
  function prev() {
    if (!entry) return
    setIdx(i => (entry.images.length ? (i - 1 + entry.images.length) % entry.images.length : 0))
  }

  return (
    <AnimatePresence>
      {entry && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(6px)',
              zIndex: 90,
            }}
          />
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            role="dialog"
            aria-label={`Trip details: ${entry.place}`}
            style={{
              position: 'fixed',
              top: 0, right: 0, bottom: 0,
              width: 'min(560px, 96vw)',
              background: '#0e0e10',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              zIndex: 91,
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: 'absolute', top: 16, right: 16,
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2,
              }}
            >
              <X size={16} />
            </button>

            <div style={{
              position: 'relative',
              height: 320,
              background: '#000',
              flexShrink: 0,
              overflow: 'hidden',
            }}>
              {entry.images.length === 0 ? (
                <div style={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 8,
                  color: '#444',
                }}>
                  <ImageOff size={32} />
                  <span style={{ fontSize: 12 }}>No photos for this trip yet</span>
                </div>
              ) : (
                <>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={entry.images[idx]?.id}
                      src={entry.images[idx]?.url}
                      alt={entry.images[idx]?.caption || entry.place}
                      loading="lazy"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      style={{
                        width: '100%', height: '100%',
                        objectFit: 'cover', display: 'block',
                      }}
                    />
                  </AnimatePresence>
                  {entry.images.length > 1 && (
                    <>
                      <button
                        onClick={prev}
                        aria-label="Previous photo"
                        style={navBtnStyle('left')}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={next}
                        aria-label="Next photo"
                        style={navBtnStyle('right')}
                      >
                        <ChevronRight size={18} />
                      </button>
                      <div style={{
                        position: 'absolute', bottom: 12, left: 0, right: 0,
                        display: 'flex', justifyContent: 'center', gap: 4,
                      }}>
                        {entry.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setIdx(i)}
                            aria-label={`Go to photo ${i + 1}`}
                            style={{
                              width: i === idx ? 16 : 6,
                              height: 6,
                              borderRadius: 3,
                              background: i === idx ? '#00ff87' : 'rgba(255,255,255,0.4)',
                              border: 'none', cursor: 'pointer',
                              transition: 'width 0.2s, background 0.2s',
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {entry.images[idx]?.caption && (
                    <div style={{
                      position: 'absolute', bottom: 28, left: 16, right: 16,
                      padding: '6px 10px', background: 'rgba(0,0,0,0.6)',
                      borderRadius: 6, color: '#fff', fontSize: 12,
                      backdropFilter: 'blur(4px)',
                    }}>
                      {entry.images[idx].caption}
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ padding: 28, overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00ff87', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
                <MapPin size={12} /> {entry.country}{entry.region ? ` · ${entry.region}` : ''}
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 12, letterSpacing: '-0.01em' }}>
                {entry.place}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a3a3a3', fontSize: 13, marginBottom: 14 }}>
                <Calendar size={13} />
                {formatRange(entry.startDate, entry.endDate)}
              </div>
              {entry.fromPlace && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px', marginBottom: 20,
                  borderRadius: 999,
                  background: 'rgba(0,255,135,0.08)',
                  border: '1px solid rgba(0,255,135,0.22)',
                  color: '#cfcfcf', fontSize: 12,
                }}>
                  <span style={{ color: '#888' }}>{entry.fromPlace}</span>
                  <ArrowRight size={12} style={{ color: '#00ff87' }} />
                  <span style={{ color: '#fff', fontWeight: 600 }}>{entry.place}</span>
                </div>
              )}
              {entry.description && (
                <p style={{ color: '#cfcfcf', fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {entry.description}
                </p>
              )}

              {entry.images.length > 1 && (
                <>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />
                  <div style={{ fontSize: 11, letterSpacing: '0.12em', color: '#666', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>
                    Gallery
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: 6,
                  }}>
                    {entry.images.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setIdx(i)}
                        style={{
                          aspectRatio: '1',
                          padding: 0,
                          border: i === idx ? '2px solid #00ff87' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 6,
                          overflow: 'hidden',
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.caption || ''}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function navBtnStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 12,
    width: 36, height: 36, borderRadius: 18,
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  } as React.CSSProperties
}
