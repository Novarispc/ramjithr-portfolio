'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CursorGlow() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [clicking, setClicking] = useState(false)
  const [hovering, setHovering] = useState(false)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  // Dot: tight spring (snappy)
  const dotX = useSpring(rawX, { stiffness: 800, damping: 40 })
  const dotY = useSpring(rawY, { stiffness: 800, damping: 40 })

  // Ring: loose spring (lags behind)
  const ringX = useSpring(rawX, { stiffness: 150, damping: 20 })
  const ringY = useSpring(rawY, { stiffness: 150, damping: 20 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const onDown = () => setClicking(true)
    const onUp = () => setClicking(false)
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    const checkHover = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      const interactive = el.closest('a, button, [role="button"], input, textarea, select, label, [data-cursor-hover]')
      setHovering(!!interactive)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousemove', checkHover, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousemove', checkHover)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
    }
  }, [rawX, rawY, visible])

  // Only render on non-touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <>
      {/* Hide native cursor globally */}
      <style>{`* { cursor: none !important; }`}</style>

      {/* Dot — snappy, always on cursor */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 1 : 0,
          scale: clicking ? 0.6 : hovering ? 1.5 : 1,
        }}
        transition={{ scale: { type: 'spring', stiffness: 400, damping: 25 } }}
        className="fixed top-0 left-0 z-[99999] pointer-events-none"
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{
            background: '#00ff87',
            boxShadow: hovering
              ? '0 0 12px 4px rgba(0,255,135,0.6)'
              : '0 0 6px 2px rgba(0,255,135,0.4)',
          }}
        />
      </motion.div>

      {/* Ring — lazy, trails behind */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 0.6 : 0,
          scale: clicking ? 0.7 : hovering ? 1.6 : 1,
        }}
        transition={{ scale: { type: 'spring', stiffness: 200, damping: 20 } }}
        className="fixed top-0 left-0 z-[99998] pointer-events-none"
      >
        <div
          className="w-8 h-8 rounded-full border"
          style={{
            borderColor: hovering ? 'rgba(0,255,135,0.8)' : 'rgba(0,255,135,0.3)',
            boxShadow: hovering ? '0 0 20px rgba(0,255,135,0.2)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        />
      </motion.div>
    </>
  )
}
