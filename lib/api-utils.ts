import 'server-only'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init)
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 })
}

export function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
}

export function serverError(message = 'internal_error') {
  return NextResponse.json({ error: message }, { status: 500 })
}

export function handleZod(err: unknown) {
  if (err instanceof ZodError) {
    return badRequest('validation_error', err.flatten())
  }
  return null
}
