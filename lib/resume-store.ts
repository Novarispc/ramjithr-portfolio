import 'server-only'
import { promises as fs } from 'fs'
import path from 'path'
import { Redis } from '@upstash/redis'

const REDIS_ENABLED = !!(
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
)

const RESUME_KEY  = 'portfolio:resume:pdf'
const META_KEY    = 'portfolio:resume:meta'
const RESUME_DIR  = path.join(process.cwd(), 'data', 'resume')
const RESUME_FILE = path.join(RESUME_DIR, 'resume.pdf')

let _redis: Redis | null = null
function redis(): Redis {
  if (_redis) return _redis
  _redis = process.env.UPSTASH_REDIS_REST_URL
    ? Redis.fromEnv()
    : new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
  return _redis
}

export interface ResumeMeta {
  filename: string
  size: number
  uploadedAt: string
}

export async function saveResume(buffer: Buffer, originalName: string): Promise<void> {
  const meta: ResumeMeta = {
    filename: originalName,
    size: buffer.length,
    uploadedAt: new Date().toISOString(),
  }
  if (REDIS_ENABLED) {
    // Store as base64 string — Upstash Redis handles strings well
    await redis().set(RESUME_KEY, buffer.toString('base64'))
    await redis().set(META_KEY, JSON.stringify(meta))
    return
  }
  await fs.mkdir(RESUME_DIR, { recursive: true })
  await fs.writeFile(RESUME_FILE, buffer)
  await fs.writeFile(RESUME_FILE + '.meta.json', JSON.stringify(meta), 'utf8')
}

export async function getResume(): Promise<{ buffer: Buffer; meta: ResumeMeta } | null> {
  if (REDIS_ENABLED) {
    const [b64, metaRaw] = await Promise.all([
      redis().get<string>(RESUME_KEY),
      redis().get<string>(META_KEY),
    ])
    if (!b64) return null
    const meta: ResumeMeta = metaRaw
      ? (typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw)
      : { filename: 'resume.pdf', size: 0, uploadedAt: '' }
    return { buffer: Buffer.from(b64, 'base64'), meta }
  }
  try {
    const [buf, metaRaw] = await Promise.all([
      fs.readFile(RESUME_FILE),
      fs.readFile(RESUME_FILE + '.meta.json', 'utf8').catch(() => '{}'),
    ])
    const meta = JSON.parse(metaRaw)
    return { buffer: buf, meta: { filename: 'resume.pdf', size: buf.length, uploadedAt: '', ...meta } }
  } catch {
    return null
  }
}

export async function getResumeMeta(): Promise<ResumeMeta | null> {
  if (REDIS_ENABLED) {
    const raw = await redis().get<string>(META_KEY)
    if (!raw) return null
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  }
  try {
    const raw = await fs.readFile(RESUME_FILE + '.meta.json', 'utf8')
    return JSON.parse(raw)
  } catch { return null }
}

export async function deleteResume(): Promise<void> {
  if (REDIS_ENABLED) {
    await Promise.all([redis().del(RESUME_KEY), redis().del(META_KEY)])
    return
  }
  await Promise.all([
    fs.unlink(RESUME_FILE).catch(() => {}),
    fs.unlink(RESUME_FILE + '.meta.json').catch(() => {}),
  ])
}
