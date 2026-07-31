import { randomUUID } from 'node:crypto'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { config } from './config.js'
import { db, now, utcDay } from './db.js'
import { chainStatus, isValidAddress, normaliseAddress, startChain } from './chain.js'
import { indexerStatus, startIndexer, verifyPayment } from './indexer.js'
import { cleanupNonces, createChallenge, requireAuth, verifyLogin } from './auth.js'
import { ACHIEVEMENT_CATALOGUE, recompute, xpForLevel, award } from './xp.js'
import { complete, evaluateDerivedQuests, questsForWallet, recordClaim } from './quests.js'
import { feedFor } from './discover.js'

const app = Fastify({ logger: false })

await app.register(cors, {
  origin: config.corsOrigins, // explicit allowlist, never '*' — SECURITY.md §9
  credentials: false,
})

function fail(reply: any, code: number, errCode: string, message: string) {
  return reply.code(code).send({ error: { code: errCode, message } })
}

/* ---------------------------------------------------------------- health -- */

app.get('/health', async () => ({
  ok: true,
  chain: chainStatus(),
  indexer: indexerStatus(),
  apps: (db.prepare(`SELECT COUNT(*) AS n FROM apps WHERE status='APPROVED'`).get() as { n: number }).n,
  interactions: (db.prepare(`SELECT COUNT(*) AS n FROM interactions`).get() as { n: number }).n,
}))

/* ------------------------------------------------------------------ auth -- */

app.post('/auth/challenge', async () => {
  cleanupNonces()
  return createChallenge()
})

app.post('/auth/verify', async (req, reply) => {
  const { nonce, publicKey, signature } = (req.body ?? {}) as Record<string, string>
  if (!nonce || !publicKey || !signature) {
    return fail(reply, 400, 'BAD_REQUEST', 'That didn’t verify. Try connecting again.')
  }

  const result = await verifyLogin(nonce, publicKey, signature)
  if (!result.ok) {
    return fail(reply, 401, 'VERIFY_FAILED', 'That didn’t verify. Try connecting again.')
  }

  recompute(result.address)
  return { sessionToken: result.token, address: result.address, isNewWallet: result.isNewWallet }
})

/* --------------------------------------------------------------- profile -- */

app.get('/profile', { preHandler: requireAuth }, async (req) => {
  const address = req.walletAddress!
  evaluateDerivedQuests(address)

  const wallet = db.prepare(`SELECT * FROM wallets WHERE address = ?`).get(address) as {
    xp_total: number
    level: number
    streak_days: number
  }

  const earned = db
    .prepare(`SELECT code, earned_at, source_ref FROM achievements_earned WHERE wallet_address = ?`)
    .all(address) as { code: string; earned_at: number; source_ref: string | null }[]
  const earnedByCode = new Map(earned.map((e) => [e.code, e]))

  const activity = db
    .prepare(
      `SELECT i.tx_hash, i.value_luna, i.timestamp, i.block_height, a.name, a.id AS app_id
         FROM interactions i JOIN apps a ON a.id = i.app_id
        WHERE i.wallet_address = ? ORDER BY i.timestamp DESC LIMIT 50`,
    )
    .all(address) as any[]

  const level = wallet.level
  return {
    address,
    level,
    xpTotal: wallet.xp_total,
    xpIntoLevel: wallet.xp_total - xpForLevel(level),
    xpForNextLevel: xpForLevel(level + 1) - xpForLevel(level),
    streakDays: wallet.streak_days,
    achievements: ACHIEVEMENT_CATALOGUE.map((a) => ({
      ...a,
      earned: earnedByCode.has(a.code),
      earnedAt: earnedByCode.get(a.code)?.earned_at ?? null,
      sourceTxHash: earnedByCode.get(a.code)?.source_ref ?? null,
    })),
    activity: activity.map((r) => ({
      txHash: r.tx_hash,
      appId: r.app_id,
      appName: r.name,
      valueLuna: r.value_luna,
      blockHeight: r.block_height,
      timestamp: r.timestamp,
    })),
    /** Last 30 days of activity counts — drives the Pulse Ring waveform. */
    waveform: buildWaveform(address),
  }
})

function buildWaveform(address: string): number[] {
  const days = 30
  const start = Date.parse(`${utcDay(Date.now() - (days - 1) * 86_400_000)}T00:00:00Z`)
  const rows = db
    .prepare(`SELECT timestamp FROM interactions WHERE wallet_address = ? AND timestamp >= ?`)
    .all(address, start) as { timestamp: number }[]

  const buckets = new Array(days).fill(0)
  for (const r of rows) {
    const idx = Math.floor((r.timestamp - start) / 86_400_000)
    if (idx >= 0 && idx < days) buckets[idx]++
  }
  return buckets
}

/* -------------------------------------------------------------- discover -- */

app.get('/discover', { preHandler: requireAuth }, async (req) => {
  const { items, isStarterSet } = feedFor(req.walletAddress!)
  return { items, isStarterSet, generatedAt: now() }
})

