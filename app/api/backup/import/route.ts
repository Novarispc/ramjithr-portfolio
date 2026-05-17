import { NextRequest } from 'next/server'
import { ContentSchema } from '@/lib/content-schema'
import { replaceContent } from '@/lib/storage'
import { badRequest, handleZod, ok, serverError } from '@/lib/api-utils'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null)
    if (json === null) return badRequest('invalid_json')
    const parsed = ContentSchema.parse(json)
    const doc = await replaceContent(parsed.published)
    return ok({ ok: true, version: doc.version, updatedAt: doc.updatedAt })
  } catch (err) {
    const z = handleZod(err)
    if (z) return z
    return serverError()
  }
}
