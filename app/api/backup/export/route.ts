import { getContent } from '@/lib/storage'
import { serverError } from '@/lib/api-utils'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const doc = await getContent()
    const filename = `portfolio-backup-v${doc.version}-${doc.updatedAt.slice(0, 10)}.json`
    return new Response(JSON.stringify(doc, null, 2), {
      headers: {
        'content-type': 'application/json',
        'content-disposition': `attachment; filename="${filename}"`,
        'cache-control': 'no-store',
      },
    })
  } catch {
    return serverError()
  }
}
