'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { JourneyEntry } from '@/lib/content-schema'

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })

interface Props {
  entries: JourneyEntry[]
  selectedId?: string | null
  onSelect: (entry: JourneyEntry) => void
  height?: number
}

const GLOBE_TEXTURE = 'https://unpkg.com/three-globe/example/img/earth-night.jpg'
const BG_TEXTURE   = 'https://unpkg.com/three-globe/example/img/night-sky.png'
const COUNTRIES_URL = 'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'

// Great-circle spherical lerp
function slerpLatLng(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  t: number,
): { lat: number; lng: number } {
  const R = Math.PI / 180
  const D = 180 / Math.PI
  const φ1 = lat1 * R, λ1 = lng1 * R
  const φ2 = lat2 * R, λ2 = lng2 * R
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((φ2 - φ1) / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2,
  ))
  if (d < 1e-6) return { lat: lat1, lng: lng1 }
  const A = Math.sin((1 - t) * d) / Math.sin(d)
  const B = Math.sin(t * d) / Math.sin(d)
  const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2)
  const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2)
  const z = A * Math.sin(φ1) + B * Math.sin(φ2)
  return { lat: Math.atan2(z, Math.sqrt(x * x + y * y)) * D, lng: Math.atan2(y, x) * D }
}

function esc(s: string): string {
  return (s || '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  )
}

type Tip = { x: number; y: number; entry: JourneyEntry } | null

export default function GlobeCanvas({ entries, selectedId, onSelect, height = 540 }: Props) {
  const globeRef   = useRef<any>(null)
  const wrapRef    = useRef<HTMLDivElement>(null)
  const trailRef   = useRef<HTMLCanvasElement>(null)
  const sizeRef    = useRef({ w: 0, h: height })
  const ctrlRef    = useRef<any>(null)
  const mouseRef   = useRef({ x: 0, y: 0 })

  const [countries, setCountries] = useState<any[]>([])
  const [tip, setTip] = useState<Tip>(null)

  // Airplane state — all refs, zero React re-renders per frame
  const planeEls   = useRef<Map<string, HTMLDivElement>>(new Map())
  const planeT     = useRef<Map<string, number>>(new Map())
  const rafId      = useRef<number>(0)

  // ── Country borders ─────────────────────────────────────────────
  useEffect(() => {
    fetch(COUNTRIES_URL)
      .then(r => r.json())
      .then(d => setCountries(d.features ?? []))
      .catch(() => {})
  }, [])

  // ── Derived data ─────────────────────────────────────────────────
  const points = useMemo(
    () => entries.map(e => ({ ...e, __sel: selectedId === e.id })),
    [entries, selectedId],
  )

  const arcs = useMemo(() =>
    entries
      .filter(e => typeof e.fromLat === 'number' && typeof e.fromLng === 'number')
      .map(e => ({
        startLat: e.fromLat as number, startLng: e.fromLng as number,
        endLat: e.lat,                 endLng: e.lng,
        id: e.id,
        label: `${e.fromPlace || 'Origin'} → ${e.place}`,
        highlight: selectedId === e.id,
      })),
    [entries, selectedId],
  )

  // ── Globe controls init ──────────────────────────────────────────
  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    const c = g.controls?.()
    ctrlRef.current = c
    if (c) {
      c.autoRotate      = true
      c.autoRotateSpeed = 0.4
      c.enableZoom      = true
      c.enableDamping   = true
      c.dampingFactor   = 0.08
    }
    g.pointOfView?.({ lat: 30, lng: 30, altitude: 2.2 }, 0)
  }, [])

  // ── Zoom to selected city ────────────────────────────────────────
  useEffect(() => {
    const g = globeRef.current
    if (!g || !selectedId) return
    const t = entries.find(e => e.id === selectedId)
    if (!t) return
    g.pointOfView?.({ lat: t.lat, lng: t.lng, altitude: 0.5 }, 1200)
    if (ctrlRef.current) ctrlRef.current.autoRotate = false
  }, [selectedId, entries])

  // ── Resize observer ──────────────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      sizeRef.current = { w: rect.width, h: height }
      globeRef.current?._setSize?.(rect.width, height)
      const cv = trailRef.current
      if (cv) {
        cv.width  = Math.round(rect.width  * (window.devicePixelRatio || 1))
        cv.height = Math.round(height      * (window.devicePixelRatio || 1))
      }
    }
    measure()
    const obs = new ResizeObserver(measure)
    obs.observe(el)
    return () => obs.disconnect()
  }, [height])

  // ── Airplane DOM + canvas trail animation ────────────────────────
  useEffect(() => {
    const container = wrapRef.current
    if (!container) return

    const flights = entries.filter(
      e => typeof e.fromLat === 'number' && typeof e.fromLng === 'number',
    )

    // cleanup old
    planeEls.current.forEach(el => el.remove())
    planeEls.current.clear()
    cancelAnimationFrame(rafId.current)

    if (!flights.length) return

    // Build one tiny div per flight
    flights.forEach((e, i) => {
      const el = document.createElement('div')
      // Airplane SVG path — always crisp, no emoji rendering dependency
      el.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 7L2 2L4.5 7L2 12L13 7Z" fill="rgba(255,255,255,0.95)"/>
        </svg>
      `
      Object.assign(el.style, {
        position:     'absolute',
        pointerEvents:'none',
        zIndex:       '20',
        width:        '14px',
        height:       '14px',
        transform:    'translate(-50%, -50%)',
        opacity:      '0',
        willChange:   'left, top, transform',
        filter:       'drop-shadow(0 0 4px rgba(255,255,255,0.8)) drop-shadow(0 0 8px rgba(255,255,255,0.4))',
      })
      container.appendChild(el)
      planeEls.current.set(e.id, el)
      if (!planeT.current.has(e.id)) {
        planeT.current.set(e.id, i / Math.max(flights.length, 1))
      }
    })

    const SPEED = 0.000065  // full arc ≈ 15 s
    const dpr   = window.devicePixelRatio || 1
    let last    = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(now - last, 80)
      last = now
      const g  = globeRef.current
      const cv = trailRef.current
      const ctx = cv?.getContext('2d') ?? null

      // Fade existing trail each frame (destination-out = reduce alpha)
      if (ctx && cv) {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.globalAlpha = 0.045
        ctx.fillRect(0, 0, cv.width, cv.height)
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      }

      if (!g) { rafId.current = requestAnimationFrame(tick); return }

      flights.forEach(e => {
        const el = planeEls.current.get(e.id)
        if (!el) return

        let t = (planeT.current.get(e.id) ?? 0) + SPEED * dt
        if (t >= 1) t -= 1
        planeT.current.set(e.id, t)

        const pos = slerpLatLng(e.fromLat!, e.fromLng!, e.lat, e.lng, t)
        const sc  = g.getScreenCoords?.(pos.lat, pos.lng, 0.022) as { x: number; y: number } | null
        if (!sc) { el.style.opacity = '0'; return }

        // Hide when on the back of the globe
        const c3  = g.getCoords?.(pos.lat, pos.lng, 0)
        const cam = g.camera?.()
        if (c3 && cam) {
          const dot = c3.x * cam.position.x + c3.y * cam.position.y + c3.z * cam.position.z
          if (dot <= 0) { el.style.opacity = '0'; return }
        }

        // Bearing: look a tiny step ahead
        const tFwd = Math.min(t + 0.008, 0.999)
        const pFwd = slerpLatLng(e.fromLat!, e.fromLng!, e.lat, e.lng, tFwd)
        const scFwd = g.getScreenCoords?.(pFwd.lat, pFwd.lng, 0.022) as { x: number; y: number } | null
        let angle = 0
        if (scFwd) {
          angle = Math.atan2(scFwd.y - sc.y, scFwd.x - sc.x) * 180 / Math.PI
        }

        el.style.left      = `${sc.x}px`
        el.style.top       = `${sc.y}px`
        el.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`
        el.style.opacity   = '1'

        // Draw trail dot on canvas at current position
        if (ctx && cv) {
          const px = sc.x * dpr
          const py = sc.y * dpr
          const r  = 2.2 * dpr
          const g2 = ctx.createRadialGradient(px, py, 0, px, py, r)
          g2.addColorStop(0, 'rgba(255,255,255,0.55)')
          g2.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.fillStyle = g2
          ctx.beginPath()
          ctx.arc(px, py, r, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      rafId.current = requestAnimationFrame(tick)
    }

    rafId.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId.current)
      planeEls.current.forEach(el => el.remove())
      planeEls.current.clear()
    }
  }, [entries])

  return (
    <div
      ref={wrapRef}
      style={{ position: 'relative', width: '100%', height, cursor: 'grab', borderRadius: 18, overflow: 'hidden', background: '#000' }}
      onMouseDown={e  => (e.currentTarget.style.cursor = 'grabbing')}
      onMouseUp={e    => (e.currentTarget.style.cursor = 'grab')}
      onMouseMove={e  => {
        const r = wrapRef.current?.getBoundingClientRect()
        if (r) mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
      }}
      onMouseLeave={() => {
        if (ctrlRef.current && !selectedId) ctrlRef.current.autoRotate = true
        setTip(null)
      }}
    >
      {/* Trail canvas — sits above WebGL, below plane divs */}
      <canvas
        ref={trailRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 15 }}
      />

      {/* Tooltip */}
      {tip && (
        <div style={{
          position: 'absolute',
          left: tip.x,
          top:  tip.y - 54,
          transform: 'translateX(-50%)',
          zIndex: 100,
          pointerEvents: 'none',
          background: 'rgba(6,6,8,0.97)',
          border: '1px solid rgba(255,60,60,0.45)',
          padding: '7px 13px',
          borderRadius: 9,
          whiteSpace: 'nowrap',
          boxShadow: '0 6px 22px rgba(0,0,0,0.8)',
          fontFamily: 'Inter, sans-serif',
        }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: '#fff', letterSpacing: '0.01em' }}>
            {tip.entry.place}
          </div>
          <div style={{ fontSize: 10, color: '#777', marginTop: 2 }}>
            {tip.entry.country}
            {tip.entry.startDate ? ` · ${tip.entry.startDate.slice(0, 4)}` : ''}
          </div>
        </div>
      )}

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

        // Country borders
        polygonsData={countries}
        polygonAltitude={0.008}
        polygonCapColor={() => 'rgba(0,255,135,0.04)'}
        polygonSideColor={() => 'rgba(0,255,135,0.08)'}
        polygonStrokeColor={() => 'rgba(0,255,135,0.55)'}
        polygonLabel={() => ''}

        // Red minimalist pins
        pointsData={points}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointColor={(d: any) => d.__sel ? '#ff1f1f' : '#ff4444'}
        pointRadius={(d: any) => d.__sel ? 0.52 : 0.3}
        pointAltitude={0.014}
        pointLabel={() => ''}
        onPointClick={(d: any) => onSelect(d as JourneyEntry)}
        onPointHover={(d: any) => {
          if (d) {
            setTip({ x: mouseRef.current.x, y: mouseRef.current.y, entry: d as JourneyEntry })
          } else {
            setTip(null)
          }
          if (ctrlRef.current) ctrlRef.current.autoRotate = !d
        }}

        // Expanding pulse rings at each pin
        ringsData={entries}
        ringLat={(d: any) => d.lat}
        ringLng={(d: any) => d.lng}
        ringColor={() => (t: number) => `rgba(255,55,55,${(1 - t) * 0.65})`}
        ringMaxRadius={3.8}
        ringPropagationSpeed={3.2}
        ringRepeatPeriod={2400}

        // Thin glowing route arcs
        arcsData={arcs}
        arcLabel={(d: any) => `
          <div style="font-family:Inter,sans-serif;background:rgba(6,6,8,0.97);border:1px solid rgba(255,60,60,0.4);padding:6px 11px;border-radius:7px;color:#fff;font-size:11px;">
            ${esc(d.label)}
          </div>
        `}
        arcColor={(d: any) => d.highlight ? 'rgba(255,190,190,0.9)' : 'rgba(255,90,90,0.2)'}
        arcStroke={(d: any) => d.highlight ? 0.6 : 0.2}
        arcAltitudeAutoScale={0.45}
        arcDashLength={0.3}
        arcDashGap={0.1}
        arcDashAnimateTime={(d: any) => d.highlight ? 1400 : 2800}
        onArcClick={(d: any) => {
          const target = entries.find(e => e.id === d.id)
          if (target) onSelect(target)
        }}

        animateIn
      />
    </div>
  )
}
