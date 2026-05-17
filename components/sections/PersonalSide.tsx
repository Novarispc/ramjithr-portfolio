'use client'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'

interface Interest { name: string; icon: string; description: string }

interface Props {
  interests: Interest[]
  funFacts: string[]
}

export default function PersonalSide({ interests, funFacts }: Props) {
  return (
    <section id="personal" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="mb-16">
            <p className="text-[#00ff87] text-xs tracking-[0.3em] uppercase font-mono mb-4">10 · Beyond Engineering</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">The Person Behind the Code</h2>
            <p className="text-[#a3a3a3] text-base sm:text-lg max-w-2xl">
              Engineering is the profession. Curiosity, cricket, and culture are the fuel.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Interests grid */}
          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {interests.map((interest, i) => (
                <ScrollReveal key={interest.name} delay={i * 0.07}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="p-5 rounded-2xl border border-white/6 bg-[#111] group hover:border-[#00ff87]/20 hover:shadow-[0_0_30px_rgba(0,255,135,0.05)] transition-all duration-300 cursor-default"
                  >
                    <div className="text-3xl mb-3">{interest.icon}</div>
                    <h3 className="font-bold text-white text-base mb-1">{interest.name}</h3>
                    <p className="text-[#666] text-sm leading-relaxed">{interest.description}</p>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Fun facts sidebar */}
          <ScrollReveal direction="right">
            <div className="p-6 rounded-2xl border border-white/6 bg-[#111] h-fit">
              <h3 className="text-[#555] text-xs tracking-[0.25em] uppercase font-mono mb-5">Fun Facts</h3>
              <div className="space-y-4">
                {funFacts.map((fact, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 text-sm text-[#a3a3a3] leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#00ff87]/10 border border-[#00ff87]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#00ff87] text-[9px] font-bold">{i + 1}</span>
                    </span>
                    {fact}
                  </motion.div>
                ))}
              </div>

              {/* Quote */}
              <div className="mt-6 pt-6 border-t border-white/5">
                <blockquote className="text-[#a3a3a3] text-sm italic leading-relaxed">
                  &ldquo;Safety is not a constraint — it&rsquo;s the foundation every great automotive system is built on.&rdquo;
                </blockquote>
                <p className="text-[#555] text-xs mt-2">— Ramjith Radhakrishnan</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
