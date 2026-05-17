import { discardDraft, publishDraft } from '@/lib/storage'
import { ok, serverError } from '@/lib/api-utils'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const doc = await publishDraft()
    return ok({ ok: true, version: doc.version, updatedAt: doc.updatedAt })
  } catch {
    return serverError()
  }
}

export async function DELETE() {
  try {
    const doc = await discardDraft()
    return ok({ ok: true, version: doc.version, updatedAt: doc.updatedAt })
  } catch {
    return serverError()
  }
}
