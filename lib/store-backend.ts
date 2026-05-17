import 'server-only'
import { promises as fs } from 'fs'
import path from 'path'
import { Redis } from '@upstash/redis'
import type { ContentDoc } from './content-schema'

// ─────────────────────────────────────────────────────────────────────────────
// Backend selection: Upstash Redis (Vercel) when env vars exist, else local fs.
// ─────────────────────────────────────────────────────────────────────────────

const REDIS_ENABLED = !!(
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL
)

let _redis: Redis | null = null
function redis(): Redis {
  if (_redis) return _redis
  // Redis.fromEnv() reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
  // Vercel's integration also injects KV_REST_API_URL / KV_REST_API_TOKEN
  // which @upstash/redis recognises as aliases.
  _redis = process.env.UPSTASH_REDIS_REST_URL
    ? Redis.fromEnv()
    : new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!,
      })
  return _redis
}

const CURRENT_KEY = 'portfolio:content:current'
const HISTORY_KEY = 'portfolio:content:history'
const HISTORY_LIMIT = 30

const DATA_DIR = path.join(process.cwd(), 'data')
const CONTENT_FILE = path.join(DATA_DIR, 'content.json')
const HISTORY_DIR = path.join(DATA_DIR, 'history')

export const STORAGE_BACKEND: 'redis' | 'fs' = REDIS_ENABLED ? 'redis' : 'fs'

// ─── Read current ────────────────────────────────────────────────────────────
export async function backendReadCurrent(): Promise<ContentDoc | null> {
  if (REDIS_ENABLED) {
    const data = await redis().get<ContentDoc>(CURRENT_KEY)
    return data ?? null
  }
  try {
    const raw = await fs.readFile(CONTENT_FILE, 'utf8')
    return JSON.parse(raw) as ContentDoc
  } catch (err: any) {
    if (err?.code === 'ENOENT') return null
    throw err
  }
}

// ─── Write current (atomic) ──────────────────────────────────────────────────
export async function backendWriteCurrent(doc: ContentDoc): Promise<void> {
  if (REDIS_ENABLED) {
    await redis().set(CURRENT_KEY, doc)
    return
  }
  await fs.mkdir(DATA_DIR, { recursive: true })
  const tmp = CONTENT_FILE + '.tmp'
  await fs.writeFile(tmp, JSON.stringify(doc, null, 2), 'utf8')
  await fs.rename(tmp, CONTENT_FILE)
}

// ─── History (capped FIFO) ───────────────────────────────────────────────────
export interface HistoryRecord {
  id: string
  version: number
  updatedAt: string
  doc: ContentDoc
}

export async function backendPushHistory(prev: ContentDoc): Promise<void> {
  const rec: HistoryRecord = {
    id: `v${prev.version}-${prev.updatedAt.replace(/[:.]/g, '-')}`,
    version: prev.version,
    updatedAt: prev.updatedAt,
    doc: prev,
  }
  if (REDIS_ENABLED) {
    await redis().lpush(HISTORY_KEY, JSON.stringify(rec))
    await redis().ltrim(HISTORY_KEY, 0, HISTORY_LIMIT - 1)
    return
  }
  await fs.mkdir(HISTORY_DIR, { recursive: true })
  const file = path.join(HISTORY_DIR, `${rec.id}.json`)
  await fs.writeFile(file, JSON.stringify(rec.doc, null, 2), 'utf8')
  const entries = (await fs.readdir(HISTORY_DIR)).filter(f => f.endsWith('.json')).sort()
  if (entries.length > HISTORY_LIMIT) {
    const drop = entries.slice(0, entries.length - HISTORY_LIMIT)
    await Promise.all(drop.map(f => fs.unlink(path.join(HISTORY_DIR, f))))
  }
}

export async function backendListHistory(): Promise<{ id: string; version: number; updatedAt: string }[]> {
  if (REDIS_ENABLED) {
    const raw = await redis().lrange<string | HistoryRecord>(HISTORY_KEY, 0, HISTORY_LIMIT - 1)
    return raw.map(item => {
      const rec = typeof item === 'string' ? (JSON.parse(item) as HistoryRecord) : item
      return { id: rec.id, version: rec.version, updatedAt: rec.updatedAt }
    })
  }
  try {
    const files = (await fs.readdir(HISTORY_DIR)).filter(f => f.endsWith('.json'))
    const entries: { id: string; version: number; updatedAt: string }[] = []
    for (const f of files) {
      try {
        const raw = await fs.readFile(path.join(HISTORY_DIR, f), 'utf8')
        const parsed = JSON.parse(raw)
        entries.push({ id: f, version: parsed.version ?? 0, updatedAt: parsed.updatedAt ?? '' })
      } catch {}
    }
    return entries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  } catch {
    return []
  }
}

export async function backendReadHistoryDoc(id: string): Promise<ContentDoc | null> {
  if (REDIS_ENABLED) {
    const raw = await redis().lrange<string | HistoryRecord>(HISTORY_KEY, 0, HISTORY_LIMIT - 1)
    for (const item of raw) {
      const rec = typeof item === 'string' ? (JSON.parse(item) as HistoryRecord) : item
      if (rec.id === id) return rec.doc
    }
    return null
  }
  if (!/^[a-zA-Z0-9._-]+\.json$/.test(id)) throw new Error('Invalid history id')
  const file = path.join(HISTORY_DIR, id)
  try {
    const raw = await fs.readFile(file, 'utf8')
    return JSON.parse(raw) as ContentDoc
  } catch {
    return null
  }
}
