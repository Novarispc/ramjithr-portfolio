'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MapPin, Calendar, Wrench } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import ScrollList from '@/components/ui/ScrollList'
import type { Career } from '@/lib/content-schema'

function TimelineCard({ entry, index, isCurrent }: { entry: Career; index: number; isCurrent: boolean }) {
  const [expanded, setExpanded] = useState(isCurrent)

  return (
    <ScrollReveal delay={index * 0.1}>
      <div className="relative pl-8 md:pl-0">
        {/* Timeline line (mobile) */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10 md:hidden" />
        <div
          className="absolute left-1.5 top-6 w-3 h-3 rounded-full border-2 md:hidden"
          style={{ borderColor: entry.color, backgroundColor: `${entry.color}30` }}
        />

        <motion.div
          onClick={() => setExpanded(!expanded)}
          className="cursor-pointer rounded-2xl border bg-[#111111] overflow-hidden transition-all duration-300"
          style={{
            borderColor: expanded ? `${entry.color}40` : 'rgba(255,255,255,0.06)',
            boxShadow: expanded ? `0 0 30px ${entry.color}10` : 'none',
          }}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Header */}
          <div className="p-6 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Company badge */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{
                  backgroundColor: `${entry.color}15`,
                  color: entry.color,
                  border: `1px solid ${entry.color}30`,
                }}
              >
                {entry.short.slice(0, 2)}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-white text-lg">{entry.company}</h3>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#00ff87]/15 text-[#00ff87] border border-[#00ff87]/30">
                      CURRENT
                    </span>
                  )}
                </div>
                <p className="text-[#a3a3a3] text-sm font-medium">{entry.role}</p>
                <p className="text-[#555] text-xs mt-1 italic">{entry.focus}</p>

                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[#666] text-xs">
                    <Calendar size={11} />{entry.period}
                  </span>
                  <span className="flex items-center gap-1 text-[#666] text-xs">
                    <MapPin size={11} />{entry.location}
                  </span>
                </div>
              </div>
            </div>

            <ChevronDown
              size={18}
              className="text-[#555] flex-shrink-0 mt-1 transition-transform duration-300"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>

          {/* Expandable content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 border-t border-white/5 pt-5">
                  {/* Achievements */}
                  <div className="mb-4">
                    <h4 className="text-[10px] uppercase tracking-widest text-[#555] mb-3">Key Achievements</h4>
                    <ScrollList maxVisible={7} className="space-y-2" style={{ display: 'flex', flexDirection: 'column' }}>
                      {entry.achievements.map((ach, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-[#ccc]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff87] flex-shrink-0 mt-2" />
                          {ach}
                        </div>
                      ))}
                    </ScrollList>
                  </div>
                  {/* Tools */}
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-[#555] mb-3 flex items-center gap-1">
                      <Wrench size={11} /> Tools &amp; Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {entry.tools.map(tool => (
                        <span
                          key={tool}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium border"
                          style={{
                            backgroundColor: `${entry.color}10`,
                            borderColor: `${entry.color}25`,
                            color: `${entry.color}CC`,
                          }}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </ScrollReveal>
  )
}

export default function CareerTimeline({ career }: { career: Career[] }) {
  const lastIdx = career.length - 1
  return (
    <section id="career" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="mb-16">
            <p className="text-[#00ff87] text-xs tracking-[0.3em] uppercase font-mono mb-4">02 · Experience</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Career Timeline</h2>
            <p className="text-[#a3a3a3] text-lg max-w-2xl">
              10+ years navigating the full stack of automotive software validation — from telematics to EV exterior systems at Volvo Cars.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {career.map((entry, i) => (
            <TimelineCard key={entry.id} entry={entry} index={i} isCurrent={i === lastIdx} />
          ))}
        </div>
      </div>
    </section>
  )
}
