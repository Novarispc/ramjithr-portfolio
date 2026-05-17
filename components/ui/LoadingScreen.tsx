'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BOOT_LINES = [
  { text: 'INITIALIZING ECU CORE...', delay: 0 },
  { text: 'LOADING AUTOSAR STACK...', delay: 300 },
  { text: 'CALIBRATING SAFETY PROTOCOLS...', delay: 600 },
  { text: 'RUNNING ISO 26262 CHECKS...', delay: 900 },
  { text: 'CONNECTING TO VEHICLE NETWORK...', delay: 1200 },
  { text: 'ALL SYSTEMS NOMINAL.', delay: 1500, accent: true },
]

interface Props {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: Props) {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Reveal boot lines progressively
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, i])
      }, line.delay)
    })

    // Progress bar fill over 2s
    const startTime = Date.now()
    const duration = 2000
    const tick = () => {
      const elapsed = Date.now() - startTime
      const p = Math.min((elapsed / duration) * 100, 100)
      setProgress(p)
      if (p < 100) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

    // Trigger exit after all lines shown + brief hold
    const exitTimer = setTimeout(() => {
      setDone(true)
      setTimeout(onComplete, 700)
    }, 2400)

    return () => clearTimeout(exitTimer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#080808] flex flex-col items-center justify-center"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-[#00ff87]/5 blur-[100px]" />
          </div>

          <div className="relative z-10 w-full max-w-md px-8">
            {/* Logo mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 mb-10"
            >
              <div className="w-10 h-10 rounded-xl bg-[#00ff87]/10 border border-[#00ff87]/30 flex items-center justify-center">
                <span className="text-[#00ff87] text-lg font-black font-mono">R</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm tracking-wide">RAMJITH RADHAKRISHNAN</p>
                <p className="text-[#555] text-xs font-mono tracking-widest">AUTOMOTIVE · SOFTWARE · ENGINEER</p>
              </div>
            </motion.div>

            {/* Boot terminal */}
            <div className="bg-[#0d0d0d] border border-white/6 rounded-xl p-5 mb-6 font-mono text-xs min-h-[140px]">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-[#444] text-[10px]">ecu-boot-v9.3.1</span>
              </div>
              <div className="space-y-1.5">
                {BOOT_LINES.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={visibleLines.includes(i) ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.25 }}
                    className={`flex items-center gap-2 ${line.accent ? 'text-[#00ff87]' : 'text-[#555]'}`}
                  >
                    <span className="text-[#333]">{'>'}</span>
                    <span>{line.text}</span>
                    {i === BOOT_LINES.length - 1 && visibleLines.includes(i) && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-1.5 h-3 bg-[#00ff87] ml-1"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="h-px bg-[#1a1a1a] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #00ff87, #00d4aa)',
                    boxShadow: '0 0 10px rgba(0,255,135,0.5)',
                    transition: 'width 0.05s linear',
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#444] text-[10px] font-mono">SYSTEM BOOT</span>
                <span className="text-[#00ff87] text-[10px] font-mono">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
