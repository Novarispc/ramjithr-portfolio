#!/usr/bin/env node
/**
 * Push local data/content.json to the live admin via the existing
 * /api/backup/import endpoint. No Redis credentials needed.
 *
 *   npm run migrate:via-import
 *
 * Logs in with the admin password from .deploy-creds.txt, then POSTs
 * the local content.json. The endpoint validates with Zod and writes
 * to Redis via the same path /admin/backup uses.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const LOCAL_FILE = path.join(ROOT, 'data', 'content.json')
const CREDS_FILE = path.join(ROOT, '.deploy-creds.txt')
const BASE_URL = process.env.SITE_URL || 'https://ramjith-radhakrishnan.vercel.app'
const USERNAME = 'admin'

function readCreds() {
  if (!fs.existsSync(CREDS_FILE)) {
    throw new Error('.deploy-creds.txt not found — re-run scripts/deploy-vercel.js once or pass ADMIN_PASSWORD env var.')
  }
  const text = fs.readFileSync(CREDS_FILE, 'utf8')
  const out = {}
  for (const line of text.split(/\r?\n/)) {
    const i = line.indexOf('=')
    if (i < 1) continue
    out[line.slice(0, i)] = line.slice(i + 1)
  }
  return out
}

function parseCookies(setCookieHeader) {
  if (!setCookieHeader) return ''
  // Accept both string and array
  const headers = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]
  return headers
    .map(h => h.split(';')[0])
    .filter(Boolean)
    .join('; ')
}

async function main() {
  if (!fs.existsSync(LOCAL_FILE)) {
    console.error(`✗ ${LOCAL_FILE} does not exist.`)
    process.exit(1)
  }

  const localDoc = JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8'))
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Local doc (data/content.json):')
  console.log(`  version       : v${localDoc.version}`)
  console.log(`  timeline      : ${localDoc.published?.timeline?.length ?? 0} entries`)
  console.log(`  journey       : ${localDoc.published?.journey?.length ?? 0} entries`)
  console.log(`  career        : ${localDoc.published?.career?.length ?? 0} entries`)
  console.log(`  Target        : ${BASE_URL}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const password = process.env.ADMIN_PASSWORD || readCreds().ADMIN_PASSWORD
  if (!password) throw new Error('No admin password — set ADMIN_PASSWORD env var or restore .deploy-creds.txt')

  // ── 1. Login ─────────────────────────────────────────────────────────
  console.log('\n▶ Logging in as ' + USERNAME + '…')
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password }),
  })
  if (!loginRes.ok) {
    const body = await loginRes.text()
    throw new Error(`Login failed (${loginRes.status}): ${body}`)
  }
  const cookies = parseCookies(loginRes.headers.get('set-cookie'))
  if (!cookies) throw new Error('No session cookie returned from /api/auth/login')
  console.log('✓ Session cookie obtained')

  // ── 2. Import ────────────────────────────────────────────────────────
  console.log('\n▶ Uploading content via /api/backup/import…')
  const importRes = await fetch(`${BASE_URL}/api/backup/import`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: cookies },
    body: JSON.stringify(localDoc),
  })
  if (!importRes.ok) {
    const body = await importRes.text()
    throw new Error(`Import failed (${importRes.status}): ${body}`)
  }
  const result = await importRes.json()
  console.log('✓ Imported:', JSON.stringify(result))

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Migration complete.')
  console.log(`  Refresh ${BASE_URL} — your 14 timeline entries are now live.`)
  console.log(`  Previous Redis state is in /admin/backup → version history.`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch(err => { console.error('\n✗', err.message); process.exit(1) })
