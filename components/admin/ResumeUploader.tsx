'use client'
import { useRef, useState } from 'react'
import { Upload, X, Loader2, FileText, ExternalLink, Link } from 'lucide-react'
import { uploadImages, deleteUploadedFile } from '@/lib/admin-client'
import { useToast } from './Toast'

interface Props {
  value: string
  onChange: (url: string) => void
}

export default function ResumeUploader({ value, onChange }: Props) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState<'upload' | 'url'>(value && !value.startsWith('/uploads/') && !value.includes('blob.vercel') ? 'url' : 'upload')
  const [urlDraft, setUrlDraft] = useState(tab === 'url' ? value : '')

  async function handleFile(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const [saved] = await uploadImages([file], 'resume')
      if (saved) {
        if (value && value.startsWith('/uploads/resume/')) {
          const old = value.split('/').pop()
          if (old) deleteUploadedFile(old, 'resume').catch(() => {})
        }
        onChange(saved.url)
        toast('Resume uploaded', 'success')
      }
    } catch (err: any) {
      const map: Record<string, string> = {
        unsupported_type: 'Only PDF files are supported.',
        file_too_large: 'File too large (max 10 MB).',
        empty_file: 'Empty file rejected.',
      }
      toast(map[err.message] || `Upload failed: ${err.message}`, 'error')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function remove() {
    if (value && value.startsWith('/uploads/resume/')) {
      const filename = value.split('/').pop()
      if (filename) deleteUploadedFile(filename, 'resume').catch(() => {})
    }
    onChange('')
    setUrlDraft('')
  }

  function applyUrl() {
    const url = urlDraft.trim()
    if (!url) { onChange(''); return }
    if (!/^https?:\/\/.+/.test(url)) {
      toast('Please enter a valid URL starting with https://', 'error')
      return
    }
    onChange(url)
    toast('Resume URL saved', 'success')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Tab switcher */}
      <div style={{
        display: 'inline-flex', borderRadius: 8, overflow: 'hidden',
        border: '1px solid var(--admin-border)', alignSelf: 'flex-start',
      }}>
        {(['upload', 'url'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '7px 14px', fontSize: 12, fontWeight: 600, border: 'none',
              background: tab === t ? 'var(--admin-accent-soft)' : 'transparent',
              color: tab === t ? 'var(--admin-accent)' : 'var(--admin-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {t === 'upload' ? <><Upload size={12} /> Upload File</> : <><Link size={12} /> Paste URL</>}
          </button>
        ))}
      </div>

      {tab === 'upload' ? (
        /* ── File upload panel ── */
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: 14,
          borderRadius: 10,
          border: `1px solid ${value && !urlDraft ? 'var(--admin-accent)' : 'var(--admin-border)'}`,
          background: value && !urlDraft ? 'var(--admin-accent-soft)' : 'var(--admin-surface-2)',
          transition: 'border-color 0.2s',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8, flexShrink: 0,
            background: 'var(--admin-surface)', border: '1px solid var(--admin-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: value ? 'var(--admin-accent)' : 'var(--admin-muted)',
          }}>
            <FileText size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {value && !urlDraft ? (
              <>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Resume uploaded</div>
                <a href={value} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: 'var(--admin-accent)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                  <ExternalLink size={10} /> Preview PDF
                </a>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>No file uploaded</div>
                <div style={{ fontSize: 11, color: 'var(--admin-muted)' }}>PDF only · max 10 MB · requires Vercel Blob storage</div>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="admin-btn">
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload PDF'}
            </button>
            {value && (
              <button type="button" onClick={remove} disabled={uploading} className="admin-btn admin-btn-danger">
                <X size={13} /> Remove
              </button>
            )}
          </div>
          <input ref={inputRef} type="file" accept="application/pdf"
            onChange={e => handleFile(e.target.files)} style={{ display: 'none' }} />
        </div>
      ) : (
        /* ── External URL panel ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--admin-muted)' }}>
            Paste a public link to your resume — Google Drive, Dropbox, OneDrive, LinkedIn, or any direct PDF URL.
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
            <button type="button" onClick={applyUrl} className="admin-btn admin-btn-primary">
              Apply
            </button>
            {value && (
              <button type="button" onClick={remove} className="admin-btn admin-btn-danger">
                <X size={13} /> Clear
              </button>
            )}
          </div>
          {value && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <span style={{ color: 'var(--admin-muted)' }}>Current:</span>
              <a href={value} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--admin-accent)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                <ExternalLink size={10} /> {value.length > 60 ? value.slice(0, 60) + '…' : value}
              </a>
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginTop: 2 }}>
            💡 For Google Drive: open the file → Share → Anyone with the link → copy link
          </div>
        </div>
      )}

    </div>
  )
}
