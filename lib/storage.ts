import 'server-only'
import { ContentSchema, type ContentDoc, type ContentSnapshot } from './content-schema'
import { SEED_CONTENT } from './seed-content'
import {
  backendReadCurrent,
  backendWriteCurrent,
  backendPushHistory,
  backendListHistory,
  backendReadHistoryDoc,
} from './store-backend'

let writeLock: Promise<unknown> = Promise.resolve()

function freshDoc(): ContentDoc {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    published: structuredClone(SEED_CONTENT),
    draft: undefined,
  }
}

async function readRaw(): Promise<ContentDoc> {
  const stored = await backendReadCurrent()
  if (stored) return ContentSchema.parse(stored)
  const doc = freshDoc()
  await backendWriteCurrent(doc)
  return doc
}

async function writeRaw(doc: ContentDoc) {
  await backendWriteCurrent(doc)
}

export async function getContent(): Promise<ContentDoc> {
  return readRaw()
}

export async function getPublicContent(): Promise<ContentSnapshot> {
  const doc = await readRaw()
  return doc.published
}

export type UpdateMode = 'draft' | 'publish'

export async function updateContent(
  mutator: (snapshot: ContentSnapshot) => ContentSnapshot | Promise<ContentSnapshot>,
  mode: UpdateMode = 'publish',
): Promise<ContentDoc> {
  writeLock = writeLock.then(async () => {
    const current = await readRaw()
    const base = mode === 'draft'
      ? (current.draft ?? structuredClone(current.published))
      : structuredClone(current.published)
    const next = await mutator(base)
    const validated = ContentSchema.shape.published.parse(next)

    await backendPushHistory(current)

    const updated: ContentDoc =
      mode === 'draft'
        ? {
            ...current,
            updatedAt: new Date().toISOString(),
            draft: validated,
          }
        : {
            version: current.version + 1,
            updatedAt: new Date().toISOString(),
            published: validated,
            draft: undefined,
          }

    await writeRaw(updated)
    return updated
  })
  return writeLock as Promise<ContentDoc>
}

export async function publishDraft(): Promise<ContentDoc> {
  return updateContent(async snap => {
    const current = await readRaw()
    return current.draft ?? snap
  }, 'publish')
}

export async function discardDraft(): Promise<ContentDoc> {
  writeLock = writeLock.then(async () => {
    const current = await readRaw()
    if (!current.draft) return current
    const updated = { ...current, draft: undefined, updatedAt: new Date().toISOString() }
    await writeRaw(updated)
    return updated
  })
  return writeLock as Promise<ContentDoc>
}

export async function replaceContent(snapshot: ContentSnapshot): Promise<ContentDoc> {
  return updateContent(() => snapshot, 'publish')
}

export interface HistoryEntry {
  id: string
  version: number
  updatedAt: string
}

export async function listHistory(): Promise<HistoryEntry[]> {
  return backendListHistory()
}

export async function restoreHistory(id: string): Promise<ContentDoc> {
  const doc = await backendReadHistoryDoc(id)
  if (!doc) throw new Error('history_not_found')
  const parsed = ContentSchema.parse(doc)
  return replaceContent(parsed.published)
}
