import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { db, now } from './db.js'
import { isValidAddress, normaliseAddress } from './chain.js'

interface SeedApp {
  name: string
  address: string
  url: string
  description: string
  category: string
  isStarter?: boolean
}

const useDemo = process.argv.includes('--demo')
const file = JSON.parse(readFileSync('registry.seed.json', 'utf8'))

const apps: SeedApp[] = useDemo
  ? [...(file.apps ?? []), ...(file.demoApps?.entries ?? [])]
  : (file.apps ?? [])

if (apps.length === 0) {
  console.log('registry.seed.json has no apps.')
  console.log('Add real Mini App receiving addresses, or run `npm run seed -- --demo`')
  console.log('to insert the pipeline-test entries (real addresses, not real Mini Apps).')
  process.exit(0)
}

let added = 0
let skipped = 0

for (const app of apps) {
  if (!isValidAddress(app.address)) {
    console.warn(`skip ${app.name}: invalid Nimiq address`)
    skipped++
    continue
  }
  const address = normaliseAddress(app.address)
  try {
    db.prepare(
      `INSERT INTO apps (id, name, address, url, description, category, status, is_starter, listed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'APPROVED', ?, ?, ?)`,
    ).run(
      randomUUID(),
      app.name,
      address,
      app.url,
      app.description,
      app.category,
      app.isStarter ? 1 : 0,
      now(),
      now(),
    )
    added++
    console.log(`+ ${app.name}  ${address}`)
  } catch {
    skipped++
    console.log(`= ${app.name} already registered`)
  }
}

console.log(`\n${added} added, ${skipped} skipped.`)
if (useDemo) {
  console.log('\nDEMO entries inserted. Remove them before showing the registry to anyone:')
  console.log("  DELETE FROM apps WHERE category = 'demo';")
}
