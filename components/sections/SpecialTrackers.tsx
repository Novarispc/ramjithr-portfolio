'use client'
import { motion } from 'framer-motion'
import { Check, Languages } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import ScrollList from '@/components/ui/ScrollList'
import type { Language } from '@/lib/content-schema'

export default function SpecialTrackers({ languages }: { languages: Language[] }) {
  const named = languages.filter(l => l.name.trim())
  const completed = named.filter(l => l.completed).length
  const total = named.length || 1
  const pct = Math.min(100, Math.round((completed / total) * 100))

  if (!named.length) return null

  return (
    <section id="trackers" className="py-24 px-6 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="mb-12">
            <p className="text-[#00ff87] text-xs tracking-[0.3em] uppercase font-mono mb-4">06 · Languages</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Languages Spoken</h2>
            <p className="text-[#a3a3a3] text-lg max-w-xl">
              Communication across borders — the spoken languages alongside the technical ones.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="max-w-2xl rounded-2xl border border-white/6 bg-[#111] overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#a78bfa]/10 border border-[#a78bfa]/20 flex items-center justify-center">
                    <Languages size={16} className="text-[#a78bfa]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Fluency tracker</h3>
                    <p className="text-[#555] text-[12px]">{completed} fluent · {named.length} total</p>
                  </div>
                </div>
                <span className="text-[#a78bfa] text-sm font-mono font-bold">{pct}%</span>
              </div>

              <div className="mt-5 h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6]"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ boxShadow: '0 0 8px rgba(167,139,250,0.4)' }}
                />
              </div>
            </div>

            <ScrollList maxVisible={7} className="p-5 grid sm:grid-cols-2 gap-2">
              {named.map((lang, i) => (
                <motion.div
                  key={lang.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{
                    backgroundColor: lang.completed ? 'rgba(167,139,250,0.06)' : 'transparent',
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={{
                      borderColor: lang.completed ? '#a78bfa' : 'rgba(255,255,255,0.15)',
                      backgroundColor: lang.completed ? 'rgba(167,139,250,0.18)' : 'transparent',
                    }}
                  >
                    {lang.completed && <Check size={11} className="text-[#a78bfa]" strokeWidth={3} />}
                  </div>
                  <span
                    className={`text-sm transition-all duration-200 ${
                      lang.completed ? 'text-white font-medium' : 'text-[#888]'
                    }`}
                  >
                    {lang.name}
                  </span>
                </motion.div>
              ))}
            </ScrollList>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
