import { existsSync } from 'node:fs'

// Node 20.6+ ships .env parsing; no dotenv dependency needed.
if (existsSync('.env')) process.loadEnvFile('.env')

function env(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback
  if (value === undefined) throw new Error(`Missing required env var: ${key}`)
  return value
}

const network = env('NIMIQ_NETWORK', 'mainalbatross')

export const config = {
  port: Number(env('PORT', '8787')),
  network,
  jwtSecret: env('JWT_SECRET', 'dev-only-secret-change-before-deploy'),

  /**
   * Network-scoped by default. Mainnet and testnet interactions must never
   * share tables: a testnet payment proving a mainnet review (or the reverse)
   * would quietly break the product's core claim.
   */
  dbPath: env('DB_PATH', `pulse.${network}.db`),

  /**
   * Where tip-jar quest payments go. Empty means "not configured" — the API
   * withholds tip quests entirely rather than pointing real payments at an
   * address nobody owns.
   */
  tipJarAddress: (process.env.TIP_JAR_ADDRESS ?? '').trim(),
  tipJarMinLuna: Number(env('TIP_JAR_MIN_LUNA', '100000')), // 1 NIM

  /** Minimum payment that unlocks a review. PRD D4 default: 1 NIM. */
  minReviewLuna: Number(env('MIN_REVIEW_LUNA', '100000')),

  /**
   * Blocks behind head before an interaction counts. Two batches (~2 min).
   * Albatross micro-forks resolve well inside this.
   */
  confirmations: Number(env('CONFIRMATIONS', '120')),

  /** Seconds between indexer sweeps of one registry address. */
  indexIntervalSec: Number(env('INDEX_INTERVAL_SEC', '20')),

  /**
   * Explicit allowlist. Never '*' in production — see SECURITY.md §9.
   * The LAN origin belongs here only in development.
   */
  corsOrigins: env('CORS_ORIGINS', 'http://localhost:5173,http://192.168.1.46:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
} as const

export const LUNA_PER_NIM = 100_000
