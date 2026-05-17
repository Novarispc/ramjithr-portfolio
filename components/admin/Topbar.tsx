'use client'
import { Menu, Eye, FileEdit, Upload } from 'lucide-react'
import Link from 'next/link'

interface Props {
  onMenu: () => void
  hasDraft?: boolean
  onPublish?: () => void
  onDiscard?: () => void
  title?: string
}

export default function Topbar({ onMenu, hasDraft, onPublish, onDiscard, title }: Props) {
  return (
    <header
      style={{
        height: 60,
        borderBottom: '1px solid var(--admin-border)',
        background: 'var(--admin-bg)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <button
        onClick={onMenu}
        className="admin-btn admin-btn-ghost md:hidden"
        style={{ height: 36, width: 36, padding: 0 }}
        aria-label="Menu"
      >
        <Menu size={18} />
      </button>
      <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{title}</div>

      {hasDraft && (
        <div className="admin-chip" style={{ color: 'var(--admin-warning)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <FileEdit size={12} /> Draft pending
        </div>
      )}
      {hasDraft && onPublish && (
        <button onClick={onPublish} className="admin-btn admin-btn-primary">
          <Upload size={14} /> Publish
        </button>
      )}
      {hasDraft && onDiscard && (
        <button onClick={onDiscard} className="admin-btn admin-btn-ghost">
          Discard
        </button>
      )}
      <Link href="/" target="_blank" className="admin-btn admin-btn-ghost" style={{ textDecoration: 'none' }}>
        <Eye size={14} /> View site
      </Link>
    </header>
  )
}
