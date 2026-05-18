'use client'
import { useState } from 'react'
import SectionShell from '@/components/admin/SectionShell'
import { Field } from '@/components/admin/Field'
import { useSection } from '@/components/admin/useContent'
import type { GlobeTexture } from '@/lib/content-schema'

/* ── Palette definitions ───────────────────────────────────────────── */
const PIN_PALETTE_A = [
  { label: 'Teal',    hex: '#00d4aa' },
  { label: 'Mint',    hex: '#00ff87' },
  { label: 'Cyan',    hex: '#22d3ee' },
  { label: 'Blue',    hex: '#4488ff' },
]
const PIN_PALETTE_B = [
  { label: 'Purple',  hex: '#a855f7' },
  { label: 'Pink',    hex: '#ec4899' },
  { label: 'Orange',  hex: '#ff6b35' },
  { label: 'Red',     hex: '#ef4444' },
]

const ATMOS_PALETTE_A = [
  { label: 'Mint',    hex: '#00ff87' },
  { label: 'Cyan',    hex: '#22d3ee' },
  { label: 'Blue',    hex: '#60a5fa' },
  { label: 'White',   hex: '#ffffff' },
]
const ATMOS_PALETTE_B = [
  { label: 'Purple',  hex: '#c084fc' },
  { label: 'Pink',    hex: '#f472b6' },
  { label: 'Orange',  hex: '#fb923c' },
  { label: 'Gold',    hex: '#fbbf24' },
]

