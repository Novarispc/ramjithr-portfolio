'use client'
import { ReactNode } from 'react'

interface FieldProps {
  label: string
  hint?: string
  error?: string
  children: ReactNode
  inline?: boolean
}

export function Field({ label, hint, error, children, inline }: FieldProps) {
  return (
    <div style={{ marginBottom: inline ? 0 : 14 }}>
      <label className="admin-label">{label}</label>
      {children}
      {hint && !error && (
        <div style={{ fontSize: 11, color: 'var(--admin-subtle)', marginTop: 6 }}>{hint}</div>
      )}
      {error && (
        <div style={{ fontSize: 11, color: 'var(--admin-danger)', marginTop: 6 }}>{error}</div>
      )}
    </div>
  )
}

interface TagInputProps {
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}

export function TagInput({ values, onChange, placeholder = 'Add and press Enter' }: TagInputProps) {
  return (
    <div className="admin-tag-input">
      {values.map((v, i) => (
        <span key={`${v}-${i}`} className="admin-tag">
          {v}
          <button
            type="button"
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
            aria-label={`Remove ${v}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        placeholder={placeholder}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            const value = (e.currentTarget.value || '').trim()
            if (value && !values.includes(value)) onChange([...values, value])
            e.currentTarget.value = ''
          } else if (e.key === 'Backspace' && !e.currentTarget.value && values.length) {
            onChange(values.slice(0, -1))
          }
        }}
      />
    </div>
  )
}

interface ListEditorProps {
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  maxVisible?: number
}

import ScrollList from '@/components/ui/ScrollList'

export function ListEditor({ values, onChange, placeholder = 'New item', maxVisible = 7 }: ListEditorProps) {
  return (
    <div>
      <ScrollList
        maxVisible={maxVisible}
        theme="admin"
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {values.map((v, i) => (
          <div key={i} style={{ display: 'flex', gap: 8 }}>
            <input
              className="admin-input"
              value={v}
              onChange={e => {
                const next = [...values]
                next[i] = e.target.value
                onChange(next)
              }}
            />
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              aria-label="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </ScrollList>
      <button
        type="button"
        className="admin-btn"
        style={{ marginTop: 8 }}
        onClick={() => onChange([...values, ''])}
      >
        + {placeholder}
      </button>
    </div>
  )
}
