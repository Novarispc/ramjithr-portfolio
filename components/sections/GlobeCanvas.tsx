'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { JourneyEntry } from '@/lib/content-schema'

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })

/* ── Teardrop pin SVG ──────────────────────────────────────────────────────── */
function makePinEl(
  entry: JourneyEntry & { size: number; color: string; selected: boolean },
  onClick: () => void,
): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText = [
    'position:relative',
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'cursor:pointer',
    'user-select:none',
    'transform-origin:bottom center',
    `transform:scale(${entry.selected ? 1.35 : 1})`,
    'transition:transform 0.25s ease',
    'filter:drop-shadow(0 2px 6px rgba(0,0,0,0.55))',
  ].join(';')

  const pinColor = entry.selected ? '#ff4d4d' : '#ff6b35'
  const innerColor = entry.selected ? '#fff' : 'rgba(255,255,255,0.85)'

  // Teardrop SVG (same proportions as classic map pin)
  wrap.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
      <defs>
        <radialGradient id="pg_${entry.id}" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#ff9a6c"/>
          <stop offset="100%" stop-color="${pinColor}"/>
        </radialGradient>
      </defs>
      <!-- Pin body -->
      <path d="M14 0 C6.268 0 0 6.268 0 14 C0 22 14 38 14 38 C14 38 28 22 28 14 C28 6.268 21.732 0 14 0 Z"
            fill="url(#pg_${entry.id})" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
      <!-- Inner circle -->
      <circle cx="14" cy="14" r="7" fill="${innerColor}" opacity="0.9"/>
      <!-- Tiny dot centre -->
      <circle cx="14" cy="14" r="2.5" fill="${pinColor}"/>
    </svg>
    ${entry.selected ? `
    <div style="
      position:absolute;
      bottom:-5px;
      width:10px;height:10px;
      border-radius:50%;
      background:${pinColor};
      opacity:0.35;
      animation:pin-pulse 1.4s ease-out infinite;
    "></div>` : ''}
  `

  // Tooltip
  const tip = document.createElement('div')
  tip.style.cssText = [
    'position:absolute',
    'bottom:42px',
    'left:50%',
    'transform:translateX(-50%)',
    'background:rgba(10,10,12,0.95)',
    'border:1px solid rgba(255,107,53,0.5)',
    'padding:6px 10px',
    'border-radius:8px',
    'white-space:nowrap',
    'pointer-events:none',
    'opacity:0',
    'transition:opacity 0.18s',
    'z-index:10',
  ].join(';')
  tip.innerHTML = `
    <div style="font-family:Inter,sans-serif;font-weight:700;font-size:12px;color:#fff">${escapeHtml(entry.place)}</div>
    <div style="font-family:Inter,sans-serif;font-size:10px;color:#aaa;margin-top:2px">
      ${escapeHtml(entry.country)}${entry.startDate ? ' · ' + escapeHtml(entry.startDate.slice(0, 4)) : ''}
    </div>
  `
  wrap.appendChild(tip)

  wrap.addEventListener('mouseenter', () => { tip.style.opacity = '1' })
  wrap.addEventListener('mouseleave', () => { tip.style.opacity = '0' })
  wrap.addEventListener('click', onClick)

  return wrap
}

interface Props {
  entries: JourneyEntry[]
  selectedId?: string | null
  onSelect: (entry: JourneyEntry) => void
  height?: number
}

const GLOBE_TEXTURE = 'https://unpkg.com/three-globe/example/img/earth-night.jpg'
const BG_TEXTURE = 'https://unpkg.com/three-globe/example/img/night-sky.png'
const COUNTRIES_URL = 'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'

export default function GlobeCanvas({ entries, selectedId, onSelect, height = 540 }: Props) {
  const globeRef = useRef<any>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const sizeRef = useRef({ w: 0, h: height })
  const [countries, setCountries] = useState<any[]>([])

  useEffect(() => {
    fetch(COUNTRIES_URL)
      .then(r => r.json())
      .then(data => setCountries(data.features ?? []))
      .catch(() => {})
  }, [])

  const enrichedEntries = useMemo(
    () => entries.map(e => ({
      ...e,
      size: selectedId === e.id ? 1.4 : 0.6,
      color: selectedId === e.id ? '#ff4d4d' : '#ff6b35',
      selected: selectedId === e.id,
    })),
    [entries, selectedId],
  )

  const htmlElements = useMemo(
    () => enrichedEntries.map(e => ({
      lat: e.lat,
      lng: e.lng,
      altitude: e.selected ? 0.025 : 0.01,
      entry: e,
    })),
    [enrichedEntries],
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
      <style>{`
        @keyframes pin-pulse {
          0%   { transform: scale(1);   opacity: 0.35; }
          70%  { transform: scale(2.8); opacity: 0; }
          100% { transform: scale(2.8); opacity: 0; }
        }
      `}</style>
      <Globe
        ref={globeRef}
        width={sizeRef.current.w || undefined}
        height={height}
        backgroundColor="rgba(0,0,0,0)"
        backgroundImageUrl={BG_TEXTURE}
        globeImageUrl={GLOBE_TEXTURE}
        showAtmosphere
        atmosphereColor="#00ff87"
        atmosphereAltitude={0.18}
        polygonsData={countries}
        polygonAltitude={0.008}
        polygonCapColor={() => 'rgba(0,255,135,0.04)'}
        polygonSideColor={() => 'rgba(0,255,135,0.08)'}
        polygonStrokeColor={() => 'rgba(0,255,135,0.55)'}
        polygonLabel={() => ''}
        htmlElementsData={htmlElements}
        htmlLat={(d: any) => d.lat}
        htmlLng={(d: any) => d.lng}
        htmlAltitude={(d: any) => d.altitude}
        htmlElement={(d: any) => makePinEl(d.entry, () => onSelect(d.entry as JourneyEntry))}
        arcsData={arcs}
        arcLabel={(d: any) => `
          <div style="font-family: Inter, sans-serif; background: rgba(10,10,12,0.95); border: 1px solid rgba(0,255,135,0.4); padding: 6px 10px; border-radius: 6px; color: #fff; font-size: 11px;">
            ${escapeHtml(d.label)}
          </div>
        `}
        arcColor={(d: any) => d.highlight ? 'rgba(0,255,135,0.95)' : 'rgba(0,255,135,0.45)'}
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
