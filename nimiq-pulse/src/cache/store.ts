/**
 * The ONLY file that touches localStorage. One TTL and eviction policy means
 * one place to reason about staleness (STATE_MANAGEMENT.md §9).
 */

const PREFIX = 'pulse:'

interface Entry<T> {
  data: T
  fetchedAt: number
}

export function cacheRead<T>(key: string): Entry<T> | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as Entry<T>) : null
  } catch {
    return null
  }
}

export function cacheWrite<T>(key: string, data: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, fetchedAt: Date.now() }))
  } catch {
    // Quota or private mode — the app works without cache, just less instantly.
  }
}

export function invalidate(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}

/** Cache keys are address-scoped, so a wallet switch can't show stale identity. */
export function clearAll(): void {
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith(PREFIX)) localStorage.removeItem(k)
    }
  } catch {
    /* ignore */
  }
}

export function readRaw<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeRaw<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}
