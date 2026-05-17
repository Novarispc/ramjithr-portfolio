'use client'
import { motion } from 'framer-motion'
import { Check, Trophy, Target } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import ScrollList from '@/components/ui/ScrollList'
import type { AchievementGroup } from '@/lib/content-schema'

function GroupProgress({ done, total, color }: { done: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] text-[#555] font-mono w-12 text-right">{done}/{total}</span>
    </div>
  )
}

export default function ImpossibleList({ achievements }: { achievements: AchievementGroup[] }) {
  if (!achievements?.length) return null

  const flat = achievements.flatMap(g => g.items)
  const totalCompleted = flat.filter(i => i.completed).length
  const totalItems = flat.length

  return (
    <section id="impossible" className="py-24 px-6 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[#00ff87] text-xs tracking-[0.3em] uppercase font-mono mb-4">07 · Life Goals</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Impossible List</h2>
              <p className="text-[#a3a3a3] text-lg max-w-xl">
                Not a bucket list. An evolving record of things worth pursuing — completed, in progress, and dreamed.
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-black text-white">
                {totalCompleted}<span className="text-[#00ff87]">/{totalItems}</span>
              </div>
              <div className="text-[#555] text-xs">completed</div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((group, catIdx) => {
            const color = group.color || '#00ff87'
            const completed = group.items.filter(i => i.completed).length
            const allDone = group.items.length > 0 && completed === group.items.length

            return (
              <ScrollReveal key={group.id} delay={catIdx * 0.08}>
                <div className="rounded-2xl border border-white/6 bg-[#111] overflow-hidden h-full">
                  <div className="p-5 border-b border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <h3 className="font-bold text-white truncate">{group.name}</h3>
                        {allDone && <Trophy size={14} className="text-[#c9a84c] flex-shrink-0" />}
                      </div>
                      <span className="text-xs font-mono text-[#555] flex-shrink-0">
                        {completed}/{group.items.length}
                      </span>
                    </div>
                    <GroupProgress done={completed} total={group.items.length} color={color} />
                    {group.description && (
                      <p className="text-[#666] text-xs mt-3 leading-relaxed">{group.description}</p>
                    )}
                  </div>

                  <ScrollList maxVisible={7} className="p-4 space-y-2">
                    {group.items.map(item => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl">
                        <div
                          className="flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-all duration-200"
                          style={{
                            borderColor: item.completed ? color : 'rgba(255,255,255,0.15)',
                            backgroundColor: item.completed ? `${color}20` : 'transparent',
                          }}
                        >
                          {item.completed && <Check size={12} style={{ color }} strokeWidth={2.5} />}
                        </div>
                        <span
                          className={`flex-1 text-sm leading-relaxed transition-all duration-200 ${
                            item.completed ? 'line-through text-[#444]' : 'text-[#ccc]'
                          }`}
                        >
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </ScrollList>
                </div>
              </ScrollReveal>
            )
          })}
        </div>

        <ScrollReveal delay={0.4}>
          <div className="mt-10 flex flex-wrap gap-3">
            {achievements.map(group => {
              if (!group.items.length) return null
              const pct = Math.round((group.items.filter(i => i.completed).length / group.items.length) * 100)
              if (pct === 0) return null
              const color = group.color || '#00ff87'
              return (
                <div
                  key={group.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium"
                  style={{ borderColor: `${color}30`, color, backgroundColor: `${color}08` }}
                >
                  <Target size={11} />
                  {group.name}: {pct}% done
                </div>
              )
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
