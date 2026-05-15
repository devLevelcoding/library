/**
 * Creates a Turso database + auth token without needing the CLI.
 *
 * Usage:
 *   TURSO_API_TOKEN=<org-api-token> npx tsx scripts/turso-create-db.ts <db-name>
 *
 * Get your org API token at: https://app.turso.tech/settings/tokens
 * It will print the TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to copy into .env / Vercel.
 */

const ORG   = "devlevelcoding"
const GROUP = "default"
const BASE  = "https://api.turso.tech/v1"

async function api(method: string, path: string, body?: object) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.TURSO_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const json = await res.json() as any
  if (!res.ok) {
    throw new Error(`Turso API ${method} ${path} → ${res.status}: ${JSON.stringify(json)}`)
  }
  return json
}

async function main() {
  const dbName = process.argv[2]
  if (!dbName) {
    console.error("Usage: TURSO_API_TOKEN=... npx tsx scripts/turso-create-db.ts <db-name>")
    process.exit(1)
  }
  if (!process.env.TURSO_API_TOKEN) {
    console.error("Missing TURSO_API_TOKEN — get it from https://app.turso.tech/settings/tokens")
    process.exit(1)
  }

  console.log(`Creating database "${dbName}" in org "${ORG}"...`)
  const db = await api("POST", `/organizations/${ORG}/databases`, {
    name:  dbName,
    group: GROUP,
  })
  const hostname = db.database?.Hostname ?? `${dbName}-${ORG}.aws-us-east-1.turso.io`
  const url = `libsql://${hostname}`
  console.log(`  DB created: ${url}`)

  console.log("Creating auth token...")
  const tokenRes = await api("POST", `/organizations/${ORG}/databases/${dbName}/auth/tokens?expiration=never`)
  const token = tokenRes.jwt

  console.log("\n--- Copy these into your .env and Vercel ---")
  console.log(`TURSO_DATABASE_URL=${url}`)
  console.log(`TURSO_AUTH_TOKEN=${token}`)
  console.log("--------------------------------------------")

  // Save to env<DbName>.dev file
  const fs  = await import("fs")
  const out = `# Turso Database — ${ORG} / ${dbName}\n# Dashboard: https://app.turso.tech/${ORG}/databases/${dbName}\n\nTURSO_DATABASE_URL=${url}\nTURSO_AUTH_TOKEN=${token}\n\n# To init schema + seed:\n# TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/init-book-store.ts\n`
  const fileName = `env${dbName.replace(/-/g, "_")}.dev`
  fs.writeFileSync(fileName, out)
  console.log(`\nSaved to ${fileName}`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
