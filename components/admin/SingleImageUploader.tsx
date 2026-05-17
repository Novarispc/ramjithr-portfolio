'use client'
import { useRef, useState } from 'react'
import { Upload, X, Loader2, User } from 'lucide-react'
import { uploadImages, deleteUploadedFile, type UploadTarget } from '@/lib/admin-client'
import { useToast } from './Toast'

interface Props {
  value: string
  onChange: (url: string) => void
  target?: UploadTarget
  shape?: 'circle' | 'square'
  size?: number
  label?: string
}

export default function SingleImageUploader({
  value, onChange, target = 'profile', shape = 'circle', size = 120, label,
}: Props) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const [saved] = await uploadImages([file], target)
      if (saved) {
        // Best-effort delete of the previous file if it lived under our uploads dir.
        if (value && value.startsWith(`/uploads/${target}/`)) {
          const oldFilename = value.split('/').pop()
          if (oldFilename) deleteUploadedFile(oldFilename, target).catch(() => {})
        }
        onChange(saved.url)
        toast('Photo updated', 'success')
      }
    } catch (err: any) {
      const map: Record<string, string> = {
        unsupported_type: 'Use JPEG, PNG, WebP, or GIF.',
        file_too_large: 'File too large (max 5MB).',
        empty_file: 'Empty file rejected.',
      }
      toast(map[err.message] || `Upload failed: ${err.message}`, 'error')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function remove() {
    if (value && value.startsWith(`/uploads/${target}/`)) {
      const filename = value.split('/').pop()
      if (filename) deleteUploadedFile(filename, target).catch(() => {})
    }
    onChange('')
  }

  const radius = shape === 'circle' ? size / 2 : 14

  return (
    <div>
      {label && (
        <div style={{
          fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em',
          color: 'var(--admin-muted)', fontWeight: 600, marginBottom: 8,
        }}>{label}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            position: 'relative',
            width: size,
            height: size,
            borderRadius: radius,
            background: 'var(--admin-surface-2)',
            border: '1px solid var(--admin-border-strong)',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--admin-subtle)',
          }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <User size={size * 0.4} />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="admin-btn"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? 'Uploading…' : (value ? 'Replace' : 'Upload photo')}
            </button>
            {value && (
              <button
                type="button"
                onClick={remove}
                className="admin-btn admin-btn-danger"
                disabled={uploading}
              >
                <X size={14} /> Remove
              </button>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--admin-subtle)', lineHeight: 1.5 }}>
            JPEG, PNG, WebP, or GIF · max 5MB · square images crop best.
            {value && !value.startsWith(`/uploads/${target}/`) && (
              <span style={{ display: 'block', marginTop: 4, color: 'var(--admin-warning)' }}>
                External URL — Remove will not delete the file.
              </span>
            )}
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={e => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
    </div>
  )
}
