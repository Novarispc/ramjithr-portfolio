import { getPublicContent } from '@/lib/storage'
import { ok, serverError } from '@/lib/api-utils'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const snap = await getPublicContent()
    return ok(snap, { headers: { 'cache-control': 'no-store' } })
  } catch {
    return serverError()
  }
}
