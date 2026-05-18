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
        polygonCapColor={() => gs.strokeColor + '0a'}
        polygonSideColor={() => gs.strokeColor + '14'}
        polygonStrokeColor={() => gs.strokeColor + '8c'}
        polygonLabel={() => ''}
        pointsData={points}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointColor={(d: any) => d.color}
        pointAltitude={(d: any) => 0.01 + d.size * 0.01}
        pointRadius={(d: any) => 0.18 + d.size * 0.12}
        pointLabel={(d: any) => `
          <div style="font-family: Inter, sans-serif; background: rgba(10,10,12,0.95); border: 1px solid ${gs.pinColor}66; padding: 8px 12px; border-radius: 8px; color: #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.6);">
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
          <div style="font-family: Inter, sans-serif; background: rgba(10,10,12,0.95); border: 1px solid ${gs.arcColor}66; padding: 6px 10px; border-radius: 6px; color: #fff; font-size: 11px;">
            ${escapeHtml(d.label)}
          </div>
        `}
        arcColor={(d: any) => d.highlight ? gs.arcColor + 'f2' : gs.arcColor + '72'}
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
