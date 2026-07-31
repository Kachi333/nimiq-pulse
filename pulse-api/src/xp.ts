import { db, now, utcDay } from './db.js'
import { randomUUID } from 'node:crypto'

/**
 * XP and achievements are a pure function of persisted rows. Nothing here
 * trusts a client claim; every award traces to an interaction, a quest
 * completion, or a review that already exists in the database.
 */

export const XP = {
  FIRST_APP: 50,
  REPEAT_APP: 5,
  REPEAT_APP_DAILY_CAP: 15,
  REVIEW: 25,
  REGISTRY: 100,
} as const

export type XpKind = 'FIRST_APP' | 'REPEAT_APP' | 'QUEST' | 'REVIEW' | 'STREAK' | 'REGISTRY'

/**
 * Cumulative XP needed to REACH a level. L2=300, L3=600, L5=1500, L10=5500.
 *
 * Level 1 is the starting point, so its threshold is 0 — not the 100 the raw
 * formula produces. Without the special case a new wallet renders "-100 / 200 XP"
 * with a full progress bar, which is exactly what a first-time user sees first.
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return (100 * (level * (level + 1))) / 2
}

export function levelForXp(xp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  return level
}

/** Inserts an XP event. The UNIQUE constraint makes a repeat a no-op. */
export function award(
  walletAddress: string,
  kind: XpKind,
  amount: number,
  sourceRef: string,
): boolean {
  try {
    db.prepare(
      `INSERT INTO xp_events (id, wallet_address, kind, amount, source_ref, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(randomUUID(), walletAddress, kind, amount, sourceRef, now())
    return true
  } catch {
    return false // already awarded — idempotent by constraint (AC2.4)
  }
}

const ACHIEVEMENTS: {
  code: string
  name: string
  condition: string
  test: (a: string) => { earned: boolean; ref?: string }
}[] = [
  {
    code: 'FIRST_STEPS',
    name: 'First Steps',
    condition: 'Pay any listed Mini App',
    test: (a) => {
      const row = db
        .prepare(`SELECT tx_hash FROM interactions WHERE wallet_address = ? ORDER BY timestamp LIMIT 1`)
        .get(a) as { tx_hash: string } | undefined
      return { earned: !!row, ref: row?.tx_hash }
    },
  },
  {
    code: 'EXPLORER',
    name: 'Explorer',
    condition: 'Pay 3 different Mini Apps',
    test: (a) => ({ earned: distinctApps(a) >= 3 }),
  },
  {
    code: 'PATHFINDER',
    name: 'Pathfinder',
    condition: 'Pay 10 different Mini Apps',
    test: (a) => ({ earned: distinctApps(a) >= 10 }),
  },
  {
    code: 'EARLY_ADOPTER',
    name: 'Early Adopter',
    condition: 'Pay an app within 7 days of it being listed',
    test: (a) => {
      const row = db
        .prepare(
          `SELECT i.tx_hash FROM interactions i
             JOIN apps p ON p.id = i.app_id
            WHERE i.wallet_address = ? AND p.listed_at IS NOT NULL
              AND i.timestamp <= p.listed_at + 7 * 86400000
            LIMIT 1`,
        )
        .get(a) as { tx_hash: string } | undefined
      return { earned: !!row, ref: row?.tx_hash }
    },
  },
  {
    code: 'COMMUNITY_BUILDER',
    name: 'Community Builder',
    condition: 'List a Mini App that someone else pays',
    test: (a) => {
      const row = db
        .prepare(
          `SELECT i.tx_hash FROM interactions i
             JOIN apps p ON p.id = i.app_id
            WHERE p.owner_address = ? AND i.wallet_address <> ?
            LIMIT 1`,
        )
        .get(a, a) as { tx_hash: string } | undefined
      return { earned: !!row, ref: row?.tx_hash }
    },
  },
  {
    code: 'CREATOR_SUPPORTER',
    name: 'Creator Supporter',
    condition: 'Complete the tip jar quest 5 times',
    test: (a) => {
      const row = db
        .prepare(
          `SELECT COUNT(*) AS n FROM quest_completions c
             JOIN quests q ON q.id = c.quest_id
            WHERE c.wallet_address = ? AND q.type = 'TIP_JAR'`,
        )
        .get(a) as { n: number }
      return { earned: row.n >= 5 }
    },
  },
  {
    code: 'TRUSTED_VOICE',
    name: 'Trusted Voice',
    condition: 'Publish 3 verified reviews',
    test: (a) => {
      const row = db
        .prepare(`SELECT COUNT(*) AS n FROM reviews WHERE wallet_address = ?`)
        .get(a) as { n: number }
      return { earned: row.n >= 3 }
    },
  },
  {
    code: 'CONSISTENT',
    name: 'Consistent',
    condition: 'Reach a 7-day streak',
    test: (a) => {
      const row = db
        .prepare(`SELECT streak_days FROM wallets WHERE address = ?`)
        .get(a) as { streak_days: number } | undefined
      return { earned: (row?.streak_days ?? 0) >= 7 }
    },
  },
]

export const ACHIEVEMENT_CATALOGUE = ACHIEVEMENTS.map(({ code, name, condition }) => ({
  code,
  name,
  condition,
}))

function distinctApps(address: string): number {
  const row = db
    .prepare(`SELECT COUNT(DISTINCT app_id) AS n FROM interactions WHERE wallet_address = ?`)
    .get(address) as { n: number }
  return row.n
}

/**
 * Recomputes everything derivable for one wallet and returns achievements that
 * were unlocked by this call, so the client can present each exactly once.
 */
export function recompute(walletAddress: string): string[] {
  awardInteractionXp(walletAddress)

  const unlocked: string[] = []
  for (const a of ACHIEVEMENTS) {
    const { earned, ref } = a.test(walletAddress)
    if (!earned) continue
    try {
      db.prepare(
        `INSERT INTO achievements_earned (wallet_address, code, earned_at, source_ref)
         VALUES (?, ?, ?, ?)`,
      ).run(walletAddress, a.code, now(), ref ?? null)
      unlocked.push(a.code)
    } catch {
      // already earned
    }
  }

  const total = (
    db.prepare(`SELECT COALESCE(SUM(amount), 0) AS t FROM xp_events WHERE wallet_address = ?`)
      .get(walletAddress) as { t: number }
  ).t

  db.prepare(`UPDATE wallets SET xp_total = ?, level = ? WHERE address = ?`)
    .run(total, levelForXp(total), walletAddress)

  return unlocked
}

/**
 * Anti-abuse lives here (PRD §11): first-interaction XP is once per (wallet,
 * app); repeats are capped per app per UTC day; and an app owner earns nothing
 * from payments to their own app.
 */
function awardInteractionXp(walletAddress: string): void {
  const rows = db
    .prepare(
      `SELECT i.tx_hash, i.app_id, i.timestamp, i.is_first_for_pair, p.owner_address
         FROM interactions i
         JOIN apps p ON p.id = i.app_id
        WHERE i.wallet_address = ?
        ORDER BY i.timestamp ASC`,
    )
    .all(walletAddress) as {
    tx_hash: string
    app_id: string
    timestamp: number
    is_first_for_pair: number
    owner_address: string | null
  }[]

  const repeatByAppDay = new Map<string, number>()

  for (const row of rows) {
    if (row.owner_address === walletAddress) continue // no self-dealing XP

    if (row.is_first_for_pair) {
      award(walletAddress, 'FIRST_APP', XP.FIRST_APP, row.tx_hash)
      continue
    }

    const bucket = `${row.app_id}:${utcDay(row.timestamp)}`
    const spent = repeatByAppDay.get(bucket) ?? 0
    if (spent >= XP.REPEAT_APP_DAILY_CAP) continue
    if (award(walletAddress, 'REPEAT_APP', XP.REPEAT_APP, row.tx_hash)) {
      repeatByAppDay.set(bucket, spent + XP.REPEAT_APP)
    }
  }
}

/** A streak day is any UTC day with at least one quest completion. */
export function bumpStreak(walletAddress: string): void {
  const today = utcDay()
  const wallet = db
    .prepare(`SELECT streak_days, streak_last_day FROM wallets WHERE address = ?`)
    .get(walletAddress) as { streak_days: number; streak_last_day: string | null } | undefined
  if (!wallet || wallet.streak_last_day === today) return

  const yesterday = utcDay(Date.now() - 86_400_000)
  const streak = wallet.streak_last_day === yesterday ? wallet.streak_days + 1 : 1

  db.prepare(`UPDATE wallets SET streak_days = ?, streak_last_day = ? WHERE address = ?`)
    .run(streak, today, walletAddress)

  award(walletAddress, 'STREAK', 5 * Math.min(streak, 7), today)
}
