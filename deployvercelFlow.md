# Vercel Deployment Flow

## Prerequisites
- Code pushed to GitHub
- Vercel account connected to GitHub repo

---

## 1. GitHub Push Access

Use a **classic PAT** (not fine-grained) — fine-grained tokens have per-repo permission issues.

1. Go to github.com/settings/tokens → Tokens (classic) → Generate new token
2. Check the `repo` scope
3. Push with:
```
git push https://USERNAME:TOKEN@github.com/OWNER/REPO.git main
```

---

## 2. Next.js 15 Build Requirements

### params are now Promises
```typescript
// Before (Next.js 13/14)
const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = params
}

// After (Next.js 15)
const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
}
```
Applies to: page components, generateMetadata, route handlers.

### headers() is now async
```typescript
// Before
const sig = headers().get("Stripe-Signature")

// After
const headersList = await headers()
const sig = headersList.get("Stripe-Signature")
```

### next.config.js
```js
// Before
experimental: { serverComponentsExternalPackages: [...] }

// After (top-level)
serverExternalPackages: [...]
```

---

## 3. Common Vercel Build Errors & Fixes

### Error: Environment variable not found: DATABASE_URL
Prisma requires DATABASE_URL even when using Turso adapter.
Fix: add `vercel.json` with fallback:
```json
{
  "buildCommand": "DATABASE_URL=${DATABASE_URL:-file:./dev.db} npm run build"
}
```

### Error: Neither apiKey nor config.authenticator provided (Stripe)
Stripe initializes at module load time — fails if STRIPE_API_KEY not set during build.
Fix: make Stripe lazy:
```typescript
// lib/stripe.ts
let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_API_KEY) throw new Error("STRIPE_API_KEY is not set")
    _stripe = new Stripe(process.env.STRIPE_API_KEY, { apiVersion: "2025-02-24.acacia" })
  }
  return _stripe
}
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) { return getStripe()[prop as keyof Stripe] },
})
```

### Error: Table does not exist (prerender)
Next.js tries to statically render pages that fetch from DB at build time.
Fix: add to every page that uses DB:
```typescript
export const dynamic = 'force-dynamic'
```
And wrap all DB calls in try/catch:
```typescript
let data = []
try {
  data = await prismadb.something.findMany(...)
} catch {}
```

### Radix UI DialogPortal className removed
```typescript
// Before
const DialogPortal = ({ className, ...props }: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal className={cn(className)} {...props} />
)

// After
const DialogPortal = (props: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props} />
)
```

---

## 4. Database: Turso Setup (SQLite for Vercel)

Vercel has a read-only filesystem — local SQLite files don't work. Use Turso (remote SQLite, free tier).

### Install Turso CLI (Windows via WSL)
```bash
wsl bash -c "curl -sSfL https://get.tur.so/install.sh | bash"
wsl bash -c "~/.turso/turso auth login"
```

### Create database and get credentials
```bash
wsl bash -c "~/.turso/turso db create shop-products"
wsl bash -c "~/.turso/turso db show shop-products --url"
wsl bash -c "~/.turso/turso db tokens create shop-products"
```

### Migrate local dev.db to Turso
Use this migration script (`scripts/migrate-to-turso.ts`):
- Reads schema + data from local `prisma/dev.db`
- Creates tables in Turso in FK-dependency order
- Inserts data in batches of 50 with `PRAGMA defer_foreign_keys = ON`
- Two-pass insert for self-referential tables (Category)

Run with:
```bash
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npx tsx scripts/migrate-to-turso.ts
```

### lib/prismadb.ts (Turso adapter pattern)
```typescript
function createPrismaClient(): PrismaClient {
  if (process.env.TURSO_DATABASE_URL) {
    const { createClient } = require("@libsql/client")
    const { PrismaLibSQL } = require("@prisma/adapter-libsql")
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter } as any)
  }
  return new PrismaClient()
}
```

---

## 5. Vercel Environment Variables

Go to: **Project → Settings → Environment Variables**
(direct URL: `https://vercel.com/TEAM/PROJECT/settings/environment-variables`)

You can paste a full `.env` block into the Key field and Vercel auto-splits them.

Required variables:
| Variable | Description |
|---|---|
| `TURSO_DATABASE_URL` | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | JWT token from turso db tokens create |
| `NEXTAUTH_SECRET` | Any long random string |
| `NEXT_APP_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `STRIPE_API_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |

---

## 6. Post-Deploy Checklist

- **Google OAuth**: Add `https://your-app.vercel.app/api/auth/callback/google` to authorized redirect URIs in Google Console
- **Stripe webhook**: Add `https://your-app.vercel.app/api/webhook` in Stripe dashboard with event `checkout.session.completed`
- **Redeploy** after adding env vars for them to take effect
