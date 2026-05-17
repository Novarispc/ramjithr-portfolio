'use client'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

interface Metric { value: number; suffix: string; label: string; description: string }

const ICONS = ['⚡', '⏱', '✓', '🎯', '🔍', '🛡']

export default function ImpactDashboard({ metrics }: { metrics: Metric[] }) {
  return (
    <section id="impact" className="py-24 px-6 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="mb-16">
            <p className="text-[#00ff87] text-xs tracking-[0.3em] uppercase font-mono mb-4">03 · Results</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Impact Dashboard</h2>
            <p className="text-[#a3a3a3] text-lg">Measurable outcomes from 10+ years of engineering precision.</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {metrics.map((metric, i) => (
            <ScrollReveal key={i} delay={i * 0.08} direction="up">
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative p-6 md:p-8 rounded-2xl bg-[#111] border border-white/6 overflow-hidden group hover:border-[#00ff87]/20 transition-all duration-300"
              >
                {/* BG glow on hover */}
                <div className="absolute inset-0 bg-[#00ff87]/0 group-hover:bg-[#00ff87]/3 transition-all duration-500 rounded-2xl" />

                {/* Radial accent */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#00ff87]/5 blur-2xl group-hover:bg-[#00ff87]/10 transition-all" />

                <div className="relative">
                  <div className="text-2xl mb-4">{ICONS[i % ICONS.length]}</div>

                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl md:text-5xl font-black text-white leading-none">
                      <AnimatedCounter value={metric.value} />
                    </span>
                    <span className="text-2xl font-black text-[#00ff87] pb-1">{metric.suffix}</span>
                  </div>

                  <h3 className="text-white font-semibold text-sm md:text-base mb-1">{metric.label}</h3>
                  <p className="text-[#555] text-xs leading-relaxed">{metric.description}</p>

                  {/* Bottom accent bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Telemetry-style corner tag */}
                <div className="absolute top-4 right-4 font-mono text-[9px] text-[#00ff87]/30 group-hover:text-[#00ff87]/60 transition-colors">
                  M{String(i + 1).padStart(2, '0')}
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom summary bar */}
        <ScrollReveal delay={0.5}>
          <div className="mt-10 p-6 rounded-2xl bg-[#00ff87]/5 border border-[#00ff87]/15 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-white font-semibold">Driving measurable outcomes across 4 global companies</p>
              <p className="text-[#a3a3a3] text-sm mt-1">From telematics to EV exterior systems — every metric earned through precision engineering.</p>
            </div>
            <div className="flex items-center gap-2 text-[#00ff87] text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
              Volvo Cars · Project Lead · Present
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
