import { NextRequest } from 'next/server'
import { z } from 'zod'
import { listHistory, restoreHistory } from '@/lib/storage'
import { badRequest, handleZod, ok, serverError } from '@/lib/api-utils'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const entries = await listHistory()
    return ok({ entries })
  } catch {
    return serverError()
  }
}

const Body = z.object({ id: z.string().min(1).max(200) })

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null)
    const { id } = Body.parse(json)
    const doc = await restoreHistory(id)
    return ok({ ok: true, version: doc.version, updatedAt: doc.updatedAt })
  } catch (err) {
    const z = handleZod(err)
    if (z) return z
    return badRequest('restore_failed')
  }
}
