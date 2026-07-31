import { randomBytes, randomUUID } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { config } from './config.js'
import { db, now, touchWallet } from './db.js'
import { addressFromSignature } from './chain.js'

const secret = new TextEncoder().encode(config.jwtSecret)
const NONCE_TTL_MS = 5 * 60_000
const SESSION_TTL = '7d'

export interface Challenge {
  nonce: string
  message: string
  expiresAt: number
}

/**
 * The message the wallet signs. Includes the app name so a signature captured
 * here cannot be replayed against a different service.
 */
function challengeMessage(nonce: string): string {
  return `Nimiq Pulse login\nnonce: ${nonce}`
}

export function createChallenge(): Challenge {
  const nonce = randomBytes(24).toString('hex')
  const message = challengeMessage(nonce)
  const expiresAt = now() + NONCE_TTL_MS
  db.prepare(`INSERT INTO auth_nonces (nonce, message, expires_at) VALUES (?, ?, ?)`)
    .run(nonce, message, expiresAt)
  return { nonce, message, expiresAt }
}

export type VerifyResult =
  | { ok: true; address: string; token: string; isNewWallet: boolean }
  | { ok: false; reason: string }

/**
 * Burns the nonce, verifies the signature, and derives the address from the
 * signing public key. The address is never read from the request — that is what
 * stops any client claiming any wallet (SECURITY.md §4).
 */
export async function verifyLogin(
  nonce: string,
  publicKey: string,
  signature: string,
): Promise<VerifyResult> {
  const row = db.prepare(`SELECT message, expires_at, consumed_at FROM auth_nonces WHERE nonce = ?`)
    .get(nonce) as { message: string; expires_at: number; consumed_at: number | null } | undefined

  if (!row) return { ok: false, reason: 'unknown-nonce' }
  if (row.consumed_at) return { ok: false, reason: 'nonce-already-used' }
  if (row.expires_at < now()) return { ok: false, reason: 'nonce-expired' }

  // Burn first: a failed verification must not leave the nonce reusable.
  db.prepare(`UPDATE auth_nonces SET consumed_at = ? WHERE nonce = ?`).run(now(), nonce)

  const address = addressFromSignature(publicKey, signature, row.message)
  if (!address) return { ok: false, reason: 'bad-signature' }

  const existing = db.prepare(`SELECT 1 FROM wallets WHERE address = ?`).get(address)
  touchWallet(address)

  const token = await new SignJWT({ sub: address })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secret)

  return { ok: true, address, token, isNewWallet: !existing }
}

declare module 'fastify' {
  interface FastifyRequest {
    walletAddress?: string
  }
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    reply.code(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Reconnect to keep earning.' } })
    return
  }
  try {
    const { payload } = await jwtVerify(header.slice(7), secret)
    req.walletAddress = String(payload.sub)
    touchWallet(req.walletAddress)
  } catch {
    reply.code(401).send({ error: { code: 'AUTH_EXPIRED', message: 'Reconnect to keep earning.' } })
  }
}

export function cleanupNonces(): void {
  db.prepare(`DELETE FROM auth_nonces WHERE expires_at < ?`).run(now() - NONCE_TTL_MS)
}

export { randomUUID }
