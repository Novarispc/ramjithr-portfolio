import { getResumeMeta } from '@/lib/resume-store'
import { ok, serverError } from '@/lib/api-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const meta = await getResumeMeta()
    return ok({ exists: !!meta, meta: meta ?? null })
  } catch {
    return serverError()
  }
}
