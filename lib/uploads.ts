import 'server-only'
import crypto from 'crypto'
import { backendSaveImage, backendDeleteImage } from './upload-backend'
import { ALLOWED_TARGETS, type UploadTarget } from './uploads-types'

export type { UploadTarget } from './uploads-types'

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg':       'jpg',
  'image/png':        'png',
  'image/webp':       'webp',
  'image/gif':        'gif',
  'application/pdf':  'pdf',
}

const MAX_BYTES_IMAGE  = 5  * 1024 * 1024 // 5MB
const MAX_BYTES_RESUME = 10 * 1024 * 1024 // 10MB

export interface SavedFile {
  id: string
  filename: string
  url: string
  size: number
  mime: string
}

export function parseTarget(raw: string | null | undefined): UploadTarget {
  const v = (raw || 'journey').toLowerCase() as UploadTarget
  if (!ALLOWED_TARGETS.includes(v)) throw new UploadError('invalid_target')
  return v
}

export async function saveImage(file: File, target: UploadTarget = 'journey'): Promise<SavedFile> {
  const mime = (file.type || '').toLowerCase()
  const ext = ALLOWED_MIME[mime]
  if (!ext) throw new UploadError('unsupported_type')
  const maxBytes = target === 'resume' ? MAX_BYTES_RESUME : MAX_BYTES_IMAGE
  if (file.size > maxBytes) throw new UploadError('file_too_large')
  if (file.size === 0) throw new UploadError('empty_file')

  const id = crypto.randomBytes(10).toString('hex')
  const filename = `${id}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { url } = await backendSaveImage(target, filename, buffer, mime)

  return { id, filename, url, size: file.size, mime }
}

export async function deleteImage(filename: string, target: UploadTarget = 'journey') {
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) throw new UploadError('invalid_filename')
  await backendDeleteImage(target, filename)
}

export class UploadError extends Error {
  constructor(public code: 'unsupported_type' | 'file_too_large' | 'empty_file' | 'invalid_filename' | 'invalid_target') {
    super(code)
  }
}
