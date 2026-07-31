import { randomUUID } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { db, now } from './db.js'
import { isValidAddress, normaliseAddress } from './chain.js'

/**
 * Add one Mini App to the registry from the command line, so collecting an
 * address from another builder takes seconds:
 *
 *   npm run registry:add -- --name "Tipster" \
 *     --address "NQ.. .. .." --url https://tipster.example \
 *     --description "Tip creators in NIM" --category social
 *
 * Also appends to registry.seed.json so the entry survives a database reset.
 */

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(`--${flag}`)
  return i > -1 ? process.argv[i + 1] : undefined
}

const name = arg('name')
const rawAddress = arg('address')
const url = arg('url')
const description = arg('description')
const category = arg('category') ?? 'other'
const pending = process.argv.includes('--pending')

if (!name || !rawAddress || !url || !description) {
  console.error(`
Add a Mini App to the Pulse registry.

  npm run registry:add -- \\
    --name        "App name" \\
    --address     "NQ.. .... ...."   (the app's RECEIVING address) \\
    --url         https://app.example \\
    --description "One line, max 100 chars" \\
    --category    social|games|finance|utility|shopping|other \\
    [--pending]   (queue for moderation instead of listing immediately)

Where addresses come from: ask the builder for the Nimiq address their Mini App
receives payments at. Do not guess, and never invent one — every number Pulse
shows is meant to trace back to a real on-chain payment.
`)
  process.exit(1)
}

if (!isValidAddress(rawAddress)) {
  console.error(`Not a valid Nimiq address: ${rawAddress}`)
  process.exit(1)
}
if (!/^https:\/\//i.test(url)) {
  console.error('The app URL must start with https://')
  process.exit(1)
}
if (description.length > 100) {
  console.error(`Description is ${description.length} characters; the limit is 100.`)
  process.exit(1)
}

const address = normaliseAddress(rawAddress)
const clash = db.prepare(`SELECT name FROM apps WHERE address = ?`).get(address) as
  | { name: string }
  | undefined

if (clash) {
  console.error(`This address is already registered to ${clash.name}.`)
  process.exit(1)
}

const status = pending ? 'PENDING' : 'APPROVED'
db.prepare(
  `INSERT INTO apps (id, name, address, url, description, category, status, listed_at, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(randomUUID(), name, address, url, description, category, status, pending ? null : now(), now())

// Mirror into the seed file so a fresh database can be rebuilt.
try {
  const seedPath = 'registry.seed.json'
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  seed.apps = seed.apps ?? []
  if (!seed.apps.some((a: { address: string }) => normaliseAddress(a.address) === address)) {
    seed.apps.push({ name, address, url, description, category })
    writeFileSync(seedPath, `${JSON.stringify(seed, null, 2)}\n`)
  }
} catch (e) {
  console.warn('Added to the database, but could not update registry.seed.json:', e)
}

console.log(`Added "${name}" as ${status}`)
console.log(`  ${address}`)
console.log(
  status === 'APPROVED'
    ? '\nIt will appear in Discover immediately. The indexer picks up its payment\nhistory on the next sweep (within ~20s per registered app).'
    : '\nQueued for moderation. Approve it with:\n  UPDATE apps SET status = \'APPROVED\', listed_at = strftime(\'%s\',\'now\')*1000 WHERE address = \'' + address + "';",
)
