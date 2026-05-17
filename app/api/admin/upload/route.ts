import { NextRequest } from 'next/server'
import { parseTarget, saveImage, UploadError } from '@/lib/uploads'
import { badRequest, ok, serverError } from '@/lib/api-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const target = parseTarget(new URL(req.url).searchParams.get('target'))
    const form = await req.formData().catch(() => null)
    if (!form) return badRequest('invalid_form_data')
    const files = form.getAll('files').filter((f): f is File => f instanceof File)
    if (!files.length) return badRequest('no_files')
    if (files.length > 10) return badRequest('too_many_files')

    const saved = []
    for (const file of files) {
      saved.push(await saveImage(file, target))
    }
    return ok({ uploaded: saved })
  } catch (err) {
    if (err instanceof UploadError) return badRequest(err.code)
    return serverError()
  }
}
