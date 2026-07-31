import { db } from './db.js'

interface Row {
  name: string
  address: string
  status: string
  category: string
  payers: number
  interactions: number
  indexed_at: number | null
}

const rows = db
  .prepare(
    `SELECT a.name, a.address, a.status, a.category, a.indexed_at,
            COUNT(DISTINCT i.wallet_address) AS payers,
            COUNT(i.tx_hash)                 AS interactions
       FROM apps a
       LEFT JOIN interactions i ON i.app_id = a.id
      GROUP BY a.id
      ORDER BY a.status, a.created_at`,
  )
  .all() as unknown as Row[]

if (rows.length === 0) {
  console.log('The registry is empty.\n')
  console.log('Add a real Mini App receiving address:')
  console.log('  npm run registry:add -- --name "X" --address "NQ.." --url https://.. --description ".."')
  process.exit(0)
}

console.log(`\n${rows.length} entr${rows.length === 1 ? 'y' : 'ies'}\n`)
for (const r of rows) {
  const swept = r.indexed_at ? new Date(r.indexed_at).toISOString().slice(11, 19) : 'never'
  console.log(`${r.status.padEnd(9)} ${r.name}`)
  console.log(`          ${r.address}`)
  console.log(
    `          ${r.payers} payer${r.payers === 1 ? '' : 's'} · ${r.interactions} interaction${r.interactions === 1 ? '' : 's'} · last swept ${swept}\n`,
  )
}

const demo = rows.filter((r) => r.category === 'demo')
if (demo.length > 0) {
  console.log(`${demo.length} DEMO entr${demo.length === 1 ? 'y is' : 'ies are'} listed. These are real`)
  console.log('addresses but not real Mini Apps. Remove before demoing:')
  console.log("  DELETE FROM apps WHERE category = 'demo';\n")
}
