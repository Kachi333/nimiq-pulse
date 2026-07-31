import { onMounted, ref, shallowRef } from 'vue'
import { cacheRead, cacheWrite } from './store'
import { ApiError } from '../api/client'
import { useWallet } from '../wallet/useWallet'

/**
 * Stale-while-revalidate. Three properties matter, each mapping to a PRD rule:
 *  1. the cache read is synchronous, so the first paint has content (AC1.3)
 *  2. a failed refresh never clears data, so errors degrade to staleness (AC1.4)
 *  3. error and data coexist, so a view shows content *and* a banner
 */
export function useCachedResource<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 5 * 60_000,
) {
  const cached = cacheRead<T>(key)
  const data = shallowRef<T | null>(cached?.data ?? null)
  const isStale = ref(cached ? Date.now() - cached.fetchedAt > ttlMs : false)
  const isRefreshing = ref(false)
  const error = ref<{ kind: string; message: string } | null>(null)

  const { expire } = useWallet()

  async function refresh(): Promise<void> {
    isRefreshing.value = true
    try {
      const fresh = await fetcher()
      data.value = fresh
      cacheWrite(key, fresh)
      isStale.value = false
      error.value = null
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'auth-expired') expire()
      error.value = {
        kind: e instanceof ApiError ? e.kind : 'unknown',
        message: e instanceof Error ? e.message : 'Something went wrong.',
      }
      isStale.value = true // data is deliberately NOT cleared
    } finally {
      isRefreshing.value = false
    }
  }

  onMounted(refresh)

  return { data, isStale, isRefreshing, error, refresh }
}
