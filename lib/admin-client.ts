'use client'

import type { ContentDoc, ContentSnapshot, SectionKey } from './content-schema'

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let payload: any = null
    try { payload = await res.json() } catch {}
    const message = payload?.error || `request_failed_${res.status}`
    const err = new Error(message)
    ;(err as any).status = res.status
    ;(err as any).details = payload?.details
    throw err
  }
  return res.json() as Promise<T>
}

export async function fetchContent(): Promise<ContentDoc> {
  const res = await fetch('/api/content', { cache: 'no-store' })
  return handle<ContentDoc>(res)
}

export async function saveSection<K extends SectionKey>(
  section: K,
  value: ContentSnapshot[K],
  mode: 'draft' | 'publish' = 'publish',
) {
  const res = await fetch(`/api/content/${section}?mode=${mode}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value),
    cache: 'no-store',
  })
  return handle<{ ok: true; version: number; updatedAt: string }>(res)
}

export async function publishDraft() {
  const res = await fetch('/api/content/publish', { method: 'POST', cache: 'no-store' })
  return handle<{ ok: true; version: number; updatedAt: string }>(res)
}

export async function discardDraft() {
  const res = await fetch('/api/content/publish', { method: 'DELETE', cache: 'no-store' })
  return handle<{ ok: true; version: number; updatedAt: string }>(res)
}

export async function listHistory() {
  const res = await fetch('/api/content/history', { cache: 'no-store' })
  return handle<{ entries: { id: string; version: number; updatedAt: string }[] }>(res)
}

export async function restoreHistory(id: string) {
  const res = await fetch('/api/content/history', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  return handle<{ ok: true; version: number; updatedAt: string }>(res)
}

export interface UploadedFile {
  id: string
  filename: string
  url: string
  size: number
  mime: string
}

export type UploadTarget = 'journey' | 'profile' | 'projects'

export async function uploadImages(files: File[], target: UploadTarget = 'journey'): Promise<UploadedFile[]> {
  const form = new FormData()
  for (const f of files) form.append('files', f)
  const res = await fetch(`/api/admin/upload?target=${target}`, { method: 'POST', body: form })
  const data = await handle<{ uploaded: UploadedFile[] }>(res)
  return data.uploaded
}

export async function deleteUploadedFile(filename: string, target: UploadTarget = 'journey'): Promise<void> {
  const res = await fetch(`/api/admin/upload/${encodeURIComponent(filename)}?target=${target}`, { method: 'DELETE' })
  await handle<{ ok: true }>(res)
}

export async function importBackup(file: File) {
  const text = await file.text()
  const json = JSON.parse(text)
  const res = await fetch('/api/backup/import', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(json),
  })
  return handle<{ ok: true; version: number; updatedAt: string }>(res)
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' })
}

export async function login(username: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return handle<{ ok: true }>(res)
}

export function newId(prefix = 'id'): string {
  const rand = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2))
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 10)
  return `${prefix}-${rand}`
}
