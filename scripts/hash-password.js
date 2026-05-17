#!/usr/bin/env node
// Usage: node scripts/hash-password.js "your-password-here"
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const pw = process.argv[2]
if (!pw) {
  console.error('Usage: node scripts/hash-password.js "your-password"')
  process.exit(1)
}

const hash = bcrypt.hashSync(pw, 12)
const secret = crypto.randomBytes(48).toString('base64')

// Next.js dotenv expands $VAR refs, and bcrypt hashes start with `$2b$…`,
// so each `$` must be escaped with a backslash in the .env file.
const escapedHash = hash.replace(/\$/g, '\\$')

console.log('\nAdd these to .env.local:\n')
console.log(`ADMIN_USERNAME=admin`)
console.log(`ADMIN_PASSWORD_HASH="${escapedHash}"`)
console.log(`ADMIN_JWT_SECRET="${secret}"\n`)
