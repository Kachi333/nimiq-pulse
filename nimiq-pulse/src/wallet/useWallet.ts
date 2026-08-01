import { computed, reactive } from 'vue'
import { api } from '../api/endpoints'
import { ApiError } from '../api/client'
import { clearAll, readRaw, writeRaw } from '../cache/store'
import { ProviderError, connectProvider, signMessage } from '../provider'

interface Session {
  token: string
  address: string
}

const state = reactive({
  session: readRaw<Session>('session'), // restored synchronously — no auth flicker
  connecting: false,
  /** Distinguishes "talking to the server" from "your wallet is asking you". */
  phase: null as null | 'reaching' | 'awaiting-approval',
  error: null as { kind: string; message: string } | null,
})

export function useWallet() {
  return {
    state,
    address: computed(() => state.session?.address ?? null),
    isSignedIn: computed(() => !!state.session),
    connect,
    signOut,
    expire,
  }
}

/**
 * One approval dialog. sign() returns the public key, and a Nimiq address is
 * derived from it, so listAccounts() is never needed (ADR-3).
 */
async function connect(): Promise<boolean> {
  state.connecting = true
  state.error = null
  try {
    await connectProvider()
    state.phase = 'reaching'
    const challenge = await api.challenge()

    state.phase = 'awaiting-approval'
    const { publicKey, signature } = await signMessage(challenge.message)

    state.phase = 'reaching'
    const auth = await api.verify(challenge.nonce, publicKey, signature)

    state.session = { token: auth.sessionToken, address: auth.address }
    writeRaw('session', state.session)
    return true
  } catch (error) {
    state.error =
      error instanceof ProviderError
        ? { kind: error.kind, message: error.message }
        : error instanceof ApiError
          ? { kind: error.kind, message: error.message }
          : { kind: 'unknown', message: 'Something went wrong.' }
    return false
  } finally {
    state.connecting = false
    state.phase = null
  }
}

/** Cache is kept: the user still sees their profile while reconnecting. */
function expire(): void {
  state.session = null
  writeRaw('session', null)
}

function signOut(): void {
  state.session = null
  clearAll()
}
