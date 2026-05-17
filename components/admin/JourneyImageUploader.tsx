'use client'
import { useRef, useState } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadImages, deleteUploadedFile } from '@/lib/admin-client'
import { useToast } from './Toast'
import type { JourneyImage } from '@/lib/content-schema'

interface Props {
  images: JourneyImage[]
  onChange: (next: JourneyImage[]) => void
}

export default function JourneyImageUploader({ images, onChange }: Props) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    try {
      const uploaded = await uploadImages(Array.from(files), 'journey')
      const next: JourneyImage[] = [
        ...images,
        ...uploaded.map(u => ({ id: u.id, url: u.url, caption: '' })),
      ]
      onChange(next)
      toast(`Uploaded ${uploaded.length} image${uploaded.length === 1 ? '' : 's'}`, 'success')
    } catch (err: any) {
      const map: Record<string, string> = {
        unsupported_type: 'Unsupported file type. Use JPEG, PNG, WebP, or GIF.',
        file_too_large: 'File too large (max 5MB each).',
        too_many_files: 'Too many files (max 10 per upload).',
        empty_file: 'Empty file rejected.',
      }
      toast(map[err.message] || `Upload failed: ${err.message}`, 'error')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function remove(img: JourneyImage) {
    onChange(images.filter(i => i.id !== img.id))
    const filename = img.url.split('/').pop()
    if (filename) deleteUploadedFile(filename, 'journey').catch(() => {})
  }

  function updateCaption(id: string, caption: string) {
    onChange(images.map(i => (i.id === id ? { ...i, caption } : i)))
  }

  return (
    <div>
      <div
        className={images.length > 8 ? 'scroll-list scroll-list--admin' : ''}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 10,
          marginBottom: 12,
          maxHeight: images.length > 8 ? 460 : undefined,
          overflowY: images.length > 8 ? 'auto' : 'visible',
          scrollbarGutter: images.length > 8 ? 'stable' : undefined,
        }}
      >
        {images.map(img => (
          <div key={img.id} style={{
            position: 'relative',
            background: 'var(--admin-surface-2)',
            border: '1px solid var(--admin-border)',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.caption || 'Travel photo'}
              loading="lazy"
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
            />
            <button
              type="button"
              onClick={() => remove(img)}
              aria-label="Remove image"
              style={{
                position: 'absolute', top: 6, right: 6,
                width: 24, height: 24, borderRadius: 6,
                background: 'rgba(0,0,0,0.7)', color: '#fff',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
            <input
              type="text"
              placeholder="Caption (optional)"
              value={img.caption || ''}
              onChange={e => updateCaption(img.id, e.target.value)}
              style={{
                width: '100%', padding: '6px 8px', fontSize: 11,
                background: 'var(--admin-surface)', border: 'none', borderTop: '1px solid var(--admin-border)',
                color: 'var(--admin-text)', outline: 'none',
              }}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            aspectRatio: '1',
            border: '1px dashed var(--admin-border-strong)',
            borderRadius: 10,
            background: 'transparent',
            color: 'var(--admin-muted)',
            cursor: uploading ? 'wait' : 'pointer',
            display: 'flex', flexDirection: 'column', gap: 6,
            alignItems: 'center', justifyContent: 'center',
            fontSize: 11,
          }}
        >
          {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--admin-subtle)' }}>
        <ImageIcon size={11} style={{ display: 'inline', marginRight: 4 }} />
        JPEG, PNG, WebP, GIF · max 5MB each · up to 10 per upload
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={e => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
    </div>
  )
}
