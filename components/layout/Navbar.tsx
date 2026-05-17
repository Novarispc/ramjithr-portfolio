'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import type { Personal } from '@/lib/content-schema'

const NAV_LINKS = [
  { label: 'Experience', href: '#career' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'Trackers', href: '#trackers' },
  { label: 'Goals', href: '#impossible' },
  { label: 'Journey', href: '#journey' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar({ personal }: { personal: Personal }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const initial = (personal.name || 'R').trim().charAt(0).toUpperCase() || 'R'
  const lastName = personal.name?.trim().split(/\s+/)[0] || 'Profile'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#080808]/90 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#00ff87]/10 border border-[#00ff87]/30 flex items-center justify-center group-hover:bg-[#00ff87]/20 transition-all overflow-hidden">
              {personal.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={personal.image}
                  alt={personal.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#00ff87] text-sm font-bold font-mono">{initial}</span>
              )}
            </div>
            <span className="font-semibold text-white text-sm tracking-wide">{lastName}</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#a3a3a3] hover:text-white transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#00ff87] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <a
              href={`mailto:${personal.email}`}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00ff87]/10 border border-[#00ff87]/30 text-[#00ff87] text-sm font-medium hover:bg-[#00ff87]/20 transition-all duration-200"
            >
              Hire Me
            </a>
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[72px] left-0 right-0 z-40 bg-[#0e0e0e]/98 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-3 text-[#a3a3a3] hover:text-[#00ff87] text-sm transition-colors border-b border-white/5 last:border-0"
              >
                {link.label}
              </a>
            ))}
            <a
              href={`mailto:${personal.email}`}
              className="mt-4 flex items-center justify-center gap-2 py-3 rounded-lg bg-[#00ff87]/10 border border-[#00ff87]/30 text-[#00ff87] text-sm font-medium"
            >
              Hire Me
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
