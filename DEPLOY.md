# Deploy to Vercel

This portfolio is built to run free on Vercel Hobby:

| Concern | Local dev | Production |
|---|---|---|
| Content (JSON) | `data/content.json` | **Upstash Redis** (Vercel Marketplace, free tier) |
| Image uploads  | `public/uploads/` | **Vercel Blob** (free tier) |
| Auth / JWT     | env vars          | env vars |
| Public site    | Next.js dev       | Vercel SSR (free Hobby) |

Storage backends switch automatically based on which env vars are present at runtime — no code changes between local and production.

---

## 1 · Push to GitHub (one-time)

```bash
cd "C:\Users\novar\my_portfolio"
git init -b main
git add .
git commit -m "Initial commit: portfolio + admin dashboard"
git remote add origin https://github.com/Novarispc/ramjithr-portfolio.git
git push -u origin main
```

If the repo already has commits and you want a clean push:

```bash
git push -u origin main --force
```

> The `.gitignore` excludes `data/`, `public/uploads/`, `.env.local`, `node_modules`, `.next` — none of those go to GitHub.

---

## 2 · Import the repo into Vercel

1. Sign in at [vercel.com](https://vercel.com) with **Continue with GitHub**.
2. Click **Add New… → Project**.
3. Find `Novarispc/ramjithr-portfolio` → **Import**.
4. **Project name**: `ramjith-radhakrishnan` → URL will be `ramjith-radhakrishnan.vercel.app`.
5. Framework preset auto-detects **Next.js**.
6. Leave build / output / install defaults.
7. **Don't deploy yet** — first add env vars (Step 3).

---

## 3 · Add required environment variables

Vercel project → **Settings → Environment Variables**. Add to *Production*, *Preview*, *Development*:

| Name | Value | How to generate |
|---|---|---|
| `ADMIN_USERNAME` | `admin` | (anything you want) |
| `ADMIN_PASSWORD` | a strong password | (anything you want — it's hashed at boot) |
| `ADMIN_JWT_SECRET` | 48 random bytes, base64 | `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` |

Do **not** check "Sensitive" for `ADMIN_USERNAME` if you want to see it later. Always check it for `ADMIN_PASSWORD` and `ADMIN_JWT_SECRET`.

---

## 4 · Add Upstash Redis (free) for content storage

1. Vercel project → **Storage** tab → **Create Database**.
2. Choose **Marketplace** → **Upstash** → **Redis**.
3. Pick **Free** plan, region near your users (e.g. `us-east-1` or `eu-west-1`).
4. Click **Create**.
5. Vercel auto-injects these env vars into your project:
   - `KV_REST_API_URL` / `KV_REST_API_TOKEN`
   - `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`

   Either set is recognised — no code change needed.

---

## 5 · Add Vercel Blob (free) for image uploads

1. Same **Storage** tab → **Create Database**.
2. Choose **Blob**.
3. Click **Create**.
4. Vercel auto-injects `BLOB_READ_WRITE_TOKEN`.

---

## 6 · Deploy

1. Go to the **Deployments** tab.
2. Click **Redeploy** on the latest commit (or trigger a fresh build by pushing any commit to `main`).
3. Wait ~60 seconds.
4. Visit **`https://ramjith-radhakrishnan.vercel.app`** — the public site is live.
5. Visit **`https://ramjith-radhakrishnan.vercel.app/admin/login`** — log in with the username/password from Step 3.

---

## 7 · How it behaves

- **Public homepage** is server-rendered on every request and reads from Redis, so admin edits go live the moment you publish.
- **Admin saves** write to Redis (atomic single key, version-bumped each publish).
- **Version history** stores the last 30 snapshots in a Redis list.
- **Image uploads** stream straight to Vercel Blob and return public CDN URLs; deletes call `del()`.
- **Sessions** are still HttpOnly JWT cookies signed with `ADMIN_JWT_SECRET`.

---

## 8 · Pulling cloud env vars locally (optional)

If you want local dev to use the same cloud Redis + Blob (handy for testing):

```bash
npm i -g vercel
vercel link        # link this folder to the project
vercel env pull .env.local  # writes all production env vars to .env.local
npm run dev
```

Otherwise local dev keeps using `data/` and `public/uploads/` — no setup required.

---

## 9 · Custom domain (later)

Vercel project → **Settings → Domains** → add your domain. Vercel issues a free TLS cert.
Free TLDs aren't reliable; expect ~$10/yr from Namecheap, Cloudflare, or Porkbun.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ADMIN_JWT_SECRET must be set` on first request | env var missing | Re-check Step 3, then **Redeploy**. Env-var changes need a redeploy. |
| Login works but every admin save fails | Redis not connected | Storage tab shows DB? Env vars `KV_REST_API_URL`/`UPSTASH_REDIS_REST_URL` exist? Redeploy. |
| Upload returns `500` | Blob not connected | Storage tab → Blob exists? `BLOB_READ_WRITE_TOKEN` exists? Redeploy. |
| Stale content after publishing | CDN cache | Hard-refresh; the `/` route is `force-dynamic` so this should be immediate. |
| Admin login redirects in a loop | `ADMIN_JWT_SECRET` shorter than 32 chars | Generate a longer one (Step 3). |
