'use client'
import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface NominatimHit {
  display_name: string
  lat: string
  lon: string
  type: string
  address?: { country?: string; state?: string }
}

interface Props {
  onPick: (hit: { lat: number; lng: number; place: string; country: string }) => void
}

export default function LocationSearch({ onPick }: Props) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<NominatimHit[]>([])
  const [loading, setLoading] = useState(false)

  async function search() {
    if (!q.trim()) return
    setLoading(true)
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
      const data = (await res.json()) as NominatimHit[]
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="admin-input"
          placeholder="Search for a place… (e.g. 'Tokyo' or 'Eiffel Tower')"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); search() } }}
        />
        <button type="button" onClick={search} className="admin-btn" disabled={loading || !q.trim()}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Search
        </button>
      </div>
      {results.length > 0 && (
        <div style={{
          marginTop: 8,
          background: 'var(--admin-surface-2)',
          border: '1px solid var(--admin-border)',
          borderRadius: 9,
          maxHeight: 240, overflowY: 'auto',
        }}>
          {results.map((r, i) => {
            const place = r.display_name.split(',')[0]?.trim() || r.display_name
            const country = r.address?.country || ''
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onPick({
                    lat: parseFloat(r.lat),
                    lng: parseFloat(r.lon),
                    place,
                    country,
                  })
                  setResults([])
                  setQ('')
                }}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 12px', background: 'transparent',
                  border: 'none', borderBottom: '1px solid var(--admin-border)',
                  color: 'var(--admin-text)', fontSize: 13, cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600 }}>{place}</div>
                <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginTop: 2 }}>
                  {r.display_name}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
