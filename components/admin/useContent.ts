'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchContent, saveSection } from '@/lib/admin-client'
import type { ContentDoc, ContentSnapshot, SectionKey } from '@/lib/content-schema'
import { useToast } from './Toast'

type SaveMode = 'draft' | 'publish'

export interface SectionController<K extends SectionKey> {
  loading: boolean
  saving: boolean
  dirty: boolean
  hasDraft: boolean
  value: ContentSnapshot[K] | null
  setValue: (next: ContentSnapshot[K]) => void
  save: (mode?: SaveMode) => Promise<void>
  reset: () => void
  reload: () => Promise<void>
  doc: ContentDoc | null
}

export function useSection<K extends SectionKey>(section: K): SectionController<K> {
  const { toast } = useToast()
  const [doc, setDoc] = useState<ContentDoc | null>(null)
  const [value, setValueState] = useState<ContentSnapshot[K] | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const baseRef = useRef<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const fresh = await fetchContent()
      const source = fresh.draft ?? fresh.published
      const initial = structuredClone(source[section]) as ContentSnapshot[K]
      setDoc(fresh)
      setValueState(initial)
      baseRef.current = JSON.stringify(initial)
      setDirty(false)
    } catch (err: any) {
      toast(`Failed to load: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }, [section, toast])

  useEffect(() => { load() }, [load])

  const setValue = useCallback((next: ContentSnapshot[K]) => {
    setValueState(next)
    setDirty(JSON.stringify(next) !== baseRef.current)
  }, [])

  const save = useCallback(async (mode: SaveMode = 'publish') => {
    if (!value) return
    setSaving(true)
    try {
      await saveSection(section, value, mode)
      baseRef.current = JSON.stringify(value)
      setDirty(false)
      toast(mode === 'publish' ? 'Saved and published' : 'Draft saved', 'success')
      await load()
    } catch (err: any) {
      toast(`Save failed: ${err.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }, [value, section, toast, load])

  const reset = useCallback(() => {
    try {
      const parsed = JSON.parse(baseRef.current) as ContentSnapshot[K]
      setValueState(parsed)
      setDirty(false)
    } catch {}
  }, [])

  return {
    loading,
    saving,
    dirty,
    hasDraft: !!doc?.draft,
    value,
    setValue,
    save,
    reset,
    reload: load,
    doc,
  }
}
