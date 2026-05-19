'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github, Star, Code2 } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { Project } from '@/lib/content-schema'

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <ScrollReveal delay={index * 0.08} direction="up">
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative flex flex-col h-full rounded-2xl border bg-[#111] overflow-hidden transition-all duration-300"
        style={{
          borderColor: hovered ? 'rgba(0,255,135,0.2)' : 'rgba(255,255,255,0.06)',
          boxShadow: hovered ? '0 0 40px rgba(0,255,135,0.06)' : 'none',
        }}
      >
        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00ff87]/10 border border-[#00ff87]/25 text-[#00ff87] text-[10px] font-mono tracking-wide">
            <Star size={9} />
            Featured
          </div>
        )}

        {/* Image / placeholder */}
        <div
          className="relative w-full overflow-hidden flex-shrink-0"
          style={{ height: '180px' }}
        >
          {project.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500"
              style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(0,255,135,0.04) 0%, rgba(0,180,200,0.04) 100%)' }}
            >
              <Code2 size={40} className="text-[#00ff87]/20" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-60" />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5 sm:p-6">
          <h3 className="font-bold text-white text-base sm:text-lg mb-2 leading-snug">{project.title}</h3>
          <p className="text-[#666] text-sm leading-relaxed flex-1 mb-4">{project.description}</p>

          {/* Tech tags */}
          {project.tech.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {project.tech.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wide"
                  style={{ backgroundColor: 'rgba(0,255,135,0.06)', color: 'rgba(0,255,135,0.55)', border: '1px solid rgba(0,255,135,0.1)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-3 mt-auto">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00ff87] hover:text-white transition-colors duration-200"
              >
                <ExternalLink size={14} />
                Live
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#a3a3a3] hover:text-white transition-colors duration-200"
              >
                <Github size={14} />
                Source
              </a>
            )}
          </div>
        </div>

        {/* Bottom accent on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/30 to-transparent transition-opacity duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        />

        {/* Corner telemetry tag */}
        <div className="absolute top-3 left-3 font-mono text-[9px] text-[#00ff87]/25 group-hover:text-[#00ff87]/50 transition-colors">
          P{String(index + 1).padStart(2, '0')}
        </div>
      </motion.div>
    </ScrollReveal>
  )
}

export default function Projects({ projects }: { projects: Project[] }) {
  const [showAll, setShowAll] = useState(false)

  if (!projects?.length) return null

  const featured = projects.filter((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)
  const visible = showAll ? projects : featured.length ? featured : projects.slice(0, 6)

  return (
    <section id="projects" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="mb-10 sm:mb-14 lg:mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[#00ff87] text-xs tracking-[0.3em] uppercase font-mono mb-3 sm:mb-4">05 · Work</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4">Projects</h2>
              <p className="text-[#a3a3a3] text-base sm:text-lg">
                A selection of things I've built — tools, systems, and experiments.
              </p>
            </div>
            {rest.length > 0 && featured.length > 0 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="self-start sm:self-auto flex-shrink-0 px-5 py-2.5 rounded-xl border border-white/10 text-sm text-[#a3a3a3] hover:text-white hover:border-white/25 transition-all duration-200 font-medium"
              >
                {showAll ? 'Show Featured' : `All Projects (${projects.length})`}
              </button>
            )}
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {visible.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
