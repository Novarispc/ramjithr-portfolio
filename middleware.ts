import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = 'admin_session'

function getSecret(): Uint8Array | null {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret || secret.length < 32) return null
  return new TextEncoder().encode(secret)
}

async function isAuthed(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const secret = getSecret()
  if (!secret) return false
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.role === 'admin' && typeof payload.sub === 'string'
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(SESSION_COOKIE)?.value
  const authed = await isAuthed(token)

  if (pathname === '/admin/login') {
    if (authed) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin'
      url.search = ''
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    if (!authed) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      url.search = `?from=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(url)
    }
    const res = NextResponse.next()
    res.headers.set('x-robots-tag', 'noindex, nofollow, noarchive')
    return res
  }

  if (
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/content') ||
    pathname.startsWith('/api/backup')
  ) {
    if (req.method === 'GET' && pathname === '/api/content/public') {
      return NextResponse.next()
    }
    if (!authed) {
      return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/content/:path*', '/api/backup/:path*'],
}
