'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, User, Briefcase, Clock, FolderKanban, Sparkles,
  GraduationCap, Languages, Trophy, Database, LogOut, Moon, Sun, X, Globe, Settings2,
} from 'lucide-react'
import { logout } from '@/lib/admin-client'
import { useAdminTheme } from './AdminTheme'

const LINKS = [
  { href: '/admin',                label: 'Overview',       icon: LayoutDashboard },
  { href: '/admin/personal',       label: 'Personal Info',  icon: User },
  { href: '/admin/career',         label: 'Career',         icon: Briefcase },
  { href: '/admin/timeline',       label: 'Life Timeline',  icon: Clock },
  { href: '/admin/projects',       label: 'Projects',       icon: FolderKanban },
  { href: '/admin/skills',         label: 'Skills',         icon: Sparkles },
  { href: '/admin/education',      label: 'Education',      icon: GraduationCap },
  { href: '/admin/languages',      label: 'Languages',      icon: Languages },
  { href: '/admin/achievements',   label: 'Achievements',   icon: Trophy },
  { href: '/admin/journey',        label: 'Global Journey', icon: Globe },
  { href: '/admin/globe',          label: 'Globe Settings',  icon: Settings2 },
  { href: '/admin/backup',         label: 'Backup & History', icon: Database },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggle } = useAdminTheme()

  async function handleLogout() {
    await logout()
    router.replace('/admin/login')
  }

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40,
          }}
          className="md:hidden"
        />
      )}
      <aside
        style={{
          background: 'var(--admin-surface)',
          borderRight: '1px solid var(--admin-border)',
          width: 248,
          height: '100vh',
          position: 'fixed',
          top: 0, left: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transform: open ? 'translateX(0)' : undefined,
        }}
        className={`transition-transform duration-200 ${open ? '' : '-translate-x-full md:translate-x-0'}`}
      >
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--admin-accent-soft)',
              border: '1px solid var(--admin-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--admin-accent)', fontWeight: 700, fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
            }}>R</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Admin Studio</div>
              <div style={{ fontSize: 11, color: 'var(--admin-muted)' }}>Portfolio CMS</div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden admin-btn-ghost admin-btn"
            style={{ height: 32, width: 32, padding: 0 }}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 12px', borderRadius: 9, marginBottom: 2,
                  fontSize: 13, fontWeight: 500,
                  background: active ? 'var(--admin-accent-soft)' : 'transparent',
                  color: active ? 'var(--admin-accent)' : 'var(--admin-text)',
                  transition: 'background 0.15s',
                }}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div style={{ borderTop: '1px solid var(--admin-border)', padding: 12, display: 'flex', gap: 8 }}>
          <button onClick={toggle} className="admin-btn admin-btn-ghost" style={{ flex: 1 }}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button onClick={handleLogout} className="admin-btn admin-btn-ghost" style={{ flex: 1 }}>
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
