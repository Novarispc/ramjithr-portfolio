'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Mail, FileText, ChevronRight, Zap } from 'lucide-react'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import Marquee from '@/components/ui/Marquee'
import type { Personal, Stat } from '@/lib/content-schema'

// ─── Animated dot grid background ───────────────────────────────
function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotgrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.07)" />
          </pattern>
          <radialGradient id="fade" cx="50%" cy="50%" r="60%">
            <stop offset="0%"   stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="dotmask">
            <rect width="100%" height="100%" fill="url(#fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" mask="url(#dotmask)" />
      </svg>
    </div>
  )
}

// ─── ECU Network visualization ───────────────────────────────────
function ECUVisualization() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer glow ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[380px] h-[380px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,135,0.06) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
      </div>

      <svg
        viewBox="0 0 500 500"
        className="w-full h-full max-w-[500px]"
        style={{ filter: 'drop-shadow(0 0 24px rgba(0,255,135,0.12))' }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,255,135,0.04)" strokeWidth="0.5"/>
          </pattern>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="softglow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(0,255,135,0.3)"/>
            <stop offset="100%" stopColor="rgba(0,255,135,0.05)"/>
          </radialGradient>
        </defs>

        <rect width="500" height="500" fill="url(#grid)" />

        {/* Orbit rings */}
        <circle cx="250" cy="250" r="130" fill="none" stroke="rgba(0,255,135,0.06)" strokeWidth="1" strokeDasharray="3 6" >
          <animateTransform attributeName="transform" type="rotate" from="0 250 250" to="360 250 250" dur="20s" repeatCount="indefinite"/>
        </circle>
        <circle cx="250" cy="250" r="90" fill="none" stroke="rgba(0,255,135,0.08)" strokeWidth="1" strokeDasharray="6 4">
          <animateTransform attributeName="transform" type="rotate" from="360 250 250" to="0 250 250" dur="14s" repeatCount="indefinite"/>
        </circle>

        {/* Central ECU core */}
        <g filter="url(#softglow)">
          <circle cx="250" cy="250" r="48" fill="url(#coreGrad)" stroke="#00ff87" strokeWidth="1.5"/>
          <circle cx="250" cy="250" r="32" fill="rgba(0,255,135,0.1)" stroke="rgba(0,255,135,0.4)" strokeWidth="0.8"/>
        </g>
        <circle cx="250" cy="250" r="6" fill="#00ff87">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite"/>
        </circle>
        <text x="250" y="278" textAnchor="middle" fill="#00ff87" fontSize="8" fontFamily="JetBrains Mono, monospace" opacity="0.7" fontWeight="bold">ECU CORE</text>

        {/* Satellite nodes */}
        {[
          { cx: 128, cy: 128, label: 'ADAS',     labelY: 162, delay: '0s'   },
          { cx: 372, cy: 128, label: 'AUTOSAR',  labelY: 162, delay: '0.5s' },
          { cx: 96,  cy: 280, label: 'CAN/LIN',  labelY: 314, delay: '1s'   },
          { cx: 404, cy: 280, label: 'ISO26262', labelY: 314, delay: '1.5s' },
          { cx: 178, cy: 408, label: 'HIL/SIL',  labelY: 440, delay: '2s'   },
          { cx: 322, cy: 408, label: 'Ethernet', labelY: 440, delay: '2.5s' },
          { cx: 250, cy: 76,  label: 'EV Sys',   labelY: 60,  delay: '0.8s' },
        ].map((node, i) => (
          <g key={i} filter="url(#glow)">
            <line x1="250" y1="250" x2={node.cx} y2={node.cy}
              stroke="rgba(0,255,135,0.15)" strokeWidth="0.7" strokeDasharray="3 5">
              <animate attributeName="stroke-dashoffset" values="0;-16" dur="2s" repeatCount="indefinite"/>
            </line>
            <circle cx={node.cx} cy={node.cy} r="24" fill="rgba(0,255,135,0.05)" stroke="rgba(0,255,135,0.3)" strokeWidth="1">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" begin={node.delay} repeatCount="indefinite"/>
            </circle>
            <circle cx={node.cx} cy={node.cy} r="4" fill="#00ff87" opacity="0.9"/>
            <text x={node.cx} y={node.labelY} textAnchor="middle" fill="rgba(0,255,135,0.55)"
              fontSize="8" fontFamily="JetBrains Mono, monospace">{node.label}</text>
          </g>
        ))}

        {/* Animated data packets */}
        {[
          { path: 'M250,250 L128,128', dur: '2.8s', begin: '0s'   },
          { path: 'M250,250 L372,128', dur: '3.2s', begin: '0.6s' },
          { path: 'M250,250 L322,408', dur: '3.6s', begin: '1.2s' },
          { path: 'M250,250 L96,280',  dur: '2.4s', begin: '1.8s' },
        ].map((p, i) => (
          <circle key={i} r="3" fill="#00ff87" opacity="0.85">
            <animateMotion dur={p.dur} begin={p.begin} repeatCount="indefinite">
              <mpath href={`#pkt${i}`}/>
            </animateMotion>
          </circle>
        ))}
        <path id="pkt0" d="M250,250 L128,128" fill="none"/>
        <path id="pkt1" d="M250,250 L372,128" fill="none"/>
        <path id="pkt2" d="M250,250 L322,408" fill="none"/>
        <path id="pkt3" d="M250,250 L96,280"  fill="none"/>

        {/* Telemetry overlay */}
        <rect x="12" y="442" width="140" height="48" rx="4" fill="rgba(0,0,0,0.5)" stroke="rgba(0,255,135,0.12)" strokeWidth="0.5"/>
        <text x="20" y="457" fill="rgba(0,255,135,0.5)" fontSize="7.5" fontFamily="JetBrains Mono, monospace">SYS_STATUS: NOMINAL</text>
        <text x="20" y="470" fill="rgba(0,255,135,0.5)" fontSize="7.5" fontFamily="JetBrains Mono, monospace">FUSA: ISO_26262_ASIL_D</text>
        <text x="20" y="483" fill="rgba(0,255,135,0.35)" fontSize="7.5" fontFamily="JetBrains Mono, monospace">TEST_COV: 99.2%</text>

        {/* Volvo badge */}
        <rect x="348" y="442" width="140" height="48" rx="4" fill="rgba(0,48,87,0.5)" stroke="rgba(0,100,200,0.2)" strokeWidth="0.5"/>
        <text x="418" y="463" textAnchor="middle" fill="rgba(100,180,255,0.7)" fontSize="7.5" fontFamily="JetBrains Mono, monospace">VOLVO CARS</text>
        <text x="418" y="476" textAnchor="middle" fill="rgba(100,180,255,0.5)" fontSize="7.5" fontFamily="JetBrains Mono, monospace">EX90 · EX30 · ES90</text>
        <text x="418" y="487" textAnchor="middle" fill="rgba(100,180,255,0.4)" fontSize="6" fontFamily="JetBrains Mono, monospace">GOTHENBURG · 2023–PRESENT</text>
      </svg>
    </div>
  )
}

