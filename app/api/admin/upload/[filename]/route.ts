import { NextRequest } from 'next/server'
import { deleteImage, parseTarget, UploadError } from '@/lib/uploads'
import { badRequest, ok, serverError } from '@/lib/api-utils'

export const runtime = 'nodejs'

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ filename: string }> },
) {
  try {
    const target = parseTarget(new URL(req.url).searchParams.get('target'))
    const { filename } = await ctx.params
    await deleteImage(filename, target)
    return ok({ ok: true })
  } catch (err) {
    if (err instanceof UploadError) return badRequest(err.code)
    return serverError()
  }
}
