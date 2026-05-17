import { getSession } from '@/lib/auth'
import { ok, unauthorized } from '@/lib/api-utils'

export const runtime = 'nodejs'

export async function GET() {
  const session = await getSession()
  if (!session) return unauthorized()
  return ok({ username: session.sub, role: session.role })
}