// ─── Typewriter for tagline ──────────────────────────────────────
function splitTagline(tagline: string): string[] {
  const parts = tagline
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean)
  return parts.length ? parts : [tagline.trim()].filter(Boolean)
}

function TypewriterTagline({ tagline }: { tagline: string }) {
  const phrases = splitTagline(tagline)
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!phrases.length) return
    const phrase = phrases[phraseIdx % phrases.length]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && displayed.length < phrase.length) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 60)
    } else if (!deleting && displayed.length === phrase.length) {
      timeout = setTimeout(() => setDeleting(true), 1800)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setPhraseIdx(i => (i + 1) % phrases.length)
    }

    return () => clearTimeout(timeout)
  }, [displayed, deleting, phraseIdx, phrases])

  return (
    <span className="text-white/70">
      {displayed}
      <span className="inline-block w-0.5 h-[1em] bg-[#00ff87] ml-0.5 align-middle animate-pulse" />
    </span>
  )
}

// ─── Hero ────────────────────────────────────────────────────────
interface HeroProps {
  personal: Personal
  stats: Stat[]
  rotatingChips: string[]
}

export default function Hero({ personal, stats, rotatingChips }: HeroProps) {
  const [firstName, ...restName] = (personal.name || '').trim().split(/\s+/)
  const lastName = restName.join(' ')
  const location = personal.location || ''
  return (
    <section className="relative min-h-screen flex flex-col items-stretch pt-[72px] overflow-hidden" id="hero">
      {/* Dot grid background */}
      <DotGrid />

      {/* Ambient orbs — scaled down on small screens to prevent overflow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full bg-[#00ff87]/4 blur-[80px] sm:blur-[110px] lg:blur-[130px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] lg:w-[400px] lg:h-[400px] rounded-full bg-[#c9a84c]/4 blur-[70px] sm:blur-[90px] lg:blur-[110px]" />
        <div className="absolute top-[60%] left-[50%] w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] lg:w-[300px] lg:h-[300px] rounded-full bg-[#60a5fa]/3 blur-[60px] sm:blur-[80px] lg:blur-[100px]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-10 sm:py-14 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── Left ── */}
            <div>
              {/* Status pill */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-8"
                style={{ backgroundColor: 'rgba(0,255,135,0.06)', borderColor: 'rgba(0,255,135,0.18)' }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff87] opacity-50" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff87]" />
                </span>
                <span className="text-[#00ff87] text-xs font-medium tracking-wide">
                  Open to opportunities{location ? ` · ${location}` : ''}
                </span>
              </motion.div>

              {/* Name */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="text-[2.5rem] xs:text-5xl sm:text-5xl md:text-6xl xl:text-7xl font-black leading-[0.9] tracking-tight uppercase break-words">
                  <span className="text-white block">{firstName || personal.name}</span>
                  {lastName && (
                    <span
                      className="block mt-1"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, #00ff87 0%, #00d4aa 50%, #00b8d4 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {lastName}
                    </span>
                  )}
                </h1>
              </motion.div>

              {/* Role */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-[#a3a3a3] text-base sm:text-lg md:text-xl font-light mt-5 mb-1 flex items-center gap-2"
              >
                <Zap size={16} className="text-[#00ff87] flex-shrink-0" />
                <span className="break-words">{personal.title}</span>
              </motion.p>

              {/* Typewriter tagline */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-base md:text-lg font-light mb-10 h-7"
              >
                <TypewriterTagline tagline={personal.tagline || ''} />
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="flex flex-wrap items-center gap-2 sm:gap-3 mb-10 sm:mb-12"
              >
                <a
                  href="#career"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-semibold text-sm group transition-all duration-200 min-h-[44px]"
                  style={{ backgroundColor: '#00ff87', color: '#080808' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#00e87a')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#00ff87')}
                >
                  View Work
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
                {personal.resumeUrl && (
                  <a
                    href={personal.resumeUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl border text-white font-medium text-sm transition-all duration-200 hover:bg-white/8 min-h-[44px]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <FileText size={16} />
                    Resume
                  </a>
                )}
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl text-[#a3a3a3] font-medium text-sm hover:text-white transition-colors duration-200 min-h-[44px]"
                >
                  <Mail size={16} />
                  Contact
                </a>
              </motion.div>

              {/* Stats grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3"
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.id ?? i}
                    whileHover={{ y: -2, borderColor: 'rgba(0,255,135,0.2)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="p-3 sm:p-4 rounded-xl border transition-all duration-300"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <div className="text-xl sm:text-2xl font-black text-white mb-0.5">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-widest leading-tight" style={{ color: '#555' }}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* ── Right: ECU viz ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block h-[520px]"
            >
              <ECUVisualization />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Scrolling marquee strip ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="relative z-10 border-t border-b border-white/5 py-3"
        style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}
      >
        <Marquee items={rotatingChips} speed={28} />
      </motion.div>

      {/* Scroll indicator — hidden on small screens to avoid overlap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="hidden md:flex absolute bottom-20 left-1/2 -translate-x-1/2 flex-col items-center gap-2 z-10"
      >
        <span className="text-[#333] text-[10px] tracking-[0.3em] uppercase font-mono">scroll</span>
        <div className="w-px h-8 overflow-hidden">
          <motion.div
            className="w-full h-full bg-gradient-to-b from-[#00ff87] to-transparent"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  )
}
