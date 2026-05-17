import { Linkedin, Mail, Github } from 'lucide-react'
import type { Personal } from '@/lib/content-schema'

export default function Footer({ personal }: { personal: Personal }) {
  return (
    <footer className="border-t border-white/5 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-white font-semibold">{personal.name}</p>
          <p className="text-[#a3a3a3] text-sm mt-1">{personal.title} · {personal.location}</p>
        </div>
        <div className="flex items-center gap-4">
          {personal.linkedin && (
            <a href={personal.linkedin} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#a3a3a3] hover:text-[#00ff87] hover:border-[#00ff87]/30 transition-all"
              aria-label="LinkedIn">
              <Linkedin size={16} />
            </a>
          )}
          {personal.github && (
            <a href={personal.github} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#a3a3a3] hover:text-[#00ff87] hover:border-[#00ff87]/30 transition-all"
              aria-label="GitHub">
              <Github size={16} />
            </a>
          )}
          <a href={`mailto:${personal.email}`}
            className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#a3a3a3] hover:text-[#00ff87] hover:border-[#00ff87]/30 transition-all"
            aria-label="Email">
            <Mail size={16} />
          </a>
        </div>
        <p className="text-[#555] text-xs">© {new Date().getFullYear()} {personal.name}. All rights reserved.</p>
      </div>
    </footer>
  )
}
