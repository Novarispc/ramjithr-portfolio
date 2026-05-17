import 'server-only'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const TOKEN_COOKIE = 'admin_session'
const TOKEN_TTL_SECONDS = 60 * 60 * 8 // 8 hours

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_JWT_SECRET must be set (>=32 chars). See README.')
  }
  return new TextEncoder().encode(secret)
}

function getCredentials(): { username: string; passwordHash: string } {
  const username = process.env.ADMIN_USERNAME
  const passwordHash = process.env.ADMIN_PASSWORD_HASH
  const plain = process.env.ADMIN_PASSWORD
  if (!username) throw new Error('ADMIN_USERNAME must be set')
  if (passwordHash) return { username, passwordHash }
  if (plain) return { username, passwordHash: bcrypt.hashSync(plain, 12) }
  throw new Error('ADMIN_PASSWORD_HASH or ADMIN_PASSWORD must be set')
}

export interface SessionPayload extends JWTPayload {
  sub: string
  role: 'admin'
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const creds = getCredentials()
  if (username !== creds.username) {
    await bcrypt.compare(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi')
    return false
  }
  return bcrypt.compare(password, creds.passwordHash)
}

export async function issueSession(username: string): Promise<string> {
  return new SignJWT({ sub: username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS)
    .sign(getSecret())
}

export async function readSession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.role !== 'admin' || !payload.sub) return null
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies()
  const token = jar.get(TOKEN_COOKIE)?.value
  return readSession(token)
}

export async function setSessionCookie(token: string) {
  const jar = await cookies()
  jar.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TOKEN_TTL_SECONDS,
  })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(TOKEN_COOKIE)
}

export const SESSION_COOKIE = TOKEN_COOKIE
export const SESSION_TTL_SECONDS = TOKEN_TTL_SECONDS

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) throw new AuthError('unauthorized')
  return session
}

export class AuthError extends Error {
  constructor(public reason: 'unauthorized' | 'forbidden' | 'invalid') {
    super(reason)
  }
}
