import { db } from './db.js'

/**
 * score = 0.55·co-occurrence + 0.30·trending + 0.15·novelty
 *
 * Novelty is what stops a brand-new listing being invisible — without it the
 * developer promise ("submit and get traffic") would be false for exactly the
 * apps that need it most.
 */

export type Reason = 'POPULAR_WITH_SIMILAR' | 'TRENDING' | 'NEW_THIS_WEEK' | 'STARTER'

export interface FeedItem {
  appId: string
  name: string
  description: string
  category: string
  url: string
  deeplink: string
  distinctPayers: number
  avgRating: number | null
  reviewCount: number
  reason: Reason
}

interface AppRow {
  id: string
  name: string
  description: string
  category: string
  url: string
  listed_at: number | null
}

const WEEK = 7 * 86_400_000
const NOVELTY_FULL = 14 * 86_400_000
const NOVELTY_ZERO = 45 * 86_400_000

function distinctPayers(appId: string): number {
  return (
    db.prepare(`SELECT COUNT(DISTINCT wallet_address) AS n FROM interactions WHERE app_id = ?`)
      .get(appId) as { n: number }
  ).n
}

function trendingCount(appId: string): number {
  return (
    db.prepare(
      `SELECT COUNT(DISTINCT wallet_address) AS n FROM interactions
        WHERE app_id = ? AND timestamp > ?`,
    ).get(appId, Date.now() - WEEK) as { n: number }
  ).n
}

function ratingFor(appId: string): { avg: number | null; count: number } {
  const row = db
    .prepare(`SELECT COUNT(*) AS n, AVG(rating) AS a FROM reviews WHERE app_id = ?`)
    .get(appId) as { n: number; a: number | null }
  // Below 3 reviews the average is withheld, so one voice can't define an app.
  return { avg: row.n >= 3 && row.a !== null ? Math.round(row.a * 10) / 10 : null, count: row.n }
}

/** Wallets that paid any app this wallet paid, and what else they paid. */
function cooccurrence(address: string): { byApp: Map<string, number>; cohort: number } {
  const cohort = db
    .prepare(
      `SELECT DISTINCT other.wallet_address AS w
         FROM interactions mine
         JOIN interactions other ON other.app_id = mine.app_id
        WHERE mine.wallet_address = ? AND other.wallet_address <> ?`,
    )
    .all(address, address) as { w: string }[]

  const byApp = new Map<string, number>()
  if (cohort.length === 0) return { byApp, cohort: 0 }

  const placeholders = cohort.map(() => '?').join(',')
  const rows = db
    .prepare(
      `SELECT app_id, COUNT(DISTINCT wallet_address) AS n
         FROM interactions
        WHERE wallet_address IN (${placeholders})
        GROUP BY app_id`,
    )
    .all(...cohort.map((c) => c.w)) as { app_id: string; n: number }[]

  for (const r of rows) byApp.set(r.app_id, r.n)
  return { byApp, cohort: cohort.length }
}

export function feedFor(address: string, limit = 20): { items: FeedItem[]; isStarterSet: boolean } {
  const used = new Set(
    (db.prepare(`SELECT DISTINCT app_id FROM interactions WHERE wallet_address = ?`).all(address) as {
      app_id: string
    }[]).map((r) => r.app_id),
  )

  const apps = db
    .prepare(`SELECT id, name, description, category, url, listed_at FROM apps WHERE status = 'APPROVED'`)
    .all() as unknown as AppRow[]

  const candidates = apps.filter((a) => !used.has(a.id))
  const { byApp, cohort } = cooccurrence(address)

  const trending = new Map(candidates.map((a) => [a.id, trendingCount(a.id)]))
  const maxTrending = Math.max(1, ...trending.values())

  const scored = candidates.map((app) => {
    const co = cohort > 0 ? Math.min(1, (byApp.get(app.id) ?? 0) / cohort) : 0
    const tr = (trending.get(app.id) ?? 0) / maxTrending

    const age = app.listed_at ? Date.now() - app.listed_at : NOVELTY_ZERO
    const nov = age <= NOVELTY_FULL
      ? 1
      : age >= NOVELTY_ZERO
        ? 0
        : 1 - (age - NOVELTY_FULL) / (NOVELTY_ZERO - NOVELTY_FULL)

    const score = 0.55 * co + 0.3 * tr + 0.15 * nov
    const reason: Reason =
      co > 0 && 0.55 * co >= Math.max(0.3 * tr, 0.15 * nov)
        ? 'POPULAR_WITH_SIMILAR'
        : 0.3 * tr >= 0.15 * nov
          ? 'TRENDING'
          : 'NEW_THIS_WEEK'

    return { app, score, reason, payers: distinctPayers(app.id) }
  })

  // Deterministic: identical inputs must produce identical order (AC1.6).
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      b.payers - a.payers ||
      (b.app.listed_at ?? 0) - (a.app.listed_at ?? 0) ||
      a.app.id.localeCompare(b.app.id),
  )

  const meaningful = scored.filter((s) => s.score > 0)
  const isStarterSet = meaningful.length < 3

  const chosen = isStarterSet
    ? [
        ...scored.filter((s) => apps.find((a) => a.id === s.app.id)),
      ].sort((a, b) => b.payers - a.payers || a.app.name.localeCompare(b.app.name))
    : scored

  const items = chosen.slice(0, limit).map(({ app, reason, payers }) => {
    const { avg, count } = ratingFor(app.id)
    return {
      appId: app.id,
      name: app.name,
      description: app.description,
      category: app.category,
      url: app.url,
      deeplink: `nimiqpay://miniapp?url=${app.url}`,
      distinctPayers: payers,
      avgRating: avg,
      reviewCount: count,
      reason: isStarterSet ? ('STARTER' as Reason) : reason,
    }
  })

  return { items, isStarterSet }
}
