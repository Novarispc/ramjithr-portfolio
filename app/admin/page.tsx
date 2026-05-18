'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  User, Briefcase, Clock, FolderKanban, Sparkles, GraduationCap,
  Languages, Trophy, Database, ArrowRight, BarChart3, Layers, Globe,
} from 'lucide-react'
import SectionShell from '@/components/admin/SectionShell'
import { fetchContent } from '@/lib/admin-client'
import type { ContentDoc } from '@/lib/content-schema'

const CARDS = [
  { href: '/admin/personal',     label: 'Personal Info',   icon: User,           hint: 'Name, bio, contact' },
  { href: '/admin/career',       label: 'Career',          icon: Briefcase,      hint: 'Roles & achievements' },
  { href: '/admin/timeline',     label: 'Life Timeline',   icon: Clock,          hint: 'Year-based story' },
  { href: '/admin/projects',     label: 'Projects',        icon: FolderKanban,   hint: 'Portfolio items' },
  { href: '/admin/skills',       label: 'Skills',          icon: Sparkles,       hint: 'Categorized list' },
  { href: '/admin/education',    label: 'Education',       icon: GraduationCap,  hint: 'Degrees & certs' },
  { href: '/admin/languages',    label: 'Languages',       icon: Languages,      hint: 'Spoken languages' },
  { href: '/admin/achievements', label: 'Achievements',    icon: Trophy,         hint: 'Goal trackers' },
  { href: '/admin/globe',        label: 'Globe Settings',  icon: Globe,          hint: 'Layout & pin colors' },
  { href: '/admin/backup',       label: 'Backup & History',icon: Database,       hint: 'Export, import, undo' },
]

export default function OverviewPage() {
  const [doc, setDoc] = useState<ContentDoc | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => { fetchContent().then(setDoc).catch(() => {}) }, [])

  const counts = doc ? {
    career: doc.published.career.length,
    timeline: doc.published.timeline.length,
    projects: doc.published.projects.length,
    skills: doc.published.skillCategories.reduce((a, c) => a + c.skills.length, 0),
    achievements: doc.published.achievements.reduce((a, g) => a + g.items.length, 0),
  } : null

  return (
    <SectionShell
      title="Overview"
      subtitle="Edit your portfolio content — changes are versioned and reversible."
      hasDraft={!!doc?.draft}
      onMenu={() => setOpen(true)}
      onAfterPublish={() => fetchContent().then(setDoc).catch(() => {})}
    >
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12, marginBottom: 28,
      }}>
        <StatTile icon={Layers} label="Version" value={doc?.version ?? '—'} />
        <StatTile icon={Briefcase} label="Career entries" value={counts?.career ?? '—'} />
        <StatTile icon={Clock} label="Timeline events" value={counts?.timeline ?? '—'} />
        <StatTile icon={FolderKanban} label="Projects" value={counts?.projects ?? '—'} />
        <StatTile icon={Sparkles} label="Skills" value={counts?.skills ?? '—'} />
        <StatTile icon={BarChart3} label="Goal items" value={counts?.achievements ?? '—'} />
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12,
      }}>
        {CARDS.map(({ href, label, icon: Icon, hint }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div className="admin-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--admin-accent-soft)', color: 'var(--admin-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--admin-muted)' }}>{hint}</div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--admin-muted)' }} />
            </div>
          </Link>
        ))}
      </div>

      {doc && (
        <div className="admin-card" style={{ padding: 16, marginTop: 24, fontSize: 12, color: 'var(--admin-muted)' }}>
          Last update: <strong style={{ color: 'var(--admin-text)' }}>
            {new Date(doc.updatedAt).toLocaleString()}
          </strong>
        </div>
      )}
    </SectionShell>
  )
}

function StatTile({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="admin-card" style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--admin-muted)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        <Icon size={12} /> {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  )
}
