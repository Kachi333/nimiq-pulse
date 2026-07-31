import { config } from './config.js'
import { db, now } from './db.js'
import { headHeight, isReady, paymentsTo, transactionByHash } from './chain.js'
import { recompute } from './xp.js'

/**
 * Projects chain → database. Address-scoped rather than block-scoped: Pulse only
 * cares about payments to registry addresses, so cost scales with registry size
 * (tens) rather than chain size.
 *
 * Address sweeps take 11–16s each, so one app is swept per tick, round-robin.
 * Nothing user-facing ever waits on this.
 */

let running = false
let lastSweepAt = 0
let lastError: string | null = null

export function indexerStatus() {
  return { running, lastSweepAt, lastError }
}

interface AppRow {
  id: string
  address: string
  index_cursor: number
}

/** Writes one payment. Returns true if it was new. */
function recordInteraction(
  appId: string,
  txHash: string,
  sender: string,
  valueLuna: number,
  blockHeight: number,
  timestamp: number,
): boolean {
  const seen = db
    .prepare(`SELECT 1 FROM interactions WHERE wallet_address = ? AND app_id = ? LIMIT 1`)
    .get(sender, appId)

  try {
    db.prepare(
      `INSERT INTO interactions
         (tx_hash, wallet_address, app_id, value_luna, block_height, timestamp, is_first_for_pair)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(txHash, sender, appId, valueLuna, blockHeight, timestamp, seen ? 0 : 1)
  } catch {
    return false // tx_hash primary key — already indexed
  }

  db.prepare(
    `INSERT INTO wallets (address, first_seen_at, last_active_at)
     VALUES (?, ?, ?) ON CONFLICT(address) DO NOTHING`,
  ).run(sender, now(), now())

  return true
}

async function sweepApp(app: AppRow, head: number): Promise<number> {
  const cutoff = head - config.confirmations
  const since = Math.max(0, app.index_cursor)
  const txs = await paymentsTo(app.address, since, 100)

  let added = 0
  const touched = new Set<string>()

  for (const tx of txs) {
    const height = tx.blockHeight ?? 0
    if (height > cutoff) continue // not yet confirmed deeply enough
    if (recordInteraction(app.id, tx.transactionHash, tx.sender, tx.value, height, tx.timestamp ?? now())) {
      added++
      touched.add(tx.sender)
    }
  }

  db.prepare(`UPDATE apps SET index_cursor = ?, indexed_at = ? WHERE id = ?`)
    .run(Math.max(since, cutoff), now(), app.id)

  for (const wallet of touched) recompute(wallet)
  return added
}

/**
 * Targeted lookup for a quest claim. The hash only accelerates the sweep that
 * would have found this payment anyway — a forged hash gains nothing, because
 * sender, recipient and amount are all re-derived from the chain.
 */
export async function verifyPayment(
  txHash: string,
  expectedSender: string,
  expectedRecipient: string,
  minLuna: number,
): Promise<{ ok: boolean; reason?: string }> {
  if (!isReady()) return { ok: false, reason: 'chain-not-ready' }

  const tx = await transactionByHash(txHash)
  if (!tx) return { ok: false, reason: 'not-found' }
  if (tx.sender !== expectedSender) return { ok: false, reason: 'wrong-sender' }
  if (tx.recipient !== expectedRecipient) return { ok: false, reason: 'wrong-recipient' }
  if (tx.value < minLuna) return { ok: false, reason: 'below-minimum' }

  const head = await headHeight()
  const height = tx.blockHeight ?? 0
  if (height === 0 || height > head - config.confirmations) {
    return { ok: false, reason: 'not-confirmed' }
  }

  // Fold it into the registry projection if the recipient is a listed app.
  const app = db.prepare(`SELECT id FROM apps WHERE address = ?`).get(expectedRecipient) as
    | { id: string }
    | undefined
  if (app) {
    recordInteraction(app.id, tx.transactionHash, tx.sender, tx.value, height, tx.timestamp ?? now())
    recompute(tx.sender)
  }

  return { ok: true }
}

let cursor = 0

async function tick(): Promise<void> {
  if (!isReady()) return
  const apps = db
    .prepare(`SELECT id, address, index_cursor FROM apps WHERE status = 'APPROVED' ORDER BY created_at`)
    .all() as unknown as AppRow[]
  if (apps.length === 0) return

  const app = apps[cursor % apps.length]
  cursor++

  try {
    const head = await headHeight()
    const added = await sweepApp(app, head)
    lastSweepAt = now()
    lastError = null
    if (added > 0) console.log(`[indexer] ${app.address}: +${added} interactions`)
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error)
    console.warn(`[indexer] sweep failed for ${app.address}: ${lastError}`)
  }
}

export function startIndexer(): void {
  if (running) return
  running = true
  const loop = async () => {
    await tick()
    setTimeout(loop, config.indexIntervalSec * 1000)
  }
  setTimeout(loop, 2000)
  console.log(`[indexer] started, one address every ${config.indexIntervalSec}s`)
}
