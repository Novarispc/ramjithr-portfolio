#!/usr/bin/env node
/**
 * One-shot Vercel deployment for the portfolio.
 *
 *   1. `npx vercel login`  (interactive, one-time — opens your browser)
 *   2. `npm run deploy:vercel`
 *
 * This script will:
 *   • Link this folder to a Vercel project named "ramjith-radhakrishnan"
 *     (creating it if it doesn't exist).
 *   • Push ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_JWT_SECRET to Production env.
 *   • Trigger a production deploy.
 *
 * Storage (Upstash Redis + Vercel Blob) must be added once in the Vercel
 * dashboard — see DEPLOY.md step 4–5.
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const ROOT = path.join(__dirname, '..')
const CREDS_FILE = path.join(ROOT, '.deploy-creds.txt')
const PROJECT_NAME = 'ramjith-radhakrishnan'
const ADMIN_USERNAME = 'admin'

function readCreds() {
  if (!fs.existsSync(CREDS_FILE)) {
    const pw = crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 12)
    const secret = crypto.randomBytes(48).toString('base64')
    fs.writeFileSync(CREDS_FILE, `ADMIN_PASSWORD=${pw}\nADMIN_JWT_SECRET=${secret}\n`, 'utf8')
    console.log('Generated fresh credentials → .deploy-creds.txt')
  }
  const text = fs.readFileSync(CREDS_FILE, 'utf8')
  const out = {}
  for (const line of text.split(/\r?\n/)) {
    const i = line.indexOf('=')
    if (i < 1) continue
    out[line.slice(0, i)] = line.slice(i + 1)
  }
  if (!out.ADMIN_PASSWORD || !out.ADMIN_JWT_SECRET) {
    throw new Error('.deploy-creds.txt is missing required values')
  }
  return out
}

function run(label, cmd, args, opts = {}) {
  console.log(`\n▶ ${label}`)
  console.log(`  $ ${cmd} ${args.join(' ')}`)
  const res = spawnSync(cmd, args, { stdio: 'inherit', cwd: ROOT, shell: true, ...opts })
  if (res.status !== 0) {
    console.error(`✗ ${label} failed (exit ${res.status}).`)
    process.exit(res.status || 1)
  }
}

function runWithInput(label, cmd, args, input) {
  console.log(`\n▶ ${label}`)
  console.log(`  $ ${cmd} ${args.join(' ')}  (piping value)`)
  const res = spawnSync(cmd, args, {
    cwd: ROOT, shell: true,
    input, stdio: ['pipe', 'inherit', 'inherit'],
  })
  if (res.status !== 0) {
    console.error(`✗ ${label} failed (exit ${res.status}).`)
    process.exit(res.status || 1)
  }
}

function tryRemove(label, cmd, args) {
  console.log(`\n▶ ${label}`)
  console.log(`  $ ${cmd} ${args.join(' ')}`)
  const res = spawnSync(cmd, args, { stdio: 'inherit', cwd: ROOT, shell: true })
  // ignore failures — env var may not exist
  if (res.status !== 0) console.log('  (skipped — var was not set)')
}

;(async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Vercel deploy: ' + PROJECT_NAME + '.vercel.app')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const creds = readCreds()

  run('Link project (creates "' + PROJECT_NAME + '" if missing)',
      'npx', ['--yes', 'vercel', 'link', '--project', PROJECT_NAME, '--yes'])

  // Remove any existing values first so re-running doesn't prompt.
  tryRemove('Reset ADMIN_USERNAME (production)',
            'npx', ['--yes', 'vercel', 'env', 'rm', 'ADMIN_USERNAME', 'production', '--yes'])
  tryRemove('Reset ADMIN_PASSWORD (production)',
            'npx', ['--yes', 'vercel', 'env', 'rm', 'ADMIN_PASSWORD', 'production', '--yes'])
  tryRemove('Reset ADMIN_JWT_SECRET (production)',
            'npx', ['--yes', 'vercel', 'env', 'rm', 'ADMIN_JWT_SECRET', 'production', '--yes'])

  runWithInput('Set ADMIN_USERNAME', 'npx', ['--yes', 'vercel', 'env', 'add', 'ADMIN_USERNAME', 'production'], ADMIN_USERNAME + '\n')
  runWithInput('Set ADMIN_PASSWORD', 'npx', ['--yes', 'vercel', 'env', 'add', 'ADMIN_PASSWORD', 'production'], creds.ADMIN_PASSWORD + '\n')
  runWithInput('Set ADMIN_JWT_SECRET', 'npx', ['--yes', 'vercel', 'env', 'add', 'ADMIN_JWT_SECRET', 'production'], creds.ADMIN_JWT_SECRET + '\n')

  run('Deploy to production', 'npx', ['--yes', 'vercel', 'deploy', '--prod', '--yes'])

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Done.')
  console.log('  Public site : https://' + PROJECT_NAME + '.vercel.app')
  console.log('  Admin login : https://' + PROJECT_NAME + '.vercel.app/admin/login')
  console.log('                username: ' + ADMIN_USERNAME)
  console.log('                password: ' + creds.ADMIN_PASSWORD)
  console.log('')
  console.log('  NEXT — add storage (one-time, in the Vercel dashboard):')
  console.log('    1. Project → Storage → Create Database → Upstash Redis (free)')
  console.log('    2. Project → Storage → Create Database → Blob (free)')
  console.log('    3. Project → Deployments → Redeploy latest')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})().catch(err => { console.error(err); process.exit(1) })