app.get('/apps/:id', { preHandler: requireAuth }, async (req, reply) => {
  const { id } = req.params as { id: string }
  const row = db.prepare(`SELECT * FROM apps WHERE id = ? AND status = 'APPROVED'`).get(id) as any
  if (!row) return fail(reply, 404, 'NOT_FOUND', 'That app is no longer listed.')

  const stats = db
    .prepare(`SELECT COUNT(DISTINCT wallet_address) AS payers FROM interactions WHERE app_id = ?`)
    .get(id) as { payers: number }
  const rating = db
    .prepare(`SELECT COUNT(*) AS n, AVG(rating) AS a FROM reviews WHERE app_id = ?`)
    .get(id) as { n: number; a: number | null }

  const paid = db
    .prepare(`SELECT tx_hash, value_luna FROM interactions WHERE wallet_address = ? AND app_id = ? ORDER BY value_luna DESC LIMIT 1`)
    .get(req.walletAddress!, id) as { tx_hash: string; value_luna: number } | undefined

  return {
    appId: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    url: row.url,
    address: row.address,
    deeplink: `nimiqpay://miniapp?url=${row.url}`,
    distinctPayers: stats.payers,
    avgRating: rating.n >= 3 && rating.a !== null ? Math.round(rating.a * 10) / 10 : null,
    reviewCount: rating.n,
    canReview: !!paid && paid.value_luna >= config.minReviewLuna,
    proofTxHash: paid?.tx_hash ?? null,
  }
})

app.get('/registry', async () => ({
  apps: db
    .prepare(`SELECT name, address, url, category, listed_at FROM apps WHERE status='APPROVED' ORDER BY listed_at`)
    .all(),
}))