/* ── Globe texture options ─────────────────────────────────────────── */
const TEXTURES: { id: GlobeTexture; label: string; thumb: string; url: string }[] = [
  {
    id: 'night',
    label: 'Night Earth',
    thumb: 'https://unpkg.com/three-globe/example/img/earth-night.jpg',
    url:   'https://unpkg.com/three-globe/example/img/earth-night.jpg',
  },
  {
    id: 'day',
    label: 'Day Earth',
    thumb: 'https://unpkg.com/three-globe/example/img/earth-day.jpg',
    url:   'https://unpkg.com/three-globe/example/img/earth-day.jpg',
  },
  {
    id: 'blue-marble',
    label: 'Blue Marble',
    thumb: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    url:   'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  },
  {
    id: 'dark',
    label: 'Dark Earth',
    thumb: 'https://unpkg.com/three-globe/example/img/earth-dark.jpg',
    url:   'https://unpkg.com/three-globe/example/img/earth-dark.jpg',
  },
]

/* ── Swatch picker ─────────────────────────────────────────────────── */
function ColorPalette({
  labelA, labelB, paletteA, paletteB, value, onChange,
}: {
  labelA: string
  labelB: string
  paletteA: { label: string; hex: string }[]
  paletteB: { label: string; hex: string }[]
  value: string
  onChange: (hex: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[{ name: labelA, swatches: paletteA }, { name: labelB, swatches: paletteB }].map(row => (
        <div key={row.name}>
          <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {row.name}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {row.swatches.map(s => (
              <button
                key={s.hex}
                title={s.label}
                onClick={() => onChange(s.hex)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: s.hex,
                  border: value === s.hex
                    ? '3px solid var(--admin-text)'
                    : '2px solid transparent',
                  outline: value === s.hex ? `2px solid ${s.hex}` : 'none',
                  outlineOffset: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.12s',
                  transform: value === s.hex ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: `0 2px 8px ${s.hex}55`,
                }}
              />
            ))}
            {/* Custom hex fallback if current value isn't in palette */}
            {![...paletteA, ...paletteB].find(x => x.hex === value) && (
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: value, border: '3px solid var(--admin-text)',
                outline: `2px solid ${value}`, outlineOffset: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: '#fff', fontWeight: 700,
              }}>
                ✓
              </div>
            )}
          </div>
        </div>
      ))}
      {/* Custom hex input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
        <div
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: value, border: '1px solid var(--admin-border)', flexShrink: 0,
          }}
        />
        <input
          type="text"
          className="admin-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#hex"
          style={{ width: 110, fontFamily: 'monospace', fontSize: 13 }}
        />
      </div>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────── */
export default function GlobeSettingsPage() {
  const ctrl = useSection('globeSettings')
  const [open, setOpen] = useState(false)
  const v = ctrl.value

  return (
    <SectionShell
      title="Globe Settings"
      subtitle="Customise the 3D globe appearance on the Global Journey section."
      loading={ctrl.loading}
      saving={ctrl.saving}
      dirty={ctrl.dirty}
      hasDraft={ctrl.hasDraft}
      onSave={ctrl.save}
      onReset={ctrl.reset}
      onMenu={() => setOpen(true)}
      onAfterPublish={ctrl.reload}
    >
      {v && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Globe Layout ── */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Globe Layout</div>
            <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginBottom: 16 }}>
              Choose the Earth texture displayed on the globe.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
              {TEXTURES.map(t => (
                <button
                  key={t.id}
                  onClick={() => ctrl.setValue({ ...v, globeTexture: t.id })}
                  style={{
                    border: v.globeTexture === t.id
                      ? '2px solid var(--admin-accent)'
                      : '2px solid var(--admin-border)',
                    borderRadius: 10,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'transparent',
                    padding: 0,
                    transition: 'border-color 0.15s, transform 0.15s',
                    transform: v.globeTexture === t.id ? 'scale(1.04)' : 'scale(1)',
                    outline: 'none',
                  }}
                >
                  <img
                    src={t.thumb}
                    alt={t.label}
                    style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    padding: '6px 8px',
                    fontSize: 12,
                    fontWeight: v.globeTexture === t.id ? 700 : 500,
                    color: v.globeTexture === t.id ? 'var(--admin-accent)' : 'var(--admin-text)',
                    background: 'var(--admin-surface)',
                    textAlign: 'center',
                  }}>
                    {t.label}
                    {v.globeTexture === t.id && (
                      <span style={{ marginLeft: 4 }}>✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Pin Colors ── */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Pin Colors</div>
            <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginBottom: 20 }}>
              Set colors for location pins on the globe. Each has two palettes to pick from.
            </div>
            <div className="admin-grid-2" style={{ gap: 24 }}>
              <Field label="Default Pin" hint="Color of unselected city pins.">
                <div style={{ marginTop: 8 }}>
                  <ColorPalette
                    labelA="Cool Palette"
                    labelB="Warm Palette"
                    paletteA={PIN_PALETTE_A}
                    paletteB={PIN_PALETTE_B}
                    value={v.pinColor}
                    onChange={hex => ctrl.setValue({ ...v, pinColor: hex })}
                  />
                </div>
              </Field>
              <Field label="Selected Pin" hint="Color when a pin is clicked/active.">
                <div style={{ marginTop: 8 }}>
                  <ColorPalette
                    labelA="Cool Palette"
                    labelB="Warm Palette"
                    paletteA={PIN_PALETTE_A}
                    paletteB={PIN_PALETTE_B}
                    value={v.pinSelectedColor}
                    onChange={hex => ctrl.setValue({ ...v, pinSelectedColor: hex })}
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* ── Globe Glow & Borders ── */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Globe Glow & Borders</div>
            <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginBottom: 20 }}>
              Color of the atmosphere glow, country borders, and arc routes.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Field label="Atmosphere Glow" hint="The glowing halo around the globe.">
                <div style={{ marginTop: 8 }}>
                  <ColorPalette
                    labelA="Cool Palette"
                    labelB="Warm Palette"
                    paletteA={ATMOS_PALETTE_A}
                    paletteB={ATMOS_PALETTE_B}
                    value={v.atmosphereColor}
                    onChange={hex => ctrl.setValue({ ...v, atmosphereColor: hex })}
                  />
                </div>
              </Field>
              <Field label="Country Borders" hint="Stroke color for country outline polygons.">
                <div style={{ marginTop: 8 }}>
                  <ColorPalette
                    labelA="Cool Palette"
                    labelB="Warm Palette"
                    paletteA={ATMOS_PALETTE_A}
                    paletteB={ATMOS_PALETTE_B}
                    value={v.strokeColor}
                    onChange={hex => ctrl.setValue({ ...v, strokeColor: hex })}
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* ── Route Lines ── */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Route Line Color</div>
            <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginBottom: 20 }}>
              Color of the animated arc lines drawn between origin and destination cities.
            </div>
            <ColorPalette
              labelA="Cool Palette"
              labelB="Warm Palette"
              paletteA={[
                { label: 'Mint',   hex: '#00ff87' },
                { label: 'Cyan',   hex: '#22d3ee' },
                { label: 'Blue',   hex: '#4488ff' },
                { label: 'White',  hex: '#ffffff' },
              ]}
              paletteB={[
                { label: 'Purple', hex: '#a855f7' },
                { label: 'Pink',   hex: '#f472b6' },
                { label: 'Orange', hex: '#fb923c' },
                { label: 'Gold',   hex: '#fbbf24' },
              ]}
              value={v.arcColor}
              onChange={hex => ctrl.setValue({ ...v, arcColor: hex })}
            />
          </div>

          {/* ── Live Preview ── */}
          <div className="admin-card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Current Settings Preview</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { label: 'Default Pin', color: v.pinColor },
                { label: 'Selected Pin', color: v.pinSelectedColor },
                { label: 'Atmosphere', color: v.atmosphereColor },
                { label: 'Borders', color: v.strokeColor },
                { label: 'Route Lines', color: v.arcColor },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: item.color,
                    boxShadow: `0 0 8px ${item.color}`,
                  }} />
                  <span style={{ fontSize: 12, color: 'var(--admin-muted)' }}>
                    {item.label}
                    <span style={{ marginLeft: 6, fontFamily: 'monospace', color: 'var(--admin-text)' }}>
                      {item.color}
                    </span>
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 4,
                  overflow: 'hidden', border: '1px solid var(--admin-border)',
                }}>
                  <img
                    src={TEXTURES.find(t => t.id === v.globeTexture)?.thumb}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    alt=""
                  />
                </div>
                <span style={{ fontSize: 12, color: 'var(--admin-muted)' }}>
                  Layout:
                  <span style={{ marginLeft: 6, color: 'var(--admin-text)' }}>
                    {TEXTURES.find(t => t.id === v.globeTexture)?.label}
                  </span>
                </span>
              </div>
            </div>
          </div>

        </div>
      )}
    </SectionShell>
  )
}
