import { readRaw } from '../cache/store'

/**
 * The ONLY file that calls fetch. Auth, timeout and error mapping are applied
 * uniformly here so no feature can accidentally skip them.
 */

export const API_BASE = import.meta.env.VITE_API_BASE ?? `http://${location.hostname}:8787`

export type ErrorKind =
  | 'network'
  | 'auth-expired'
  | 'not-eligible'
  | 'validation'
  | 'server'
  | 'unknown'

export class ApiError extends Error {
  kind: ErrorKind
  code?: string

  constructor(kind: ErrorKind, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.code = code
  }
}

interface Session {
  token: string
  address: string
}

function token(): string | null {
  return readRaw<Session>('session')?.token ?? null
}

function kindFor(status: number): ErrorKind {
  if (status === 401) return 'auth-expired'
  if (status === 403) return 'not-eligible'
  if (status === 400 || status === 409) return 'validation'
  if (status >= 500) return 'server'
  return 'unknown'
}

const RETRIES = 3
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Backoff with jitter: 1s, 2s, 4s (ERROR_HANDLING.md §6).
 * Jitter stops every client that saw the same outage retrying in lockstep.
 */
function backoffMs(attempt: number): number {
  const base = 1000 * 2 ** attempt
  return base * (0.8 + Math.random() * 0.4)
}

async function attempt<T>(
  path: string,
  method: string,
  body: unknown,
  auth: boolean,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['content-type'] = 'application/json'
  if (auth) {
    const t = token()
    if (t) headers.authorization = `Bearer ${t}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })
  } catch {
    throw new ApiError('network', 'Couldn’t reach Pulse right now.')
  } finally {
    clearTimeout(timer)
  }

  if (response.status === 204) return undefined as T

  let payload: any = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    // Server messages arrive already written in the interface voice, so they
    // are surfaced as-is rather than reworded here (COPY_GUIDE.md).
    throw new ApiError(
      kindFor(response.status),
      payload?.error?.message ?? 'Pulse is having trouble. Try again in a moment.',
      payload?.error?.code,
    )
  }

  return payload as T
}

export async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean; timeoutMs?: number } = {},
): Promise<T> {
  // 30s per attempt: a sleeping free-tier instance takes 30-60s to wake, and a
  // short timeout would abandon a request that was about to succeed.
  const { method = 'GET', body, auth = true, timeoutMs = 30_000 } = options

  let lastError: ApiError | undefined

  for (let i = 0; i < RETRIES; i++) {
    try {
      return await attempt<T>(path, method, body, auth, timeoutMs)
    } catch (error) {
      if (!(error instanceof ApiError)) throw error

      // Only transient failures are retried. A declined approval, a validation
      // error or an ineligible review are answers, not outages — retrying them
      // would be the behaviour of a scam app.
      if (error.kind !== 'network' && error.kind !== 'server') throw error

      lastError = error
      if (i < RETRIES - 1) await sleep(backoffMs(i))
    }
  }

  throw lastError ?? new ApiError('unknown', 'Something went wrong.')
}
