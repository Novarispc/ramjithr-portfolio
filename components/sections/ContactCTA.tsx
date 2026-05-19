'use client'
import { motion } from 'framer-motion'
import { Mail, Linkedin, FileText, Github, ArrowRight, MapPin, Clock } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { Personal } from '@/lib/content-schema'

function buildContactOptions(personal: Personal) {
  const options: {
    icon: typeof Mail
    label: string
    description: string
    href: string
    color: string
    action: string
    download: boolean
  }[] = [
    {
      icon: Mail,
      label: 'Send an Email',
      description: 'Best for formal inquiries & opportunities',
      href: `mailto:${personal.email}`,
      color: '#00ff87',
      action: 'Email Me',
      download: false,
    },
    {
      icon: Linkedin,
      label: 'Connect on LinkedIn',
      description: 'View career history & professional network',
      href: personal.linkedin || '#',
      color: '#60a5fa',
      action: 'Open Profile',
      download: false,
    },
  ]
  if (personal.github) {
    options.push({
      icon: Github,
      label: 'View on GitHub',
      description: 'Browse open-source code and personal projects',
      href: personal.github,
      color: '#e2e8f0',
      action: 'Open GitHub',
      download: false,
    })
  }
  if (personal.resumeUrl) {
    options.push({
      icon: FileText,
      label: 'Download Resume',
      description: 'Full CV with complete experience timeline',
      href: personal.resumeUrl,
      color: '#c9a84c',
      action: 'Get Resume',
      // download attribute only works same-origin (i.e. /api/resume)
      download: personal.resumeUrl.startsWith('/api/resume'),
    })
  }
  return options
}

export default function ContactCTA({ personal }: { personal: Personal }) {
  const CONTACT_OPTIONS = buildContactOptions(personal)
  return (
    <section id="contact" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-[#0d0d0d] relative overflow-hidden">
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#00ff87]/4 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <ScrollReveal>
          <p className="text-[#00ff87] text-xs tracking-[0.3em] uppercase font-mono mb-6">11 · Let's Connect</p>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] mb-6">
            Let&rsquo;s Build the
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #00ff87, #00d4aa)' }}
            >
              Future of Mobility
            </span>
          </h2>

          <p className="text-[#a3a3a3] text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
            Open to senior engineering roles, consultancy, and collaborative projects in automotive software, functional safety, and EV systems.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16 text-sm text-[#555]">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#00ff87]" />
              {personal.location}
            </span>
            <span className="w-px h-4 bg-white/10" />
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-[#00ff87]" />
              CET (UTC+1) · Responds within 24h
            </span>
            <span className="w-px h-4 bg-white/10" />
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
              Open to opportunities
            </span>
          </div>
        </ScrollReveal>

        {/* Contact cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {CONTACT_OPTIONS.map((opt, i) => {
            const Icon = opt.icon
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.a
                  href={opt.href}
                  target={opt.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  download={opt.download || undefined}
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex flex-col items-start p-6 rounded-2xl border border-white/6 bg-[#111] group hover:border-[#00ff87]/20 transition-all duration-300 text-left"
                  style={{
                    boxShadow: 'none',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
                    style={{
                      backgroundColor: `${opt.color}12`,
                      border: `1px solid ${opt.color}25`,
                    }}
                  >
                    <Icon size={20} style={{ color: opt.color }} />
                  </div>
                  <h3 className="font-bold text-white mb-1">{opt.label}</h3>
                  <p className="text-[#666] text-sm mb-4 leading-relaxed flex-1">{opt.description}</p>
                  <span
                    className="flex items-center gap-1.5 text-sm font-medium group-hover:gap-2.5 transition-all duration-200"
                    style={{ color: opt.color }}
                  >
                    {opt.action}
                    <ArrowRight size={14} />
                  </span>
                </motion.a>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Bottom tagline */}
        <ScrollReveal delay={0.3}>
          <p className="text-[#333] text-sm font-mono">
            {personal.name} · {personal.title} · {personal.location}
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
