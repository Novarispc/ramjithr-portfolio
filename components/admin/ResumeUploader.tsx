'use client'
import { useEffect, useRef, useState } from 'react'
import { Upload, X, Loader2, FileText, Download, Link, ExternalLink } from 'lucide-react'
import { useToast } from './Toast'

interface ResumeMeta { filename: string; size: number; uploadedAt: string }

interface Props {
  /** The value stored in personal.resumeUrl — either '/api/resume' or an external https:// URL */
  value: string
  onChange: (url: string) => void
}

export default function ResumeUploader({ value, onChange }: Props) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving]   = useState(false)
  const [meta, setMeta]           = useState<ResumeMeta | null>(null)
  const [tab, setTab]             = useState<'upload' | 'url'>(
    value && !value.startsWith('/api/resume') ? 'url' : 'upload',
  )
  const [urlDraft, setUrlDraft] = useState(
    value && !value.startsWith('/api/resume') ? value : '',
  )

  // Load meta when on upload tab
  useEffect(() => {
    fetch('/api/resume/meta')
      .then(r => r.json())
      .then(d => setMeta(d.meta))
      .catch(() => {})
  }, [])

  async function handleFile(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { toast('Only PDF files are supported.', 'error'); return }
    if (file.size > 10 * 1024 * 1024) { toast('File too large (max 10 MB).', 'error'); return }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/resume', { method: 'POST', body: form })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'upload_failed')
      }
      const data = await res.json()
      setMeta({ filename: file.name, size: file.size, uploadedAt: new Date().toISOString() })
      onChange('/api/resume')
      toast('Resume uploaded successfully', 'success')
    } catch (err: any) {
      toast(`Upload failed: ${err.message}`, 'error')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function removeUpload() {
    setRemoving(true)
    try {
      await fetch('/api/resume', { method: 'DELETE' })
      setMeta(null)
      onChange('')
      toast('Resume removed', 'info')
    } catch {
      toast('Failed to remove resume', 'error')
    } finally {
      setRemoving(false)
    }
  }

  function applyUrl() {
    const url = urlDraft.trim()
    if (!url) { onChange(''); return }
    if (!/^https?:\/\/.+/.test(url)) {
      toast('Please enter a valid URL starting with https://', 'error')
      return
    }
    onChange(url)
    toast('Resume URL saved — click Save & publish to apply', 'success')
  }

  function formatBytes(b: number) {
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / 1024 / 1024).toFixed(2)} MB`
  }

  const hasUpload = !!meta
  const hasExternalUrl = value && !value.startsWith('/api/resume')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Tab switcher */}
      <div style={{
        display: 'inline-flex', borderRadius: 8, overflow: 'hidden',
        border: '1px solid var(--admin-border)', alignSelf: 'flex-start',
      }}>
        {(['upload', 'url'] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)} style={{
            padding: '7px 14px', fontSize: 12, fontWeight: 600, border: 'none',
            background: tab === t ? 'var(--admin-accent-soft)' : 'transparent',
            color: tab === t ? 'var(--admin-accent)' : 'var(--admin-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {t === 'upload' ? <><Upload size={12} /> Upload PDF</> : <><Link size={12} /> External URL</>}
          </button>
        ))}
      </div>

      {tab === 'upload' ? (
        <div style={{
          borderRadius: 12, border: `1px solid ${hasUpload ? 'var(--admin-accent)' : 'var(--admin-border)'}`,
          background: hasUpload ? 'var(--admin-accent-soft)' : 'var(--admin-surface-2)',
          padding: 16, transition: 'all 0.2s',
        }}>
          {hasUpload && meta ? (
            /* ── File stored ── */
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: 'rgba(0,255,135,0.12)', border: '1px solid rgba(0,255,135,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--admin-accent)',
              }}>
                <FileText size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--admin-text)', marginBottom: 3 }}>
                  {meta.filename}
                </div>
                <div style={{ fontSize: 11, color: 'var(--admin-muted)' }}>
                  {formatBytes(meta.size)}
                  {meta.uploadedAt && ` · uploaded ${new Date(meta.uploadedAt).toLocaleDateString()}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <a
                  href="/api/resume"
                  download
                  className="admin-btn admin-btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  <Download size={13} /> Download
                </a>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="admin-btn"
                >
                  {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  Replace
                </button>
                <button
                  type="button"
                  onClick={removeUpload}
                  disabled={removing}
                  className="admin-btn admin-btn-danger"
                >
                  {removing ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                  Remove
                </button>
              </div>
            </div>
          ) : (
            /* ── No file ── */
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: 'var(--admin-surface)', border: '1px solid var(--admin-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--admin-muted)',
              }}>
                <FileText size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>No resume uploaded</div>
                <div style={{ fontSize: 11, color: 'var(--admin-muted)' }}>PDF only · max 10 MB</div>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="admin-btn admin-btn-primary"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? 'Uploading…' : 'Upload PDF'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ── External URL ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--admin-muted)' }}>
            Paste a public link — Google Drive, Dropbox, OneDrive, or any direct PDF URL.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="url"
              className="admin-input"
              style={{ flex: 1 }}
              placeholder="https://drive.google.com/file/d/..."
              value={urlDraft}
              onChange={e => setUrlDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyUrl()}
            />
            <button type="button" onClick={applyUrl} className="admin-btn admin-btn-primary">Apply</button>
            {value && <button type="button" onClick={() => { onChange(''); setUrlDraft('') }} className="admin-btn admin-btn-danger"><X size={13} /></button>}
          </div>
          {hasExternalUrl && (
            <a href={value} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, color: 'var(--admin-accent)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              <ExternalLink size={10} /> {value.length > 70 ? value.slice(0, 70) + '…' : value}
            </a>
          )}
          <div style={{ fontSize: 11, color: 'var(--admin-muted)' }}>
            💡 Google Drive: open file → Share → Anyone with the link → Copy link
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept="application/pdf"
        onChange={e => handleFile(e.target.files)} style={{ display: 'none' }} />
    </div>
  )
}
