import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Ramjith Radhakrishnan — Automotive Software & Test Engineer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          background: '#080808',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,255,135,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Status pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '999px',
            background: 'rgba(0,255,135,0.08)',
            border: '1px solid rgba(0,255,135,0.2)',
            marginBottom: '28px',
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff87' }} />
          <span style={{ color: '#00ff87', fontSize: '14px', letterSpacing: '0.1em' }}>
            Open to opportunities
          </span>
        </div>

        {/* Name */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
          <span style={{ color: '#ffffff', fontSize: '72px', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-2px' }}>
            RAMJITH
          </span>
          <span
            style={{
              fontSize: '72px',
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: '-2px',
              color: '#00ff87',
            }}
          >
            RADHAKRISHNAN
          </span>
        </div>

        {/* Title */}
        <p style={{ color: '#a3a3a3', fontSize: '22px', fontWeight: 300, margin: '0 0 32px 0' }}>
          Senior Automotive Software &amp; Test Engineer · Volvo Cars
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['ISO 26262', 'AUTOSAR', 'ADAS', 'EV Systems', 'Functional Safety'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(0,255,135,0.05)',
                border: '1px solid rgba(0,255,135,0.12)',
                color: 'rgba(0,255,135,0.6)',
                fontSize: '13px',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
