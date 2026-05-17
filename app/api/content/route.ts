import { getContent } from '@/lib/storage'
import { ok, serverError } from '@/lib/api-utils'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const doc = await getContent()
    return ok(doc, { headers: { 'cache-control': 'no-store' } })
  } catch {
    return serverError()
  }
}
