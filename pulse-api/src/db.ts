import { DatabaseSync } from 'node:sqlite'
import { config } from './config.js'

export const db = new DatabaseSync(config.dbPath)

db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

/**
 * Every idempotency guarantee in the PRD is a constraint here, not application
 * logic (software_architecture.md ADR-5). Reindexing, double-taps and retries
 * are then safe by construction rather than by care.
 */
db.exec(`
CREATE TABLE IF NOT EXISTS wallets (
  address          TEXT PRIMARY KEY,
  first_seen_at    INTEGER NOT NULL,
  last_active_at   INTEGER NOT NULL,
  xp_total         INTEGER NOT NULL DEFAULT 0,
  level            INTEGER NOT NULL DEFAULT 1,
  streak_days      INTEGER NOT NULL DEFAULT 0,
  streak_last_day  TEXT,
  device_id_hash   TEXT
);

CREATE TABLE IF NOT EXISTS apps (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  address       TEXT NOT NULL UNIQUE,          -- enforces AC5.3
  url           TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL,
  owner_address TEXT,
  status        TEXT NOT NULL DEFAULT 'PENDING',
  is_starter    INTEGER NOT NULL DEFAULT 0,
  listed_at     INTEGER,
  index_cursor  INTEGER NOT NULL DEFAULT 0,
  indexed_at    INTEGER,
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS interactions (
  tx_hash           TEXT PRIMARY KEY,          -- idempotency anchor
  wallet_address    TEXT NOT NULL,
  app_id            TEXT NOT NULL,
  value_luna        INTEGER NOT NULL,
  block_height      INTEGER NOT NULL,
  timestamp         INTEGER NOT NULL,
  is_first_for_pair INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (app_id) REFERENCES apps(id)
);
CREATE INDEX IF NOT EXISTS ix_int_wallet ON interactions (wallet_address, app_id);
CREATE INDEX IF NOT EXISTS ix_int_app    ON interactions (app_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS xp_events (
  id             TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  kind           TEXT NOT NULL,
  amount         INTEGER NOT NULL,
  source_ref     TEXT NOT NULL,
  created_at     INTEGER NOT NULL,
  UNIQUE (wallet_address, kind, source_ref)    -- makes XP idempotent (AC2.4)
);

CREATE TABLE IF NOT EXISTS achievements_earned (
  wallet_address TEXT NOT NULL,
  code           TEXT NOT NULL,
  earned_at      INTEGER NOT NULL,
  source_ref     TEXT,
  PRIMARY KEY (wallet_address, code)
);

CREATE TABLE IF NOT EXISTS quests (
  id            TEXT PRIMARY KEY,
  quest_date    TEXT NOT NULL,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  xp_reward     INTEGER NOT NULL,
  target_app_id TEXT,
  UNIQUE (quest_date, type)
);

CREATE TABLE IF NOT EXISTS quest_completions (
  wallet_address TEXT NOT NULL,
  quest_id       TEXT NOT NULL,
  proof_tx_hash  TEXT,
  completed_at   INTEGER NOT NULL,
  PRIMARY KEY (wallet_address, quest_id)       -- idempotent per AC3.5
);

CREATE TABLE IF NOT EXISTS quest_claims (
  wallet_address TEXT NOT NULL,
  quest_id       TEXT NOT NULL,
  tx_hash        TEXT NOT NULL,
  claimed_at     INTEGER NOT NULL,
  PRIMARY KEY (wallet_address, quest_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id             TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  app_id         TEXT NOT NULL,
  rating         INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body           TEXT,
  proof_tx_hash  TEXT NOT NULL,
  version        INTEGER NOT NULL DEFAULT 1,
  updated_at     INTEGER NOT NULL,
  UNIQUE (wallet_address, app_id),             -- one review per wallet per app
  FOREIGN KEY (app_id) REFERENCES apps(id)
);

CREATE TABLE IF NOT EXISTS auth_nonces (
  nonce      TEXT PRIMARY KEY,
  message    TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER
);
`)

export function now(): number {
  return Date.now()
}

export function utcDay(ts = Date.now()): string {
  return new Date(ts).toISOString().slice(0, 10)
}

export function touchWallet(address: string): void {
  db.prepare(
    `INSERT INTO wallets (address, first_seen_at, last_active_at)
     VALUES (?, ?, ?)
     ON CONFLICT(address) DO UPDATE SET last_active_at = excluded.last_active_at`,
  ).run(address, now(), now())
}
