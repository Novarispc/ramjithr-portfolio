import 'server-only'
import { promises as fs } from 'fs'
import path from 'path'
import { put, del } from '@vercel/blob'
import type { UploadTarget } from './uploads-types'

const BLOB_ENABLED = !!process.env.BLOB_READ_WRITE_TOKEN

export const UPLOAD_BACKEND: 'blob' | 'fs' = BLOB_ENABLED ? 'blob' : 'fs'

function fsRoot(target: UploadTarget) {
  return path.join(process.cwd(), 'public', 'uploads', target)
}
function fsPublicPrefix(target: UploadTarget) {
  return `/uploads/${target}`
}

export async function backendSaveImage(
  target: UploadTarget,
  filename: string,
  body: Buffer,
  mime: string,
): Promise<{ url: string }> {
  if (BLOB_ENABLED) {
    const blob = await put(`${target}/${filename}`, body, {
      access: 'public',
      contentType: mime,
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    })
    return { url: blob.url }
  }
  await fs.mkdir(fsRoot(target), { recursive: true })
  const filepath = path.join(fsRoot(target), filename)
  await fs.writeFile(filepath, body)
  return { url: `${fsPublicPrefix(target)}/${filename}` }
}

export async function backendDeleteImage(target: UploadTarget, filename: string): Promise<void> {
  if (BLOB_ENABLED) {
    // del() accepts the pathname stored under the blob store.
    try {
      await del(`${target}/${filename}`)
    } catch {
      // Best-effort — ignore missing files.
    }
    return
  }
  const filepath = path.join(fsRoot(target), filename)
  try {
    await fs.unlink(filepath)
  } catch (err: any) {
    if (err?.code !== 'ENOENT') throw err
  }
}
