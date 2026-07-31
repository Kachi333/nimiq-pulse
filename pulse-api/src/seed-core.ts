import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { db, now } from './db.js'
import { isValidAddress, normaliseAddress } from './chain.js'

export interface SeedApp {
  name: string
  address: string
  url: string
  description: string
  category: string
  isStarter?: boolean
}

export function readSeedFile(includeDemo: boolean): SeedApp[] {
  if (!existsSync('registry.seed.json')) return []
  const file = JSON.parse(readFileSync('registry.seed.json', 'utf8'))
  return includeDemo
    ? [...(file.apps ?? []), ...(file.demoApps?.entries ?? [])]
    : (file.apps ?? [])
}

export function seedApps(apps: SeedApp[]): { added: number; skipped: number } {
  let added = 0
  let skipped = 0

  for (const app of apps) {
    if (!isValidAddress(app.address)) {
      skipped++
      continue
    }
    try {
      db.prepare(
        `INSERT INTO apps (id, name, address, url, description, category, status, is_starter, listed_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'APPROVED', ?, ?, ?)`,
      ).run(
        randomUUID(),
        app.name,
        normaliseAddress(app.address),
        app.url,
        app.description,
        app.category,
        app.isStarter ? 1 : 0,
        now(),
        now(),
      )
      added++
    } catch {
      skipped++ // duplicate address
    }
  }

  return { added, skipped }
}

/**
 * Render's free tier has an ephemeral filesystem, so the database is wiped on
 * every deploy and restart. Without this, the app would come back with an empty
 * registry and an empty feed — the worst possible state for a live demo.
 *
 * Only runs when the registry is genuinely empty, so it never fights a database
 * that already has real entries.
 */
export function autoSeedIfEmpty(): void {
  const count = (db.prepare(`SELECT COUNT(*) AS n FROM apps`).get() as { n: number }).n
  if (count > 0) return

  const apps = readSeedFile(process.env.SEED_INCLUDE_DEMO === 'true')
  if (apps.length === 0) {
    console.warn('[seed] registry is empty and registry.seed.json has no apps.')
    console.warn('       Discover will show nothing. Add real addresses with `npm run registry:add`.')
    return
  }

  const { added } = seedApps(apps)
  console.log(`[seed] empty registry — seeded ${added} app${added === 1 ? '' : 's'} from registry.seed.json`)
}
