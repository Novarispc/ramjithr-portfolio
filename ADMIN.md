# Admin Studio

Private CMS for the portfolio. Single-admin, JWT session, file-backed storage.

## Setup

1. Generate admin credentials and JWT secret:
   ```bash
   node scripts/hash-password.js "your-strong-password"
   ```
2. Copy the output into `.env.local`:
   ```
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD_HASH='$2a$12$…'
   ADMIN_JWT_SECRET='base64-string-48-bytes…'
   ```
3. Restart the dev server: `npm run dev`
4. Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## What's protected

- All `/admin/**` routes — middleware redirects unauthenticated requests to `/admin/login`.
- All `/api/admin/**`, `/api/content/**` (except `/api/content/public`), and `/api/backup/**` endpoints return `401` without a valid session cookie.
- `noindex,nofollow` headers + `metadata.robots` on every admin page.
- Session cookie is `HttpOnly`, `SameSite=Strict`, `Secure` in production, 8-hour TTL.

## Storage

- All content lives in `data/content.json` (gitignored).
- Every write archives the previous version under `data/history/` — up to 30 snapshots, oldest pruned automatically.
- Draft vs published: each section save can target `mode=draft` (preview only, not yet published) or `mode=publish` (becomes live immediately). Use the "Publish draft" button in the top bar to promote a pending draft.

## Public read

The public site reads from `lib/storage.ts` directly on the server (or `GET /api/content/public` for client-side use). To wire the existing portfolio components to the live data, replace the static imports in `lib/data.ts` with fetches from `getPublicContent()` in your server components.

## Resetting

Delete `data/content.json` to reseed from `lib/seed-content.ts` on next request.

## Sections

| Route | What |
|-------|------|
| `/admin` | Overview + counts |
| `/admin/personal` | Name, title, bio, contact, image |
| `/admin/career` | Roles, achievements, tools |
| `/admin/timeline` | Year-based life events |
| `/admin/projects` | Portfolio projects |
| `/admin/skills` | Categorized skills + proficiency |
| `/admin/education` | Degrees + certifications |
| `/admin/languages` | Spoken languages checkboxes |
| `/admin/achievements` | Goal trackers (wonders, marathon, fitness) |
| `/admin/backup` | Export/import JSON + version history |

## Security notes

- Failed logins introduce a 400 ms delay to slow brute force. Add a reverse proxy rate limiter for production.
- Set `ADMIN_PASSWORD_HASH` (not `ADMIN_PASSWORD`) in production.
- Rotate `ADMIN_JWT_SECRET` to invalidate all sessions instantly.
- Never commit `.env.local` or `data/`.
