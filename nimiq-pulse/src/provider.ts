import { getHostLanguage, init } from '@nimiq/mini-app-sdk'
import type { ErrorResponse, NimiqProvider } from '@nimiq/mini-app-sdk'
import { reactive, readonly } from 'vue'

/**
 * The ONLY file permitted to import @nimiq/mini-app-sdk.
 *
 * It enforces three things that cannot be recovered anywhere else:
 *  1. ErrorResponse normalisation — the SDK *resolves* with an error object
 *     instead of rejecting, so a declined approval dialog arrives as a
 *     fulfilled promise. Left alone, a user's "no" reads as success.
 *  2. Approval serialisation — the platform forbids concurrent native dialogs.
 *  3. A single point of substitution for SDK upgrades.
 */

export class ProviderError extends Error {
  kind: string

  constructor(message: string, kind = 'provider') {
    super(message)
    this.name = 'ProviderError'
    this.kind = kind
  }
}

let provider: NimiqProvider | null = null
let approvalInFlight: Promise<unknown> | null = null

const state = reactive({
  status: 'idle' as 'idle' | 'connecting' | 'ready' | 'unavailable',
  consensus: null as boolean | null,
  blockNumber: null as number | null,
})

export const providerState = readonly(state)

/** Never called at module scope — only from a deliberate user action. */
export async function connectProvider(timeout = 10_000): Promise<NimiqProvider> {
  if (provider) return provider
  state.status = 'connecting'
  try {
    provider = await init({ timeout })
    state.status = 'ready'
    void refreshChainState()
    return provider
  } catch (error) {
    state.status = 'unavailable'
    throw new ProviderError(messageOf(error), 'provider-unavailable')
  }
}

export function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ErrorResponse).error?.message === 'string'
  )
}

/** Converts the SDK's resolved-error contract back into a thrown error. */
export async function unwrap<T>(call: Promise<T | ErrorResponse>): Promise<T> {
  const result = await call
  if (isErrorResponse(result)) {
    throw new ProviderError(result.error.message, result.error.type || 'user-declined')
  }
  return result as T
}

/** Serialises approval dialogs. Two at once is a platform violation. */
export async function withApproval<T>(fn: () => Promise<T>): Promise<T> {
  if (approvalInFlight) {
    throw new ProviderError('Finish the open confirmation first.', 'wallet-busy')
  }
  const run = (async () => fn())()
  approvalInFlight = run
  try {
    return await run
  } finally {
    approvalInFlight = null
  }
}

/** Read-only, no dialog — safe to batch. */
export async function refreshChainState(): Promise<void> {
  if (!provider) return
  try {
    const [consensus, blockNumber] = await Promise.all([
      provider.isConsensusEstablished(),
      provider.getBlockNumber(),
    ])
    state.consensus = consensus
    state.blockNumber = blockNumber
  } catch {
    // Non-fatal: these only gate the payment button.
  }
}

export async function signMessage(message: string): Promise<{ publicKey: string; signature: string }> {
  const p = await connectProvider()
  return withApproval(() => unwrap(p.sign(message)))
}

export async function sendPayment(recipient: string, valueLuna: number): Promise<string> {
  const p = await connectProvider()
  return withApproval(() => unwrap(p.sendBasicTransaction({ recipient, value: valueLuna })))
}

/** Nimiq Pay's language, not the device locale. Static for the session. */
export function hostLanguage(): string {
  return getHostLanguage() ?? 'en'
}

export function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message
  return typeof error === 'string' ? error : 'Something went wrong.'
}