app.post('/apps', { preHandler: requireAuth }, async (req, reply) => {
  const body = (req.body ?? {}) as Record<string, string>
  const name = (body.name ?? '').trim()
  const url = (body.url ?? '').trim()
  const description = (body.description ?? '').trim()
  const category = (body.category ?? '').trim()
  const rawAddress = (body.address ?? '').trim()

  if (!name || !url || !description || !category || !rawAddress) {
    return fail(reply, 400, 'VALIDATION', 'Fill in every required field.')
  }
  if (!isValidAddress(rawAddress)) {
    return fail(reply, 400, 'BAD_ADDRESS', 'That doesn’t look like a Nimiq address.')
  }
  if (!/^https:\/\//i.test(url)) {
    return fail(reply, 400, 'BAD_URL', 'The app URL must start with https://')
  }
  if (description.length > 100) {
    return fail(reply, 400, 'VALIDATION', 'Keep the description under 100 characters.')
  }

  const address = normaliseAddress(rawAddress)
  const clash = db.prepare(`SELECT name FROM apps WHERE address = ?`).get(address) as
    | { name: string }
    | undefined
  if (clash) {
    return fail(reply, 409, 'DUPLICATE_ADDRESS', `This address is already registered to ${clash.name}.`)
  }

  const id = randomUUID()
  db.prepare(
    `INSERT INTO apps (id, name, address, url, description, category, owner_address, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
  ).run(id, name, address, url, description, category, req.walletAddress!, now())

  return reply.code(201).send({ appId: id, status: 'PENDING' })
})

/* ---------------------------------------------------------------- quests -- */

app.get('/quests/today', { preHandler: requireAuth }, async (req) => {
  const address = req.walletAddress!
  const unlocked = evaluateDerivedQuests(address)
  return { date: utcDay(), quests: questsForWallet(address), unlockedAchievements: unlocked }
})

app.post('/quests/:id/claim', { preHandler: requireAuth }, async (req, reply) => {
  const address = req.walletAddress!
  const { id } = req.params as { id: string }
  const { txHash } = (req.body ?? {}) as { txHash?: string }

  const quest = db.prepare(`SELECT type FROM quests WHERE id = ?`).get(id) as
    | { type: string }
    | undefined
  if (!quest) return fail(reply, 404, 'NOT_FOUND', 'That quest is no longer available.')

  if (quest.type === 'FEATURED_APP') {
    const unlocked = complete(address, id, null)
    return { state: 'COMPLETED', unlockedAchievements: unlocked }
  }

  if (quest.type === 'TIP_JAR') {
    if (!config.tipJarAddress) {
      return fail(reply, 503, 'TIP_JAR_UNSET', 'Tips aren’t set up yet. Check back soon.')
    }
    if (!txHash) return fail(reply, 400, 'VALIDATION', 'That payment didn’t go through.')
    recordClaim(address, id, txHash)

    const check = await verifyPayment(txHash, address, config.tipJarAddress, config.tipJarMinLuna)
    if (!check.ok) {
      // Not a failure yet: the indexer keeps looking as confirmations accrue.
      return reply.code(202).send({ state: 'CONFIRMING', reason: check.reason, retryAfterMs: 4000 })
    }
    const unlocked = complete(address, id, txHash)
    return { state: 'COMPLETED', unlockedAchievements: unlocked }
  }

  // Everything else is derived from indexed state, never from a client claim.
  const unlocked = evaluateDerivedQuests(address)
  const done = db
    .prepare(`SELECT 1 FROM quest_completions WHERE wallet_address = ? AND quest_id = ?`)
    .get(address, id)
  return done
    ? { state: 'COMPLETED', unlockedAchievements: unlocked }
    : reply.code(202).send({ state: 'CONFIRMING', retryAfterMs: 4000 })
})

/* --------------------------------------------------------------- reviews -- */

app.get('/reviews', { preHandler: requireAuth }, async (req) => {
  const { appId } = req.query as { appId?: string }
  const address = req.walletAddress!

  if (appId) {
    return {
      reviews: db
        .prepare(
          `SELECT id, wallet_address, rating, body, updated_at FROM reviews
            WHERE app_id = ? ORDER BY updated_at DESC LIMIT 50`,
        )
        .all(appId)
        .map((r: any) => ({
          id: r.id,
          address: r.wallet_address,
          rating: r.rating,
          body: r.body,
          updatedAt: r.updated_at,
          verified: true,
        })),
    }
  }

  // Apps this wallet may review, and reviews already written.
  const reviewable = db
    .prepare(
      `SELECT a.id AS appId, a.name, MAX(i.value_luna) AS best, MIN(i.tx_hash) AS txHash
         FROM interactions i JOIN apps a ON a.id = i.app_id
        WHERE i.wallet_address = ? AND a.status = 'APPROVED'
        GROUP BY a.id
       HAVING best >= ?`,
    )
    .all(address, config.minReviewLuna) as any[]

  const mine = db
    .prepare(
      `SELECT r.id, r.app_id AS appId, a.name, r.rating, r.body, r.updated_at
         FROM reviews r JOIN apps a ON a.id = r.app_id
        WHERE r.wallet_address = ?`,
    )
    .all(address) as any[]

  const reviewedIds = new Set(mine.map((m) => m.appId))
  return {
    canReview: reviewable.filter((r) => !reviewedIds.has(r.appId)),
    mine,
  }
})

app.post('/reviews', { preHandler: requireAuth }, async (req, reply) => {
  const address = req.walletAddress!
  const { appId, rating, body } = (req.body ?? {}) as { appId?: string; rating?: number; body?: string }

  if (!appId || !rating || rating < 1 || rating > 5) {
    return fail(reply, 400, 'VALIDATION', 'Choose a rating from 1 to 5.')
  }
  if (body && body.length > 280) {
    return fail(reply, 400, 'VALIDATION', 'Keep your review under 280 characters.')
  }

  // Re-checked on write. The client's view of eligibility is only a hint.
  const proof = db
    .prepare(
      `SELECT tx_hash FROM interactions
        WHERE wallet_address = ? AND app_id = ? AND value_luna >= ?
        ORDER BY timestamp LIMIT 1`,
    )
    .get(address, appId, config.minReviewLuna) as { tx_hash: string } | undefined

  if (!proof) {
    return fail(reply, 403, 'REVIEW_NOT_ELIGIBLE', 'Pay this app first to leave a verified review.')
  }

  const existing = db
    .prepare(`SELECT id, version FROM reviews WHERE wallet_address = ? AND app_id = ?`)
    .get(address, appId) as { id: string; version: number } | undefined

  if (existing) {
    db.prepare(`UPDATE reviews SET rating = ?, body = ?, version = ?, updated_at = ? WHERE id = ?`)
      .run(rating, body ?? null, existing.version + 1, now(), existing.id)
  } else {
    db.prepare(
      `INSERT INTO reviews (id, wallet_address, app_id, rating, body, proof_tx_hash, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(randomUUID(), address, appId, rating, body ?? null, proof.tx_hash, now())
    award(address, 'REVIEW', 25, appId)
  }

  const unlocked = recompute(address)
  evaluateDerivedQuests(address)
  return { ok: true, unlockedAchievements: unlocked }
})

/* ------------------------------------------------------------------ boot -- */

await app.listen({ port: config.port, host: '0.0.0.0' })
console.log(`[api] listening on :${config.port} (network ${config.network})`)
console.log(`[api] CORS allowlist: ${config.corsOrigins.join(', ')}`)

if (!config.tipJarAddress) {
  console.warn(
    '[api] TIP_JAR_ADDRESS is not set — tip quests are withheld.\n' +
      '      Set it in pulse-api/.env to an address you control (Nimiq Pay → Receive).',
  )
} else {
  console.log(`[api] tip jar: ${config.tipJarAddress}`)
}
if (config.jwtSecret.startsWith('dev-only')) {
  console.warn('[api] JWT_SECRET is still the development placeholder.')
}

// The chain client takes ~36s to reach consensus. The API serves from SQLite
// immediately and the indexer starts once consensus lands.
startChain()
  .then(() => startIndexer())
  .catch((e) => console.error('[chain] failed to start:', e))
