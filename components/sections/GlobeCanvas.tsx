'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { JourneyEntry, GlobeSettings } from '@/lib/content-schema'

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })

interface Props {
  entries: JourneyEntry[]
  selectedId?: string | null
  onSelect: (entry: JourneyEntry) => void
  height?: number
  globeSettings?: GlobeSettings
}

const BG_TEXTURE = 'https://unpkg.com/three-globe/example/img/night-sky.png'
const COUNTRIES_URL = 'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'

const TEXTURE_URLS: Record<string, string> = {
  'night':       'https://unpkg.com/three-globe/example/img/earth-night.jpg',
  'day':         'https://unpkg.com/three-globe/example/img/earth-day.jpg',
  'blue-marble': 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  'dark':        'https://unpkg.com/three-globe/example/img/earth-dark.jpg',
}

const DEFAULT_SETTINGS: GlobeSettings = {
  globeTexture: 'night',
  pinColor: '#00d4aa',
  pinSelectedColor: '#00ff87',
  atmosphereColor: '#00ff87',
  strokeColor: '#00ff87',
  arcColor: '#00ff87',
}

export default function GlobeCanvas({ entries, selectedId, onSelect, height = 540, globeSettings }: Props) {
  const gs = { ...DEFAULT_SETTINGS, ...globeSettings }
  const globeRef = useRef<any>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const sizeRef = useRef({ w: 0, h: height })
  const [countries, setCountries] = useState<any[]>([])
  const [active, setActive] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 720)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    fetch(COUNTRIES_URL)
      .then(r => r.json())
      .then(data => setCountries(data.features ?? []))
      .catch(() => {})
  }, [])

  const points = useMemo(
    () => entries.map(e => ({
      ...e,
      size: selectedId === e.id ? 1.4 : 0.6,
      color: selectedId === e.id ? gs.pinSelectedColor : gs.pinColor,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, selectedId, gs.pinColor, gs.pinSelectedColor],
  )

  // Per-trip arcs: each entry with a defined origin draws its own from → to arc.
  const arcs = useMemo(() => {
    return entries
      .filter(e => typeof e.fromLat === 'number' && typeof e.fromLng === 'number')
      .map(e => ({
        startLat: e.fromLat as number,
        startLng: e.fromLng as number,
        endLat: e.lat,
        endLng: e.lng,
        id: e.id,
        label: `${e.fromPlace || 'Origin'} → ${e.place}`,
        highlight: selectedId === e.id,
      }))
  }, [entries, selectedId])

  // Autorotate, stop on hover
  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    const controls = g.controls?.()
    if (controls) {
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.45
      controls.enableZoom = true
      controls.enableDamping = true
      controls.dampingFactor = 0.08
    }
    g.pointOfView?.({ lat: 30, lng: 30, altitude: 2.2 }, 0)
  }, [])

  // Zoom to selected
  useEffect(() => {
    const g = globeRef.current
    if (!g || !selectedId) return
    const target = entries.find(e => e.id === selectedId)
    if (!target) return
    g.pointOfView?.({ lat: target.lat, lng: target.lng, altitude: 0.5 }, 1200)
    const controls = g.controls?.()
    if (controls) controls.autoRotate = false
  }, [selectedId, entries])

  // Resize observer
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      sizeRef.current = { w: rect.width, h: height }
      const g = globeRef.current
      if (g?._setSize) g._setSize(rect.width, height)
    }
    measure()
    const obs = new ResizeObserver(measure)
    obs.observe(el)
    return () => obs.disconnect()
  }, [height])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        height,
        cursor: 'grab',
        borderRadius: 18,
        overflow: 'hidden',
        background: '#000',
      }}
      onMouseDown={e => (e.currentTarget.style.cursor = 'grabbing')}
      onMouseUp={e => (e.currentTarget.style.cursor = 'grab')}
    >
      {/* Mobile tap-to-interact overlay */}
      {isMobile && !active && (
        <div
          onTouchStart={e => { e.preventDefault(); setActive(true) }}
          onClick={() => setActive(true)}
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(2px)',
            borderRadius: 18,
            cursor: 'pointer',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <circle cx="18" cy="18" r="17" stroke="rgba(0,255,135,0.35)" strokeWidth="1.5" />
            <path d="M18 10v16M10 18h16" stroke="#00ff87" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ color: '#00ff87', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Tap to interact
          </span>
          <span style={{ color: '#666', fontSize: 10, letterSpacing: '0.1em' }}>
            Scroll outside to continue
          </span>
        </div>
      )}
      <Globe
        ref={globeRef}
        width={sizeRef.current.w || undefined}
        height={height}
        backgroundColor="rgba(0,0,0,0)"
        backgroundImageUrl={BG_TEXTURE}
        globeImageUrl={TEXTURE_URLS[gs.globeTexture] ?? TEXTURE_URLS['night']}
        showAtmosphere
        atmosphereColor={gs.atmosphereColor}
        atmosphereAltitude={0.18}
        polygonsData={countries}
        polygonAltitude={0.008}
        polygonCapColor={() => hexRgba(gs.strokeColor, 0.04)}
        polygonSideColor={() => hexRgba(gs.strokeColor, 0.08)}
        polygonStrokeColor={() => hexRgba(gs.strokeColor, 0.55)}
        polygonLabel={() => ''}
        pointsData={points}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointColor={(d: any) => d.color}
        pointAltitude={(d: any) => 0.01 + d.size * 0.01}
        pointRadius={(d: any) => 0.18 + d.size * 0.12}
        pointLabel={(d: any) => `
          <div style="font-family: Inter, sans-serif; background: rgba(10,10,12,0.95); border: 1px solid ${hexRgba(gs.pinColor, 0.4)}; padding: 8px 12px; border-radius: 8px; color: #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.6);">
            <div style="font-weight: 700; font-size: 12px;">${escapeHtml(d.place)}</div>
            <div style="color: #888; font-size: 10px; margin-top: 2px;">${escapeHtml(d.country)}${d.startDate ? ' · ' + escapeHtml(d.startDate.slice(0, 4)) : ''}</div>
          </div>
        `}
        onPointClick={(d: any) => onSelect(d as JourneyEntry)}
        onPointHover={(d: any) => {
          const controls = globeRef.current?.controls?.()
          if (controls) controls.autoRotate = !d
        }}
        arcsData={arcs}
        arcLabel={(d: any) => `
          <div style="font-family: Inter, sans-serif; background: rgba(10,10,12,0.95); border: 1px solid ${hexRgba(gs.arcColor, 0.4)}; padding: 6px 10px; border-radius: 6px; color: #fff; font-size: 11px;">
            ${escapeHtml(d.label)}
          </div>
        `}
        arcColor={(d: any) => d.highlight ? hexRgba(gs.arcColor, 0.95) : hexRgba(gs.arcColor, 0.45)}
        arcStroke={(d: any) => d.highlight ? 0.8 : 0.4}
        arcAltitudeAutoScale={0.45}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={(d: any) => d.highlight ? 1800 : 4000}
        onArcClick={(d: any) => {
          const target = entries.find(e => e.id === d.id)
          if (target) onSelect(target)
        }}
        animateIn
      />
    </div>
  )
}

function escapeHtml(s: string): string {
  return (s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]!))
}

/** Convert a 6-char hex colour + alpha (0–1) → rgba() string for THREE.js/react-globe.gl */
function hexRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(0,212,170,${alpha})`
  return `rgba(${r},${g},${b},${alpha})`
}
