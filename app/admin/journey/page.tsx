'use client'
import { useState } from 'react'
import { Plus, Trash2, MapPin } from 'lucide-react'
import SectionShell from '@/components/admin/SectionShell'
import { Field } from '@/components/admin/Field'
import { SortableList } from '@/components/admin/Sortable'
import JourneyImageUploader from '@/components/admin/JourneyImageUploader'
import LocationSearch from '@/components/admin/LocationSearch'
import { useSection } from '@/components/admin/useContent'
import { newId } from '@/lib/admin-client'
import type { JourneyEntry } from '@/lib/content-schema'

const REGIONS = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica']

export default function JourneyAdminPage() {
  const ctrl = useSection('journey')
  const [open, setOpen] = useState(false)
  const v = ctrl.value

  function add() {
    if (!v) return
    // Default new trip's origin to the most recent destination (your current home base).
    const last = v[0]
    const item: JourneyEntry = {
      id: newId('j'),
      place: '',
      country: '',
      region: '',
      lat: 0,
      lng: 0,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      description: '',
      images: [],
      fromPlace: last?.place || '',
      fromCountry: last?.country || '',
      fromLat: last?.lat,
      fromLng: last?.lng,
    }
    ctrl.setValue([item, ...v])
  }

  function update(id: string, patch: Partial<JourneyEntry>) {
    if (!v) return
    ctrl.setValue(v.map(i => (i.id === id ? { ...i, ...patch } : i)))
  }

  function remove(id: string) {
    if (!v) return
    if (!confirm('Remove this trip and all attached images?')) return
    ctrl.setValue(v.filter(i => i.id !== id))
  }

  return (
    <SectionShell
      title="Global Journey"
      subtitle="Trips, locations, dates, and photo galleries — drag to reorder."
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
        <>
          <button onClick={add} className="admin-btn admin-btn-primary" style={{ marginBottom: 16 }}>
            <Plus size={14} /> Add trip
          </button>

          <SortableList
            items={v}
            onReorder={ctrl.setValue}
            render={(item, _i, handle) => (
              <div className="admin-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  {handle}
                  <MapPin size={14} style={{ color: 'var(--admin-accent)' }} />
                  <div style={{ flex: 1, fontWeight: 600 }}>
                    {item.place || 'Untitled trip'}
                    {item.country && (
                      <span style={{ color: 'var(--admin-muted)', fontWeight: 400, marginLeft: 6 }}>
                        · {item.country}
                      </span>
                    )}
                  </div>
                  <button onClick={() => remove(item.id)} className="admin-btn admin-btn-danger">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{
                  padding: '12px 14px', marginBottom: 14, borderRadius: 10,
                  background: 'rgba(0,255,135,0.04)', border: '1px solid rgba(0,255,135,0.18)',
                  fontSize: 12, color: 'var(--admin-muted)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <MapPin size={12} style={{ color: 'var(--admin-accent)' }} />
                  <span>
                    {item.fromPlace
                      ? <><strong style={{ color: 'var(--admin-text)' }}>{item.fromPlace}</strong>{item.fromCountry ? `, ${item.fromCountry}` : ''} → <strong style={{ color: 'var(--admin-text)' }}>{item.place || '?'}</strong>{item.country ? `, ${item.country}` : ''}</>
                      : <>No origin set — the globe arc will not be drawn for this trip.</>
                    }
                  </span>
                </div>

                <Field label="Find destination" hint="Search to auto-fill place, country, and coordinates.">
                  <LocationSearch
                    onPick={hit => update(item.id, {
                      place: hit.place,
                      country: hit.country || item.country,
                      lat: hit.lat,
                      lng: hit.lng,
                    })}
                  />
                </Field>

                <div className="admin-grid-2">
                  <Field label="Place">
                    <input className="admin-input" value={item.place} onChange={e => update(item.id, { place: e.target.value })} />
                  </Field>
                  <Field label="Country">
                    <input className="admin-input" value={item.country} onChange={e => update(item.id, { country: e.target.value })} />
                  </Field>
                  <Field label="Region (optional)">
                    <select
                      className="admin-select"
                      value={item.region ?? ''}
                      onChange={e => update(item.id, { region: e.target.value })}
                    >
                      <option value="">—</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </Field>
                  <Field label="Latitude">
                    <input
                      type="number"
                      step="any"
                      min={-90}
                      max={90}
                      className="admin-input"
                      value={item.lat}
                      onChange={e => update(item.id, { lat: parseFloat(e.target.value) || 0 })}
                    />
                  </Field>
                  <Field label="Longitude">
                    <input
                      type="number"
                      step="any"
                      min={-180}
                      max={180}
                      className="admin-input"
                      value={item.lng}
                      onChange={e => update(item.id, { lng: parseFloat(e.target.value) || 0 })}
                    />
                  </Field>
                  <Field label="Visit start">
                    <input
                      type="date"
                      className="admin-input"
                      value={item.startDate.slice(0, 10)}
                      onChange={e => update(item.id, { startDate: e.target.value })}
                    />
                  </Field>
                  <Field label="Visit end (optional)">
                    <input
                      type="date"
                      className="admin-input"
                      value={(item.endDate || '').slice(0, 10)}
                      onChange={e => update(item.id, { endDate: e.target.value })}
                    />
                  </Field>
                </div>

                <div style={{
                  marginTop: 4, padding: 16, borderRadius: 12,
                  background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)',
                }}>
                  <div style={{
                    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em',
                    color: 'var(--admin-muted)', fontWeight: 600, marginBottom: 12,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <MapPin size={11} /> Origin (where the trip started from)
                  </div>

                  <Field label="Find origin" hint="Optional. Used to draw the arc on the globe.">
                    <LocationSearch
                      onPick={hit => update(item.id, {
                        fromPlace: hit.place,
                        fromCountry: hit.country || item.fromCountry || '',
                        fromLat: hit.lat,
                        fromLng: hit.lng,
                      })}
                    />
                  </Field>

                  <div className="admin-grid-2">
                    <Field label="From place">
                      <input
                        className="admin-input"
                        value={item.fromPlace || ''}
                        onChange={e => update(item.id, { fromPlace: e.target.value })}
                        placeholder="e.g. Gothenburg"
                      />
                    </Field>
                    <Field label="From country">
                      <input
                        className="admin-input"
                        value={item.fromCountry || ''}
                        onChange={e => update(item.id, { fromCountry: e.target.value })}
                        placeholder="e.g. Sweden"
                      />
                    </Field>
                    <Field label="From latitude">
                      <input
                        type="number"
                        step="any"
                        min={-90}
                        max={90}
                        className="admin-input"
                        value={item.fromLat ?? ''}
                        onChange={e => {
                          const v = e.target.value
                          update(item.id, { fromLat: v === '' ? undefined : parseFloat(v) })
                        }}
                        placeholder="—"
                      />
                    </Field>
                    <Field label="From longitude">
                      <input
                        type="number"
                        step="any"
                        min={-180}
                        max={180}
                        className="admin-input"
                        value={item.fromLng ?? ''}
                        onChange={e => {
                          const v = e.target.value
                          update(item.id, { fromLng: v === '' ? undefined : parseFloat(v) })
                        }}
                        placeholder="—"
                      />
                    </Field>
                  </div>
                  {(item.fromPlace || item.fromLat !== undefined) && (
                    <button
                      type="button"
                      onClick={() => update(item.id, {
                        fromPlace: '', fromCountry: '', fromLat: undefined, fromLng: undefined,
                      })}
                      className="admin-btn admin-btn-ghost"
                      style={{ marginTop: 10, height: 32, fontSize: 12 }}
                    >
                      Clear origin
                    </button>
                  )}
                </div>

                <Field label="Description / notes">
                  <textarea
                    className="admin-textarea"
                    value={item.description || ''}
                    onChange={e => update(item.id, { description: e.target.value })}
                    placeholder="What happened, what you saw, what you remember…"
                  />
                </Field>

                <Field label={`Photos (${item.images.length})`}>
                  <JourneyImageUploader
                    images={item.images}
                    onChange={images => update(item.id, { images })}
                  />
                </Field>
              </div>
            )}
          />

          {v.length === 0 && (
            <div className="admin-empty">
              No trips yet. Add your first one to populate the globe.
            </div>
          )}
        </>
      )}
    </SectionShell>
  )
}
