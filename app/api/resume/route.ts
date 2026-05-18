import { NextRequest, NextResponse } from 'next/server'
import { getResume, saveResume, deleteResume } from '@/lib/resume-store'
import { requireAdmin, AuthError } from '@/lib/auth'
import { ok, serverError, badRequest } from '@/lib/api-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

/** GET /api/resume — serve the stored PDF */
export async function GET() {
  try {
    const result = await getResume()
    if (!result) {
      return new NextResponse('No resume uploaded', { status: 404 })
    }
    const { buffer, meta } = result
    const filename = encodeURIComponent(meta.filename || 'resume.pdf')
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return serverError()
  }
}

function unauthorized() {
  return new NextResponse('Unauthorized', { status: 401 })
}

/** POST /api/resume — upload a new PDF (admin only) */
export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch (e) {
    if (e instanceof AuthError) return unauthorized()
    throw e
  }

  try {
    const form = await req.formData().catch(() => null)
    if (!form) return badRequest('invalid_form_data')

    const file = form.get('file')
    if (!(file instanceof File)) return badRequest('no_file')
    if (file.type !== 'application/pdf') return badRequest('not_pdf')
    if (file.size > MAX_BYTES) return badRequest('file_too_large')
    if (file.size === 0) return badRequest('empty_file')

    const buffer = Buffer.from(await file.arrayBuffer())
    await saveResume(buffer, file.name || 'resume.pdf')

    return ok({ ok: true, size: file.size, filename: file.name })
  } catch {
    return serverError()
  }
}

/** DELETE /api/resume — remove the stored PDF (admin only) */
export async function DELETE(req: NextRequest) {
  try { await requireAdmin() } catch (e) {
    if (e instanceof AuthError) return unauthorized()
    throw e
  }

  try {
    await deleteResume()
    return ok({ ok: true })
  } catch {
    return serverError()
  }
}
