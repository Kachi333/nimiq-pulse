import { randomUUID } from 'node:crypto'
import { config } from './config.js'
import { db, now, utcDay } from './db.js'
import { award, bumpStreak, recompute } from './xp.js'

export type QuestType = 'TIP_JAR' | 'TRY_NEW_APP' | 'FEATURED_APP' | 'WRITE_REVIEW' | 'STARTER'

interface QuestDef {
  type: QuestType
  title: string
  description: string
  xp: number
}

const DEFS: Record<QuestType, QuestDef> = {
  TIP_JAR: { type: 'TIP_JAR', title: 'Send a tip', description: 'Support Pulse with a NIM tip.', xp: 40 },
  TRY_NEW_APP: { type: 'TRY_NEW_APP', title: 'Try a new Mini App', description: 'Pay a Mini App you have not used before.', xp: 30 },
  WRITE_REVIEW: { type: 'WRITE_REVIEW', title: 'Leave a verified review', description: 'Review a Mini App you have paid.', xp: 25 },
  FEATURED_APP: { type: 'FEATURED_APP', title: "Open today's featured app", description: 'Take a look at what is featured today.', xp: 10 },
  STARTER: { type: 'STARTER', title: 'Try any app below', description: 'Pay any Mini App to get started.', xp: 10 },
}

/**
 * TIP_JAR is present every single day. That is what makes NIM usage structural
 * rather than incidental (PRD F3).
 */
const DAILY: QuestType[] = ['TIP_JAR', 'TRY_NEW_APP', 'WRITE_REVIEW', 'FEATURED_APP']

export function ensureTodaysQuests(): void {
  const day = utcDay()
  const featured = db
    .prepare(`SELECT id FROM apps WHERE status = 'APPROVED' ORDER BY listed_at DESC LIMIT 1`)
    .get() as { id: string } | undefined

  for (const type of [...DAILY, 'STARTER' as QuestType]) {
    const def = DEFS[type]
    try {
      db.prepare(
        `INSERT INTO quests (id, quest_date, type, title, description, xp_reward, target_app_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        randomUUID(),
        day,
        def.type,
        def.title,
        def.description,
        def.xp,
        type === 'FEATURED_APP' ? (featured?.id ?? null) : null,
      )
    } catch {
      // already created for today — UNIQUE(quest_date, type)
    }
  }
}

export interface QuestView {
  id: string
  type: QuestType
  title: string
  description: string
  xpReward: number
  targetAppId: string | null
  state: 'available' | 'confirming' | 'completed'
  /**
   * Where a TIP_JAR payment must go. Served by the API so the address has one
   * source of truth — duplicating it in client config guarantees that the two
   * eventually disagree, and a payment to a stale address is unrecoverable.
   */
  payTo?: string
  payMinLuna?: number
}

/**
 * A wallet with no history always gets STARTER so the first session has a
 * completable action; established wallets get the four daily quests.
 */
export function questsForWallet(address: string): QuestView[] {
  ensureTodaysQuests()
  const day = utcDay()

  const hasHistory = !!db
    .prepare(`SELECT 1 FROM interactions WHERE wallet_address = ? LIMIT 1`)
    .get(address)

  const rows = db
    .prepare(`SELECT * FROM quests WHERE quest_date = ?`)
    .all(day) as {
    id: string
    type: QuestType
    title: string
    description: string
    xp_reward: number
    target_app_id: string | null
  }[]

  const visible = rows
    .filter((q) => (hasHistory ? q.type !== 'STARTER' : q.type !== 'TRY_NEW_APP'))
    // Never offer a payment quest that would send real NIM to an unowned
    // address. Better to show one quest fewer than to lose someone's money.
    .filter((q) => q.type !== 'TIP_JAR' || config.tipJarAddress !== '')

  return visible.map((q) => {
    const done = db
      .prepare(`SELECT 1 FROM quest_completions WHERE wallet_address = ? AND quest_id = ?`)
      .get(address, q.id)
    const claimed = db
      .prepare(`SELECT 1 FROM quest_claims WHERE wallet_address = ? AND quest_id = ?`)
      .get(address, q.id)

    return {
      id: q.id,
      type: q.type,
      title: q.title,
      description: q.description,
      xpReward: q.xp_reward,
      targetAppId: q.target_app_id,
      state: done ? 'completed' : claimed ? 'confirming' : 'available',
      ...(q.type === 'TIP_JAR'
        ? { payTo: config.tipJarAddress, payMinLuna: config.tipJarMinLuna }
        : {}),
    }
  })
}

/** Records completion and awards XP. Both are idempotent by constraint. */
export function complete(address: string, questId: string, proofTxHash: string | null): string[] {
  const quest = db.prepare(`SELECT xp_reward FROM quests WHERE id = ?`).get(questId) as
    | { xp_reward: number }
    | undefined
  if (!quest) return []

  try {
    db.prepare(
      `INSERT INTO quest_completions (wallet_address, quest_id, proof_tx_hash, completed_at)
       VALUES (?, ?, ?, ?)`,
    ).run(address, questId, proofTxHash, now())
  } catch {
    return [] // already completed — AC3.5
  }

  award(address, 'QUEST', quest.xp_reward, questId)
  bumpStreak(address)
  return recompute(address)
}

export function recordClaim(address: string, questId: string, txHash: string): void {
  try {
    db.prepare(
      `INSERT INTO quest_claims (wallet_address, quest_id, tx_hash, claimed_at) VALUES (?, ?, ?, ?)`,
    ).run(address, questId, txHash, now())
  } catch {
    db.prepare(
      `UPDATE quest_claims SET tx_hash = ?, claimed_at = ? WHERE wallet_address = ? AND quest_id = ?`,
    ).run(txHash, now(), address, questId)
  }
}

/**
 * Quests whose evidence is already in the database need no transaction hash —
 * the server simply checks whether the condition now holds.
 */
export function evaluateDerivedQuests(address: string): string[] {
  const unlocked: string[] = []
  for (const quest of questsForWallet(address)) {
    if (quest.state !== 'available') continue

    let satisfied = false
    if (quest.type === 'WRITE_REVIEW') {
      satisfied = !!db
        .prepare(`SELECT 1 FROM reviews WHERE wallet_address = ? AND updated_at > ? LIMIT 1`)
        .get(address, Date.parse(`${utcDay()}T00:00:00Z`))
    } else if (quest.type === 'TRY_NEW_APP' || quest.type === 'STARTER') {
      satisfied = !!db
        .prepare(
          `SELECT 1 FROM interactions
            WHERE wallet_address = ? AND is_first_for_pair = 1 AND timestamp > ? LIMIT 1`,
        )
        .get(address, Date.parse(`${utcDay()}T00:00:00Z`))
    }

    if (satisfied) unlocked.push(...complete(address, quest.id, null))
  }
  return unlocked
}
