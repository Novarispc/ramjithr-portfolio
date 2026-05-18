'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import * as THREE from 'three'
import type { JourneyEntry } from '@/lib/content-schema'

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })

interface Props {
  entries: JourneyEntry[]
  selectedId?: string | null
  onSelect: (entry: JourneyEntry) => void
  height?: number
}

const GLOBE_TEXTURE = 'https://unpkg.com/three-globe/example/img/earth-night.jpg'
const BG_TEXTURE = 'https://unpkg.com/three-globe/example/img/night-sky.png'
const COUNTRIES_URL = 'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'

// Spherical linear interpolation between two lat/lng points along great circle
function slerpLatLng(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  t: number,
): { lat: number; lng: number } {
  const toRad = (d: number) => d * Math.PI / 180
  const toDeg = (r: number) => r * 180 / Math.PI
  const φ1 = toRad(lat1), λ1 = toRad(lng1)
  const φ2 = toRad(lat2), λ2 = toRad(lng2)
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
  return {
    lat: toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))),
    lng: toDeg(Math.atan2(y, x)),
  }
}

function escapeHtml(s: string): string {
  return (s || '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  )
}

// Inject global CSS once for pin animations and tooltip
let cssReady = false
function injectPinCss() {
  if (cssReady || typeof document === 'undefined') return
  cssReady = true
  const s = document.createElement('style')
  s.textContent = `
    @keyframes gpin-pulse {
      0%   { transform: scale(1);   opacity: 0.8; }
      100% { transform: scale(4.2); opacity: 0;   }
    }
    .gpin-ring-a { animation: gpin-pulse 2.4s ease-out infinite; }
    .gpin-ring-b { animation: gpin-pulse 2.4s ease-out infinite; animation-delay: 1.0s; }
    .gpin-tip {
      opacity: 0;
      transform: translateX(-50%) translateY(-6px);
      transition: opacity 0.14s ease, transform 0.14s ease;
      pointer-events: none;
    }
    .gpin-wrap:hover .gpin-tip {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .gpin-dot { transition: transform 0.15s ease, box-shadow 0.15s ease; }
    .gpin-wrap:hover .gpin-dot { transform: scale(1.25); }
  `
  document.head.appendChild(s)
}

function buildPlaneTexture(): THREE.CanvasTexture {
  const sz = 72
  const cv = document.createElement('canvas')
  cv.width = sz; cv.height = sz
  const ctx = cv.getContext('2d')!
  // soft halo
  const grd = ctx.createRadialGradient(sz / 2, sz / 2, 3, sz / 2, sz / 2, 26)
  grd.addColorStop(0, 'rgba(255,255,255,0.22)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grd
  ctx.beginPath()
  ctx.arc(sz / 2, sz / 2, 26, 0, Math.PI * 2)
  ctx.fill()
  // airplane glyph
  ctx.font = '30px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.96)'
  ctx.fillText('✈', sz / 2, sz / 2)
  return new THREE.CanvasTexture(cv)
}

function makePinEl(
  e: JourneyEntry,
  selected: boolean,
  onClick: () => void,
  onHover: (v: boolean) => void,
): HTMLElement {
  injectPinCss()
  const sz = selected ? 13 : 8
  const col = selected ? '#ff2020' : '#ff4444'
  const glow = selected
    ? `0 0 10px ${col}, 0 0 22px ${col}66`
    : `0 0 6px ${col}, 0 0 14px ${col}44`

  const wrap = document.createElement('div')
  wrap.className = 'gpin-wrap'
  wrap.style.cssText = 'position:relative;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;'

  wrap.innerHTML = `
    <div style="position:relative;width:${sz}px;height:${sz}px;">
      <div class="gpin-ring-a" style="position:absolute;inset:-3px;border-radius:50%;border:1px solid ${col};opacity:0;"></div>
      <div class="gpin-ring-b" style="position:absolute;inset:-3px;border-radius:50%;border:1px solid ${col};opacity:0;"></div>
      <div class="gpin-dot" style="width:${sz}px;height:${sz}px;border-radius:50%;background:radial-gradient(circle at 36% 36%,#ff6666,${col});box-shadow:${glow};border:1.5px solid rgba(255,255,255,${selected ? 0.8 : 0.5});"></div>
    </div>
    <div class="gpin-tip" style="position:absolute;bottom:calc(100% + 10px);left:50%;z-index:200;">
      <div style="background:rgba(6,6,8,0.97);border:1px solid rgba(255,70,70,0.4);padding:7px 12px;border-radius:9px;white-space:nowrap;box-shadow:0 6px 20px rgba(0,0,0,0.75);">
        <div style="font-family:Inter,sans-serif;font-weight:700;font-size:12px;color:#fff;">${escapeHtml(e.place)}</div>
        <div style="font-family:Inter,sans-serif;font-size:10px;color:#888;margin-top:2px;">${escapeHtml(e.country)}${e.startDate ? ' · ' + escapeHtml(e.startDate.slice(0, 4)) : ''}</div>
      </div>
    </div>
  `

  wrap.addEventListener('click', ev => { ev.stopPropagation(); onClick() })
  wrap.addEventListener('mouseenter', () => onHover(true))
  wrap.addEventListener('mouseleave', () => onHover(false))
  return wrap
}

export default function GlobeCanvas({ entries, selectedId, onSelect, height = 540 }: Props) {
  const globeRef = useRef<any>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const sizeRef = useRef({ w: 0, h: height })
  const controlsRef = useRef<any>(null)
  const [countries, setCountries] = useState<any[]>([])

  // Airplane animation — all via refs, zero React state updates per frame
  const planeT = useRef<Map<string, number>>(new Map())
  const planeSprites = useRef<Map<string, THREE.Sprite>>(new Map())
  const planeScene = useRef<THREE.Scene | null>(null)
  const rafId = useRef<number>(0)

  useEffect(() => {
    fetch(COUNTRIES_URL)
      .then(r => r.json())
      .then(d => setCountries(d.features ?? []))
      .catch(() => {})
  }, [])

  const htmlPoints = useMemo(
    () => entries.map(e => ({ ...e, __sel: selectedId === e.id })),
    [entries, selectedId],
  )

  const arcs = useMemo(() =>
    entries
      .filter(e => typeof e.fromLat === 'number' && typeof e.fromLng === 'number')
      .map(e => ({
        startLat: e.fromLat as number,
        startLng: e.fromLng as number,
        endLat: e.lat,
        endLng: e.lng,
        id: e.id,
        label: `${e.fromPlace || 'Origin'} → ${e.place}`,
        highlight: selectedId === e.id,
      })),
    [entries, selectedId],
  )

  // Globe init — autorotate + initial view
  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    const c = g.controls?.()
    controlsRef.current = c
    if (c) {
      c.autoRotate = true
      c.autoRotateSpeed = 0.45
      c.enableZoom = true
      c.enableDamping = true
      c.dampingFactor = 0.08
    }
    g.pointOfView?.({ lat: 30, lng: 30, altitude: 2.2 }, 0)
  }, [])

  // Zoom to selected city
  useEffect(() => {
    const g = globeRef.current
    if (!g || !selectedId) return
    const target = entries.find(e => e.id === selectedId)
    if (!target) return
    g.pointOfView?.({ lat: target.lat, lng: target.lng, altitude: 0.5 }, 1200)
    if (controlsRef.current) controlsRef.current.autoRotate = false
  }, [selectedId, entries])

  // Resize observer
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      sizeRef.current = { w: rect.width, h: height }
      globeRef.current?._setSize?.(rect.width, height)
    }
    measure()
    const obs = new ResizeObserver(measure)
    obs.observe(el)
    return () => obs.disconnect()
  }, [height])

  // Airplane animation — THREE sprites, RAF loop, no React re-renders
  useEffect(() => {
    const validArcs = entries.filter(
      e => typeof e.fromLat === 'number' && typeof e.fromLng === 'number',
    )

    // Clear previous sprites
    if (planeScene.current) {
      planeSprites.current.forEach(s => planeScene.current!.remove(s))
    }
    planeSprites.current.clear()
    if (rafId.current) cancelAnimationFrame(rafId.current)

    if (!validArcs.length) return

    let initialized = false
    let texture: THREE.CanvasTexture | null = null
    const SPEED = 0.000065 // completes arc in ~15 s
    let last = performance.now()

    const tryInit = (): boolean => {
      const g = globeRef.current
      if (!g) return false
      const scene: THREE.Scene | null = g.scene?.()
      if (!scene) return false
      planeScene.current = scene
      texture = buildPlaneTexture()

      validArcs.forEach((e, i) => {
        const mat = new THREE.SpriteMaterial({
          map: texture!,
          transparent: true,
          opacity: 0.92,
          depthWrite: false,
          depthTest: false,
        })
        const sprite = new THREE.Sprite(mat)
        sprite.scale.set(4, 4, 1)
        sprite.visible = false
        sprite.renderOrder = 999
        scene.add(sprite)
        planeSprites.current.set(e.id, sprite)
        if (!planeT.current.has(e.id)) {
          planeT.current.set(e.id, i / Math.max(validArcs.length, 1))
        }
      })
      return true
    }

    const tick = (now: number) => {
      if (!initialized) initialized = tryInit()

      const g = globeRef.current
      if (initialized && g) {
        const dt = Math.min(now - last, 80)
        last = now
        validArcs.forEach(e => {
          const sprite = planeSprites.current.get(e.id)
          if (!sprite) return
          let t = (planeT.current.get(e.id) ?? 0) + SPEED * dt
          if (t >= 1) t -= 1
          planeT.current.set(e.id, t)
          const pos = slerpLatLng(e.fromLat!, e.fromLng!, e.lat, e.lng, t)
          const coords = g.getCoords?.(pos.lat, pos.lng, 0.025)
          if (coords) {
            sprite.position.set(coords.x, coords.y, coords.z)
            sprite.visible = true
          }
        })
      } else {
        last = now
      }
      rafId.current = requestAnimationFrame(tick)
    }

    rafId.current = requestAnimationFrame(tick)

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      const scene = planeScene.current ?? globeRef.current?.scene?.()
      planeSprites.current.forEach(s => {
        scene?.remove(s)
        s.material.dispose()
      })
      planeSprites.current.clear()
      texture?.dispose()
    }
  }, [entries])

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
      onMouseLeave={() => {
        if (controlsRef.current && !selectedId) controlsRef.current.autoRotate = true
      }}
    >
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
        htmlElementsData={htmlPoints}
        htmlLat={(d: any) => d.lat}
        htmlLng={(d: any) => d.lng}
        htmlAltitude={0.025}
        htmlTransitionDuration={0}
        htmlElement={(d: any) =>
          makePinEl(
            d as JourneyEntry,
            d.__sel,
            () => onSelect(d as JourneyEntry),
            (hovered: boolean) => {
              if (controlsRef.current) controlsRef.current.autoRotate = !hovered
            },
          )
        }
        arcsData={arcs}
        arcLabel={(d: any) => `
          <div style="font-family:Inter,sans-serif;background:rgba(6,6,8,0.97);border:1px solid rgba(255,70,70,0.4);padding:6px 11px;border-radius:7px;color:#fff;font-size:11px;">
            ${escapeHtml(d.label)}
          </div>
        `}
        arcColor={(d: any) => d.highlight ? 'rgba(255,160,160,0.92)' : 'rgba(255,90,90,0.28)'}
        arcStroke={(d: any) => d.highlight ? 0.7 : 0.28}
        arcAltitudeAutoScale={0.45}
        arcDashLength={0.32}
        arcDashGap={0.14}
        arcDashAnimateTime={(d: any) => d.highlight ? 1500 : 3200}
        onArcClick={(d: any) => {
          const target = entries.find(e => e.id === d.id)
          if (target) onSelect(target)
        }}
        animateIn
      />
    </div>
  )
}
