'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { SkillCategory } from '@/lib/content-schema'

export default function TechConstellation({ skillCategories }: { skillCategories: SkillCategory[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  if (!skillCategories.length) return null

  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="mb-16">
            <p className="text-[#00ff87] text-xs tracking-[0.3em] uppercase font-mono mb-4">04 · Skills</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Tech Constellation</h2>
            <p className="text-[#a3a3a3] text-lg">The full spectrum of my automotive engineering toolkit.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap gap-3 mb-10">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                !activeCategory
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/3 border-white/8 text-[#666] hover:text-white hover:border-white/15'
              }`}
            >
              All Skills
            </button>
            {skillCategories.map(cat => {
              const isActive = activeCategory === cat.id
              const color = cat.color || '#00ff87'
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(isActive ? null : cat.id)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? `${color}14` : 'rgba(255,255,255,0.02)',
                    borderColor: isActive ? `${color}40` : 'rgba(255,255,255,0.06)',
                    color: isActive ? color : '#666',
                  }}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {skillCategories.map((cat, catIdx) => {
            const color = cat.color || '#00ff87'
            const isVisible = !activeCategory || activeCategory === cat.id
            return (
              <motion.div
                key={cat.id}
                animate={{ opacity: isVisible ? 1 : 0.2, scale: isVisible ? 1 : 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <ScrollReveal delay={catIdx * 0.05}>
                  <div
                    className="p-5 rounded-2xl border h-full transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: activeCategory === cat.id ? `${color}14` : 'rgba(255,255,255,0.02)',
                      borderColor: activeCategory === cat.id ? `${color}30` : 'rgba(255,255,255,0.06)',
                    }}
                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <h3 className="font-bold text-sm" style={{ color }}>{cat.name}</h3>
                    </div>
                    {cat.description && (
                      <p className="text-[#555] text-[10px] mb-4 leading-relaxed">{cat.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {cat.skills.map((skill, i) => {
                        const opacity = 0.5 + (skill.proficiency / 5) * 0.5
                        return (
                          <motion.span
                            key={skill.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: catIdx * 0.05 + i * 0.03 }}
                            title={`Proficiency ${skill.proficiency}/5`}
                            className="px-2 py-1 rounded-lg text-[11px] font-medium border inline-flex items-center gap-1"
                            style={{
                              backgroundColor: `${color}08`,
                              borderColor: `${color}20`,
                              color: `${color}${opacity > 0.85 ? 'EE' : 'AA'}`,
                            }}
                          >
                            {skill.name}
                            <span className="flex gap-[1px] ml-0.5">
                              {[1, 2, 3, 4, 5].map(n => (
                                <span
                                  key={n}
                                  className="w-[3px] h-[3px] rounded-full"
                                  style={{
                                    backgroundColor: n <= skill.proficiency ? color : `${color}25`,
                                  }}
                                />
                              ))}
                            </span>
                          </motion.span>
                        )
                      })}
                    </div>
                  </div>
                </ScrollReveal>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
