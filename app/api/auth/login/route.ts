import { NextRequest } from 'next/server'
import { z } from 'zod'
import { issueSession, setSessionCookie, verifyCredentials } from '@/lib/auth'
import { badRequest, handleZod, ok, serverError } from '@/lib/api-utils'

export const runtime = 'nodejs'

const Body = z.object({
  username: z.string().min(1).max(120),
  password: z.string().min(1).max(200),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null)
    const parsed = Body.parse(json)
    const valid = await verifyCredentials(parsed.username, parsed.password)
    if (!valid) {
      await new Promise(r => setTimeout(r, 400))
      return badRequest('invalid_credentials')
    }
    const token = await issueSession(parsed.username)
    await setSessionCookie(token)
    return ok({ ok: true })
  } catch (err) {
    const z = handleZod(err)
    if (z) return z
    return serverError()
  }
}
