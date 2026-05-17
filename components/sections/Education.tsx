'use client'
import { motion } from 'framer-motion'
import { GraduationCap, Award, MapPin, Calendar, ExternalLink } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import ScrollList from '@/components/ui/ScrollList'
import type { EducationItem, Certification } from '@/lib/content-schema'

interface Props {
  education: EducationItem[]
  certifications: Certification[]
}

export default function Education({ education, certifications }: Props) {
  return (
    <section id="education" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="mb-16">
            <p className="text-[#00ff87] text-xs tracking-[0.3em] uppercase font-mono mb-4">09 · Credentials</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">Education &amp; Certifications</h2>
            <p className="text-[#a3a3a3] text-base sm:text-lg">The academic foundation and professional credentials behind the work.</p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <ScrollReveal>
              <h3 className="text-[#555] text-xs tracking-[0.25em] uppercase font-mono mb-6 flex items-center gap-2">
                <GraduationCap size={14} className="text-[#c9a84c]" />
                Academic Background
              </h3>
            </ScrollReveal>

            {education.map((edu, i) => (
              <ScrollReveal key={edu.id} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative p-6 rounded-2xl border border-white/6 bg-[#111] overflow-hidden group hover:border-[#c9a84c]/20 transition-all duration-300 mb-4"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/40 to-transparent" />
                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#c9a84c]/4 blur-2xl group-hover:bg-[#c9a84c]/8 transition-all" />

                  <div className="relative">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center flex-shrink-0">
                        <GraduationCap size={20} className="text-[#c9a84c]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg leading-tight">{edu.degree}</h4>
                        <p className="text-[#c9a84c] font-medium mt-1">{edu.institution}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4">
                      <span className="flex items-center gap-1.5 text-[#666] text-sm">
                        <Calendar size={13} />{edu.period}
                      </span>
                      {edu.location && (
                        <span className="flex items-center gap-1.5 text-[#666] text-sm">
                          <MapPin size={13} />{edu.location}
                        </span>
                      )}
                      {edu.grade && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] text-xs font-medium">
                          {edu.grade}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          <div>
            <ScrollReveal>
              <h3 className="text-[#555] text-xs tracking-[0.25em] uppercase font-mono mb-6 flex items-center gap-2">
                <Award size={14} className="text-[#00ff87]" />
                Professional Certifications
              </h3>
            </ScrollReveal>

            <ScrollList maxVisible={7} className="space-y-3">
              {certifications.map((cert, i) => (
                <ScrollReveal key={cert.id} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-white/6 bg-[#111] group hover:border-[#00ff87]/20 transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#00ff87]/8 border border-[#00ff87]/20 flex items-center justify-center flex-shrink-0">
                      <Award size={16} className="text-[#00ff87]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm truncate">{cert.name}</h4>
                      <p className="text-[#555] text-xs mt-0.5">{cert.issuer} · {cert.year}</p>
                    </div>
                    <ExternalLink size={13} className="text-[#333] group-hover:text-[#00ff87] transition-colors flex-shrink-0" />
                  </motion.div>
                </ScrollReveal>
              ))}
            </ScrollList>
          </div>
        </div>
      </div>
    </section>
  )
}
