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

export async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean; timeoutMs?: number } = {},
): Promise<T> {
  const { method = 'GET', body, auth = true, timeoutMs = 15_000 } = options

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
