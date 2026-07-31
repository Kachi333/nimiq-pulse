import { createHash } from 'node:crypto'
import * as Nimiq from '@nimiq/core'
import { config } from './config.js'

/**
 * The chain data source.
 *
 * Verified 31 Jul 2026: an embedded @nimiq/core light client reaches mainnet
 * consensus in ~36s, automatically peers with history nodes (23 of 24 peers in
 * testing), and answers getTransactionsByAddress with full transaction detail
 * in 11–16s. That removes the need for a self-hosted history node or a public
 * RPC endpoint — neither of which was confirmed available.
 *
 * Queries are slow, so nothing user-facing ever awaits one. The indexer runs in
 * the background and the API only ever reads the database.
 */

const TESTNET_SEEDS = [1, 2, 3, 4].map(
  (n) => `/dns4/seed${n}.pos.nimiq-testnet.com/tcp/8443/wss`,
)

let client: Nimiq.Client | null = null
let ready = false
let startedAt = 0

export function chainStatus() {
  return { ready, network: config.network, startedAt }
}

/** Starts the client in the background. The API serves from SQLite meanwhile. */
export async function startChain(): Promise<void> {
  startedAt = Date.now()
  const c = new Nimiq.ClientConfiguration()
  c.network(config.network)
  c.logLevel('error')
  if (config.network === 'testalbatross') c.seedNodes(TESTNET_SEEDS)

  client = await Nimiq.Client.create(c.build())
  await client.waitForConsensusEstablished()
  ready = true
  console.log(`[chain] consensus established in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`)
}

export function isReady(): boolean {
  return ready && client !== null
}

export async function headHeight(): Promise<number> {
  if (!client) throw new Error('chain not started')
  return client.getHeadHeight()
}

/**
 * Payments to `address` at or after `sinceHeight`.
 * Only inbound transfers matter — an app's receiving address is what proves a
 * user paid it.
 */
export async function paymentsTo(
  address: string,
  sinceHeight: number,
  limit = 100,
): Promise<Nimiq.PlainTransactionDetails[]> {
  if (!client) throw new Error('chain not started')
  const txs = await client.getTransactionsByAddress(address, sinceHeight, null, null, limit, 1)
  return txs.filter((tx) => tx.recipient === address)
}

/** Direct lookup — far faster than an address sweep, used for quest claims. */
export async function transactionByHash(
  hash: string,
): Promise<Nimiq.PlainTransactionDetails | null> {
  if (!client) return null
  try {
    return await client.getTransaction(hash)
  } catch {
    return null
  }
}

/** Nimiq user-friendly format: NQ + 2 check digits + 32 base32 chars, in groups of 4. */
export function isValidAddress(input: string): boolean {
  try {
    Nimiq.Address.fromUserFriendlyAddress(input.trim())
    return true
  } catch {
    return false
  }
}

export function normaliseAddress(input: string): string {
  return Nimiq.Address.fromUserFriendlyAddress(input.trim()).toUserFriendlyAddress()
}

/**
 * Nimiq never signs a raw message. The Keyguard prefixes it so a signature can
 * never be replayed as a valid transaction or other on-chain proof:
 *
 *   data   = '\x16Nimiq Signed Message:\n' + <byte length as decimal> + message
 *   signed = SHA256(data)
 *
 * The 23-byte prefix is exposed as HubApi.MSG_PREFIX. Verifying against the raw
 * UTF-8 bytes instead — the obvious-looking implementation — rejects every
 * genuine signature.
 */
const MSG_PREFIX = '\x16Nimiq Signed Message:\n'

function nimiqSignedMessageHash(message: string): Uint8Array {
  const body = Buffer.from(message, 'utf8')
  const data = Buffer.concat([Buffer.from(MSG_PREFIX, 'binary'), Buffer.from(String(body.length), 'utf8'), body])
  return new Uint8Array(createHash('sha256').update(data).digest())
}

/**
 * Verifies a login signature and derives the address from the public key.
 *
 * The address is never taken from the request body — deriving it from the
 * verified key is what makes the identity model sound (SECURITY.md §4).
 */
export function addressFromSignature(
  publicKeyHex: string,
  signatureHex: string,
  message: string,
): string | null {
  let key: Nimiq.PublicKey
  let sig: Nimiq.Signature
  try {
    key = Nimiq.PublicKey.fromHex(publicKeyHex.trim())
    sig = Nimiq.Signature.fromHex(signatureHex.trim())
  } catch {
    return null
  }

  // Prefixed-and-hashed is the documented Nimiq convention. Raw UTF-8 is kept
  // as a fallback in case Nimiq Pay diverges from the Keyguard; both candidates
  // encode our own nonce, so accepting either is safe.
  const candidates: [string, Uint8Array][] = [
    ['nimiq-signed-message', nimiqSignedMessageHash(message)],
    ['raw-utf8', new TextEncoder().encode(message)],
  ]

  for (const [label, data] of candidates) {
    try {
      if (key.verify(sig, data)) {
        if (label !== 'nimiq-signed-message') {
          console.warn(`[auth] signature verified via fallback encoding: ${label}`)
        }
        return key.toAddress().toUserFriendlyAddress()
      }
    } catch {
      // try the next encoding
    }
  }

  return null
}
