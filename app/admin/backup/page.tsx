'use client'
import { useEffect, useRef, useState } from 'react'
import { Download, Upload, RotateCcw, Loader2, History, Eye } from 'lucide-react'
import Link from 'next/link'
import SectionShell from '@/components/admin/SectionShell'
import { useToast } from '@/components/admin/Toast'
import {
  fetchContent, importBackup, listHistory, restoreHistory,
} from '@/lib/admin-client'
import type { ContentDoc } from '@/lib/content-schema'

interface Entry { id: string; version: number; updatedAt: string }

export default function BackupPage() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [doc, setDoc] = useState<ContentDoc | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function refresh() {
    const [d, h] = await Promise.all([
      fetchContent().catch(() => null),
      listHistory().catch(() => ({ entries: [] })),
    ])
    setDoc(d)
    setEntries(h.entries)
  }

  useEffect(() => { refresh() }, [])

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm(`Replace ALL content with the contents of "${file.name}"? This is reversible via history.`)) {
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setBusy(true)
    try {
      await importBackup(file)
      toast('Backup imported', 'success')
      await refresh()
    } catch (err: any) {
      toast(`Import failed: ${err.message}`, 'error')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function restore(id: string) {
    if (!confirm('Restore this version? Current content will be archived first.')) return
    setBusy(true)
    try {
      await restoreHistory(id)
      toast('Version restored', 'success')
      await refresh()
    } catch (err: any) {
      toast(`Restore failed: ${err.message}`, 'error')
    } finally { setBusy(false) }
  }

  return (
    <SectionShell
      title="Backup & History"
      subtitle="Export, import, and roll back to previous versions."
      onMenu={() => setOpen(true)}
      hasDraft={!!doc?.draft}
      onAfterPublish={refresh}
    >
      <div className="admin-card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Export / Import</h3>
        <p style={{ fontSize: 13, color: 'var(--admin-muted)', marginBottom: 16 }}>
          Download a JSON snapshot of your portfolio, or upload one to replace current content.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="/api/backup/export" className="admin-btn admin-btn-primary" style={{ textDecoration: 'none' }}>
            <Download size={14} /> Export backup (.json)
          </a>
          <button onClick={() => fileRef.current?.click()} className="admin-btn" disabled={busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={onImport}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div className="admin-card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={14} /> Version history
        </h3>
        <p style={{ fontSize: 13, color: 'var(--admin-muted)', marginBottom: 16 }}>
          Up to 30 most recent snapshots, oldest auto-pruned.
        </p>
        {entries.length === 0 ? (
          <div className="admin-empty">No history yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map(entry => (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', background: 'var(--admin-surface-2)', borderRadius: 9,
              }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--admin-muted)', minWidth: 60 }}>
                  v{entry.version}
                </div>
                <div style={{ flex: 1, fontSize: 13 }}>
                  {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : entry.id}
                </div>
                <button onClick={() => restore(entry.id)} className="admin-btn" disabled={busy}>
                  <RotateCcw size={13} /> Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Eye size={14} /> Analytics
        </h3>
        <p style={{ fontSize: 13, color: 'var(--admin-muted)', marginBottom: 12 }}>
          Placeholder for future page-view / engagement metrics. Wire up Plausible, Vercel Analytics, or Umami here.
        </p>
        <div className="admin-empty" style={{ padding: 16 }}>
          Analytics provider not configured.
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--admin-muted)' }}>
          <Link href="/" target="_blank" style={{ color: 'var(--admin-accent)' }}>Open public site →</Link>
        </div>
      </div>
    </SectionShell>
  )
}
