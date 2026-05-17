'use client'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface Props {
  children: React.ReactNode
  className?: string
  glowColor?: string
  hover?: boolean
}

export default function GlowCard({ children, className = '', glowColor = '#00ff87', hover = true }: Props) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={clsx(
        'relative rounded-2xl border border-white/8 bg-[#111111] overflow-hidden',
        'transition-shadow duration-300',
        hover && 'hover:border-[#00ff87]/20 hover:shadow-[0_0_30px_rgba(0,255,135,0.08)]',
        className
      )}
      style={{ '--glow': glowColor } as React.CSSProperties}
    >
      {children}
    </motion.div>
  )
}
