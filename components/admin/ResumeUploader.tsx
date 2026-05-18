'use client'
import { useRef, useState } from 'react'
import { Upload, X, Loader2, FileText, ExternalLink } from 'lucide-react'
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
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        borderRadius: 10,
        border: `1px solid ${value ? 'var(--admin-accent)' : 'var(--admin-border)'}`,
        background: value ? 'var(--admin-accent-soft)' : 'var(--admin-surface-2)',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: value ? 'rgba(0,255,135,0.15)' : 'var(--admin-surface)',
        border: '1px solid var(--admin-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: value ? 'var(--admin-accent)' : 'var(--admin-muted)',
      }}>
        <FileText size={20} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {value ? (
          <>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--admin-text)', marginBottom: 2 }}>
              Resume uploaded
            </div>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11, color: 'var(--admin-accent)',
                display: 'inline-flex', alignItems: 'center', gap: 4,
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={10} /> Preview PDF
            </a>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--admin-text)', marginBottom: 2 }}>
              No resume uploaded
            </div>
            <div style={{ fontSize: 11, color: 'var(--admin-muted)' }}>
              PDF only · max 10 MB
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="admin-btn admin-btn-primary"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload PDF'}
        </button>
        {value && (
          <button
            type="button"
            onClick={remove}
            disabled={uploading}
            className="admin-btn admin-btn-danger"
          >
            <X size={14} /> Remove
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={e => handleFile(e.target.files)}
        style={{ display: 'none' }}
      />
    </div>
  )
}
