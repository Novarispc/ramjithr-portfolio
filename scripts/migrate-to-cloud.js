#!/usr/bin/env node
/**
 * Push local data/content.json -> production Upstash Redis.
 *
 *   1. npx vercel env pull .env.local      (one-time, refreshes cloud creds)
 *   2. npm run migrate:local-to-cloud
 *
 * What it does:
 *   - Reads data/content.json from this repo
 *   - Reads what's currently in Redis (if anything)
 *   - Archives the current Redis state into history (so it's restorable)
 *   - Writes your local doc as the new "current"
 *
 * Safe to run multiple times.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const LOCAL_FILE = path.join(ROOT, 'data', 'content.json')
const ENV_FILE = path.join(ROOT, '.env.local')

const CURRENT_KEY = 'portfolio:content:current'
const HISTORY_KEY = 'portfolio:content:history'
const HISTORY_LIMIT = 30

// ─── Hand-load .env.local (handles $-escaping the same way Next.js does) ───
function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return
  const text = fs.readFileSync(ENV_FILE, 'utf8')
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const i = line.indexOf('=')
    if (i < 1) continue
    const key = line.slice(0, i).trim()
    let val = line.slice(i + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
}

async function main() {
  loadEnv()

  if (!fs.existsSync(LOCAL_FILE)) {
    console.error(`✗ ${LOCAL_FILE} does not exist — nothing to migrate.`)
    process.exit(1)
  }

  const localDoc = JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8'))
  const tl  = localDoc.published?.timeline?.length ?? 0
  const jr  = localDoc.published?.journey?.length ?? 0
  const cr  = localDoc.published?.career?.length ?? 0
  const ac  = localDoc.published?.achievements?.reduce((a, g) => a + g.items.length, 0) ?? 0

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Local doc (data/content.json):')
  console.log(`  version       : v${localDoc.version}`)
  console.log(`  updatedAt     : ${localDoc.updatedAt}`)
  console.log(`  timeline      : ${tl} entries`)
  console.log(`  journey       : ${jr} entries`)
  console.log(`  career        : ${cr} entries`)
  console.log(`  achievements  : ${ac} items`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) {
    console.error('✗ No Redis credentials in env.')
    console.error('  Run:  npx vercel env pull .env.local')
    console.error('  then: npm run migrate:local-to-cloud')
    process.exit(1)
  }

  const { Redis } = require('@upstash/redis')
  const redis = new Redis({ url, token })

  // Snapshot what's in Redis right now (for safety + archive into history)
  console.log('\n▶ Reading current Redis state…')
  const existing = await redis.get(CURRENT_KEY)
  if (existing) {
    const e = typeof existing === 'string' ? JSON.parse(existing) : existing
    console.log(`  found v${e.version}, ${e.published?.timeline?.length ?? 0} timeline entries (${e.updatedAt})`)

    const histRec = {
      id: `pre-migration-v${e.version}-${new Date().toISOString().replace(/[:.]/g, '-')}`,
      version: e.version,
      updatedAt: e.updatedAt,
      doc: e,
    }
    await redis.lpush(HISTORY_KEY, JSON.stringify(histRec))
    await redis.ltrim(HISTORY_KEY, 0, HISTORY_LIMIT - 1)
    console.log(`  archived to history as "${histRec.id}"`)
  } else {
    console.log('  (Redis is empty — nothing to archive)')
  }

  // Bump version to be strictly higher than what was in Redis, so the
  // app's monotonic version semantics stay intact.
  const nextVersion = Math.max(
    localDoc.version,
    existing ? (typeof existing === 'string' ? JSON.parse(existing).version : existing.version) + 1 : 1,
  )

  const merged = {
    version: nextVersion,
    updatedAt: new Date().toISOString(),
    published: localDoc.published,
    draft: undefined,
  }

  console.log(`\n▶ Writing local doc to Redis as v${nextVersion}…`)
  await redis.set(CURRENT_KEY, merged)
  console.log('✓ Done.')

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Migration complete.')
  console.log('  Open https://ramjith-radhakrishnan.vercel.app and refresh.')
  console.log('  Your 14 timeline entries + 8 journey trips should be live.')
  console.log('  Previous Redis state is restorable via /admin/backup.')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch(err => {
  console.error('\n✗ Migration failed:', err.message)
  if (process.env.DEBUG) console.error(err.stack)
  process.exit(1)
})
