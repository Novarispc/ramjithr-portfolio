'use client'
import { Menu, Eye, FileEdit, Upload } from 'lucide-react'
import Link from 'next/link'
import { useAdminSidebar } from '@/app/admin/AdminShell'

interface Props {
  /** Optional override — by default the topbar opens the shared admin sidebar. */
  onMenu?: () => void
  hasDraft?: boolean
  onPublish?: () => void
  onDiscard?: () => void
  title?: string
}

export default function Topbar({ onMenu, hasDraft, onPublish, onDiscard, title }: Props) {
  const { setOpen } = useAdminSidebar()
  const handleMenu = onMenu ?? (() => setOpen(true))

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-2 sm:gap-3 px-3 sm:px-6 h-[60px]"
      style={{
        borderBottom: '1px solid var(--admin-border)',
        background: 'var(--admin-bg)',
      }}
    >
      <button
        onClick={handleMenu}
        className="admin-btn admin-btn-ghost md:hidden"
        style={{ height: 40, width: 40, padding: 0, flexShrink: 0 }}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <div className="flex-1 font-semibold text-sm truncate min-w-0">{title}</div>

      {hasDraft && (
        <div
          className="admin-chip hidden sm:inline-flex"
          style={{ color: 'var(--admin-warning)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
        >
          <FileEdit size={12} /> Draft pending
        </div>
      )}
      {hasDraft && onPublish && (
        <button onClick={onPublish} className="admin-btn admin-btn-primary" style={{ flexShrink: 0 }}>
          <Upload size={14} />
          <span className="hidden sm:inline">Publish</span>
        </button>
      )}
      {hasDraft && onDiscard && (
        <button onClick={onDiscard} className="admin-btn admin-btn-ghost hidden sm:inline-flex" style={{ flexShrink: 0 }}>
          Discard
        </button>
      )}
      <Link
        href="/"
        target="_blank"
        className="admin-btn admin-btn-ghost hidden sm:inline-flex"
        style={{ textDecoration: 'none', flexShrink: 0 }}
      >
        <Eye size={14} /> View site
      </Link>
      <Link
        href="/"
        target="_blank"
        className="admin-btn admin-btn-ghost sm:hidden"
        style={{ textDecoration: 'none', flexShrink: 0, height: 40, width: 40, padding: 0 }}
        aria-label="View site"
      >
        <Eye size={18} />
      </Link>
    </header>
  )
}
